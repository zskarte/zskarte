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

  // Content field is broken and takes a while to update its validity
  await page.waitForTimeout(500);

  await page.getByRole('button', { name: 'Speichern' }).click();
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
    await expect(page.locator('tbody').getByRole('row')).toHaveCount(1);
    await expect(page.locator('tbody').getByRole('cell').first()).toHaveText('10');
    await expect(page.locator('tbody').getByRole('cell').nth(1)).toHaveText('Betreff');
    await expect(page.locator('tbody').getByRole('cell').nth(2)).toHaveText('Inhalt');
    await expect(page.locator('tbody').getByRole('cell').nth(4)).toHaveText('Triage');
    await expect(page.locator('tbody').getByRole('cell').nth(5)).toHaveText('Triage');

    await createJournalEntry({}, page);
    await expect(page.locator('tbody').getByRole('row')).toHaveCount(2);
    await expect(page.locator('tbody').getByRole('cell').first()).toHaveText('11');
  });

  test('should draw journal entry', async ({ page }) => {
    await createJournalEntry({ subject: 'To draw' }, page);

    await page.getByRole('tab', { name: 'Karte' }).click();
    await page.getByRole('button', { name: 'Journal' }).click();
    await page.getByTestId('entry-to-draw').first().click();
    await page.getByRole('button', { name: 'Mit Zeichnen beginnen' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('cell', { name: 'ABC Dekontaminationsstelle' }).click();
    await clickOnMap(page, { x: 659, y: 250 });
    await page.getByRole('button', { name: 'Als gezeichnet markieren' }).click();

    await expect(page.getByTestId('entry-drawn')).toHaveCount(1);
  })
});

