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

  if (entry.reportId) {
    await modal.getByLabel('Meldungsnummer manuell').click();
    await modal.getByRole('spinbutton', { name: 'Meldungsnummer' }).fill(entry.reportId);
  }

  await modal.getByLabel('Absender').fill(entry.deliverer ?? 'Absender');
  await modal.getByLabel('Empfänger').fill(entry.receiver ?? 'Empfänger');
  await modal.getByLabel('Zeit').fill(entry.time ?? '12:00');
  await modal.getByTestId('communicationDevice').click();
  await modal.getByRole('option', { name: entry.communicationDevice ?? 'E-Mail' }).click();
  await modal.getByLabel('Nummer / Kanal').fill(entry.numberOrChannel ?? 'testtest');
  await modal.getByLabel('Betreff').fill(entry.subject ?? 'Betreff');
  await modal.locator('app-text-area-with-address-search .ql-container').click();
  await modal.locator('app-text-area-with-address-search .ql-editor').fill(entry.content ?? 'Inhalt');
  await modal.getByLabel('Visum').fill(entry.visum ?? 'test');

  await page.waitForTimeout(500);

  const journalResponse = page.waitForResponse(/api\/journal-entries/);
  await modal.getByRole('button', { name: 'Erfassen' }).click();
  await journalResponse;
  await modal.getByRole('button', { name: 'Schliessen' }).click();

  await expect(page.locator('tbody').getByRole('row')).toHaveCount(rowCount + 1);
  await expect(modal).not.toBeVisible();
}

test.describe('Journal', () => {
  test.beforeEach(async ({ page }) => {
    const journalEntriesResponse = page.waitForResponse(/api\/journal-entries/);
    await login(page);
    await page.locator('mat-list-item', { hasText: 'e2e test' }).first().click();
    const nameDialog = page.getByRole('dialog');
    await nameDialog.getByRole('textbox').fill('Guest');
    await nameDialog.getByRole('button', { name: 'OK' }).click();
    await page.waitForSelector('#map', { state: 'visible' });
    await page.waitForTimeout(500);
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
