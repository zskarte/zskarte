import { test, expect, Page } from '@playwright/test';
import { clickOnMap, login } from './util';
import { random } from 'lodash';

interface JournalEntry {
  reportId?: string;
  deliverer?: string;
  receiver?: string;
  time?: string;
  communicationDevice?: string;
  numberOrChannel?: string;
  subject?: string;
  content?: string;
  visum?: string;
}

async function createJournalEntry(entry: JournalEntry, page: Page) {
  const rowCount = await page.locator('tbody').getByRole('row').count();

  await page.getByRole('tab', { name: 'Journal' }).click();
  await page.getByRole('button', { name: 'Add' }).click();

  const modal = page.locator('app-journal-entry-create-modal');
  await modal.waitFor({ state: 'visible' });

  const modalContent = modal.locator('.modal-content');

  const senderInput = modalContent.getByLabel('Absender');
  await senderInput.scrollIntoViewIfNeeded();
  await senderInput.fill(entry.deliverer ?? 'Absender');

  const receiverInput = modalContent.getByLabel('Empfänger');
  await receiverInput.scrollIntoViewIfNeeded();
  await receiverInput.fill(entry.receiver ?? 'Empfänger');

  const timeInput = modalContent.getByLabel('Zeit');
  await timeInput.scrollIntoViewIfNeeded();
  await timeInput.fill(entry.time ?? '12:00');

  const communicationSelect = modalContent.locator('mat-select[formcontrolname="communicationType"]');
  await communicationSelect.scrollIntoViewIfNeeded();
  await communicationSelect.locator('.mat-mdc-select-trigger').click({ force: true });
  const communicationOption = page.locator('.cdk-overlay-container mat-option').getByText(entry.communicationDevice ?? 'E-Mail');
  await communicationOption.waitFor({ state: 'visible' });
  await communicationOption.click();

  const channelInput = modalContent.getByLabel('Nummer / Kanal');
  await channelInput.scrollIntoViewIfNeeded();
  await channelInput.fill(entry.numberOrChannel ?? 'testtest');

  const subjectInput = modalContent.getByLabel('Betreff');
  await subjectInput.scrollIntoViewIfNeeded();
  await subjectInput.fill(entry.subject ?? 'Betreff');

  const messageEditor = modalContent.locator('app-text-area-with-address-search .ql-editor');
  await messageEditor.scrollIntoViewIfNeeded();
  await messageEditor.dblclick();
  await messageEditor.type(entry.content ?? 'Inhalt');
  await page.waitForTimeout(600);

  const visaInput = modalContent.getByLabel('Visum');
  await visaInput.scrollIntoViewIfNeeded();
  await visaInput.fill(entry.visum ?? 'test');

  const saveButton = modalContent.getByRole('button', { name: 'Erfassen' });
  await saveButton.scrollIntoViewIfNeeded();
  await saveButton.waitFor({ state: 'visible' });
  await expect(saveButton).toBeEnabled({ timeout: 5000 });
  const saveResponsePromise = page.waitForResponse((response) => {
    return response.url().includes('/api/journal-entries') && response.request().method() === 'POST';
  });
  await saveButton.click();
  await saveResponsePromise;
  const snackbarLabel = page.locator('mat-snack-bar-container .mat-mdc-snack-bar-label');
  await expect(snackbarLabel.last()).toContainText(/Eintrag #\d+ erfasst\./);
  
  await expect(page.locator('tbody').getByRole('row')).toHaveCount(rowCount + 1);
  await page.locator('.journal-sidebar').getByRole('button', { name: 'Schliessen' }).click();

  await expect(page.locator('.journal-sidebar')).not.toBeVisible();
}

test.describe('Journal', () => {
  test.beforeEach(async ({ page }) => {
    const journalEntriesResponse = page.waitForResponse(/api\/journal-entries/);
    await login(page);
    await page.locator('mat-list-item', { hasText: 'e2e test' }).first().click();
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('tab', { name: 'Journal' }).click();
    await journalEntriesResponse;
  });

  test('should add journal entry', async ({ page }) => {
    const rows = page.locator('tbody').getByRole('row');
    const initialRowCount = await rows.count();

    await createJournalEntry({ subject: 'First entry' }, page);
    
    const firstEntryRow = rows.filter({ hasText: 'First entry' }).first();
    await expect(firstEntryRow).toBeVisible();
    await expect(firstEntryRow.getByRole('cell').nth(2)).toHaveText('Inhalt');
    await expect
      .poll(async () => rows.count(), { timeout: 10000 })
      .toBeGreaterThan(initialRowCount);

    await createJournalEntry({ subject: 'Second entry' }, page);
    
    const secondEntryRow = rows.filter({ hasText: 'Second entry' }).first();
    await expect(secondEntryRow).toBeVisible();
    await expect
      .poll(async () => rows.count(), { timeout: 10000 })
      .toBeGreaterThan(initialRowCount + 1);
  });

  test('should draw journal entry', async ({ page }) => {
    await createJournalEntry({ subject: 'To draw' }, page);

    await page.getByRole('tab', { name: 'Karte' }).click();
    await page.getByRole('button', { name: 'Journal' }).click();
    
    await page.waitForSelector('mat-tab-group', { state: 'visible' });
    await page.waitForSelector('mat-spinner', { state: 'hidden' }).catch(() => {});
    
    await page.getByTestId('entry-to-draw').filter({ hasText: 'To draw' }).first().click();
    await page.getByRole('button', { name: 'Signatur hinzufügen' }).click();
    
    await page.waitForSelector('.journal-sidebar', { state: 'hidden' }).catch(() => {});
    await page.waitForSelector('app-journal-draw-overlay', { state: 'visible' });
    
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('cell', { name: 'ABC Dekontaminationsstelle' }).click();
    await clickOnMap(page, { x: 659, y: 250 });
    
    await page.getByRole('button', { name: 'Als done markieren' }).click();
    await page.waitForResponse(/api\/journal-entries/);
  })
});
