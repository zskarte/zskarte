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

  if (entry.reportId) {
    await page.getByLabel('Meldungsnummer manuell').click();
    await page.getByRole('spinbutton', { name: 'Meldungsnummer' }).fill(entry.reportId);
  }
  const modal = page.locator('app-journal-entry-create-modal');
  await modal.waitFor({ state: 'visible' });

  await page.getByLabel('Absender').fill(entry.deliverer ?? 'Absender');
  await page.getByLabel('Empfänger').fill(entry.receiver ?? 'Empfänger');
  await page.getByLabel('Zeit').fill(entry.time ?? '12:00');
  await page.getByTestId('communicationDevice').click();
  await page.getByRole('option', { name: entry.communicationDevice ?? 'E-Mail' }).click();
  await page.getByLabel('Nummer / Kanal').fill(entry.numberOrChannel ?? 'testtest');
  await page.getByLabel('Betreff').fill(entry.subject ?? 'Betreff');
  await page.locator('app-text-area-with-address-search .ql-container').click();
  await page.locator('app-text-area-with-address-search .ql-editor').fill(entry.content ?? 'Inhalt');
  await page.getByLabel('Visum').fill(entry.visum ?? 'test');

  const saveButton = page.getByRole('button', { name: 'Erfassen' });
  await saveButton.waitFor({ state: 'visible' });
  await saveButton.waitFor({ state: 'attached' });
  await page.waitForTimeout(500);
  await saveButton.click();
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
    const id = random(1, 99).toString();
    await createJournalEntry({ reportId: id }, page);
    
    const rows = page.locator('tbody').getByRole('row');
    const rowCount = await rows.count();
    const firstRow = rows.first();
    await expect(firstRow.getByRole('cell').first()).toHaveText(id);
    await expect(firstRow.getByRole('cell').nth(1)).toHaveText('Betreff');
    await expect(firstRow.getByRole('cell').nth(2)).toHaveText('Inhalt');
    await expect(firstRow.getByRole('cell').nth(4)).toHaveText('Triage');
    await expect(firstRow.getByRole('cell').nth(5)).toHaveText('Triage');

    await createJournalEntry({ subject: 'Second entry' }, page);
    
    await expect(rows).toHaveCount(rowCount + 1);
    const secondEntryRow = rows.filter({ hasText: 'Second entry' }).first();
    await expect(secondEntryRow).toBeVisible();
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
