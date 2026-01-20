import { test, expect, Page } from '@playwright/test';
import { clickOnMap, login } from './util';

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
  await page.getByRole('tab', { name: 'Journal' }).click();
  await page.getByRole('button', { name: 'Add' }).click();

  if (entry.reportId) {
    await page.getByLabel('Meldungsnummer manuell').click();
    await page.getByRole('spinbutton', { name: 'Meldungsnummer' }).fill(entry.reportId);
  }
  await page.getByLabel('Absender').fill(entry.deliverer ?? 'Absender');
  await page.getByLabel('Empfänger').fill(entry.receiver ?? 'Empfänger');
  await page.getByLabel('Zeit').fill(entry.time ?? '12:00');
  await page.getByLabel('Kommunikationsmittel').click();
  await page.getByRole('option', { name: entry.communicationDevice ?? 'E-Mail' }).click();
  await page.getByLabel('Nummer / Kanal').fill(entry.numberOrChannel ?? 'testtest');
  await page.getByLabel('Betreff').fill(entry.subject ?? 'Betreff');
  await page.locator('app-text-area-with-address-search .ql-container').click();
  await page.locator('app-text-area-with-address-search .ql-editor').fill(entry.content ?? 'Inhalt');
  await page.getByLabel('Visum').fill(entry.visum ?? 'test');

  const saveButton = page.getByRole('button', { name: 'Speichern' });
  await saveButton.waitFor({ state: 'visible' });
  await saveButton.waitFor({ state: 'attached' });
  await page.waitForTimeout(500);
  await saveButton.click();
  await page.waitForResponse(/api\/journal-entries/);
  await page.getByRole('button', { name: 'Schliessen' }).click();

  await expect(page.locator('.journal-sidebar')).not.toBeVisible();
}

test.describe('Journal', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('mat-list-item', { hasText: 'e2e test' }).first().click();
    await page.getByRole('button', { name: 'OK' }).click();
  });

  test('should add journal entry', async ({ page }) => {
    await createJournalEntry({ reportId: '10' }, page);
    
    const rows = page.locator('tbody').getByRole('row');
    const rowCount = await rows.count();
    const firstRow = rows.first();
    await expect(firstRow.getByRole('cell').first()).toHaveText('10');
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
    
    // Wait for journal to load and tab group to be visible
    await page.waitForSelector('mat-tab-group', { state: 'visible' });
    // Wait for loading to complete
    await page.waitForSelector('mat-spinner', { state: 'hidden' }).catch(() => {});
    
    const entryPanel = page.getByTestId('entry-to-draw').filter({ hasText: 'To draw' }).first();
    await entryPanel.waitFor({ state: 'visible' });
    await entryPanel.click();
    
    const addSignatureButton = page.getByRole('button', { name: 'Signatur hinzufügen' });
    await addSignatureButton.waitFor({ state: 'visible' });
    await addSignatureButton.click();
    
    // Wait for sidebar to close and journal-draw-overlay to appear
    await page.waitForSelector('.journal-sidebar', { state: 'hidden' }).catch(() => {});
    await page.waitForSelector('app-journal-draw-overlay', { state: 'visible' });
    
    // Wait for Add button to be enabled (wait for it to not be disabled)
    const addButton = page.getByRole('button', { name: 'Add' });
    await addButton.waitFor({ state: 'visible' });
    // Wait for the button to be enabled by checking it's not disabled
    await expect(addButton).toBeEnabled({ timeout: 10000 });
    await addButton.click();
    
    await page.getByRole('cell', { name: 'ABC Dekontaminationsstelle' }).click();
    await clickOnMap(page, { x: 659, y: 250 });
    
    const markAsDrawnButton = page.getByRole('button', { name: 'Als gezeichnet markieren' });
    await markAsDrawnButton.waitFor({ state: 'visible' });
    await markAsDrawnButton.click();

    // Wait for API response after marking as drawn
    await page.waitForResponse(/api\/journal-entries/);
    await page.waitForSelector('.journal-sidebar', { state: 'hidden' }).catch(() => {});
    await page.getByRole('button', { name: 'Journal' }).click();
    
    // Wait for journal to load and tab group to be visible
    await page.waitForSelector('mat-tab-group', { state: 'visible' });
    // Wait for loading to complete
    await page.waitForSelector('mat-spinner', { state: 'hidden' }).catch(() => {});
    
    const doneTab = page.getByRole('tab', { name: 'Done' });
    await doneTab.waitFor({ state: 'visible' });
    await doneTab.click();
    
    const drawnEntry = page.getByTestId('entry-drawn').first();
    await drawnEntry.waitFor({ state: 'visible' });
    
    await expect(page.getByTestId('entry-drawn')).toHaveCount(1);
    await expect(drawnEntry).toContainText('To draw');
    
    await expect(page.getByTestId('entry-to-draw')).toHaveCount(0);
  })
});

