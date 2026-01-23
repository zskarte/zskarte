import { test, expect } from '@playwright/test';
import { clickOnMap, dblclickOnMap, login } from './util';


test.describe('Drawing', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.locator('mat-list-item', { hasText: 'e2e test' }).first().click();
    // type guest name and click ok
    const nameDialog = page.getByRole('dialog');
    await nameDialog.getByRole('textbox').fill('Guest');
    await nameDialog.getByRole('button', { name: 'OK' }).click();
    await page.waitForSelector('#map', { state: 'visible' });
    await page.waitForTimeout(500);
  });

  test('add symbol', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('cell', { name: 'ABC Dekontaminationsstelle' }).click();
    await clickOnMap(page, { x: 659, y: 250 });
    await expect(page.locator('app-selected-feature')).toBeVisible();
    await expect(page.getByText('ABC Dekontaminationsstelle')).toBeVisible();
  });

  test('add polygon', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Polygon' }).click();
    await clickOnMap(page, { x: 340, y: 160 });
    await clickOnMap(page, { x: 350, y: 180 });
    await clickOnMap(page, { x: 340, y: 180 });
    await dblclickOnMap(page, { x: 340, y: 160 });
    await expect(page.locator('app-selected-feature')).toBeVisible();
  });

  test('add line', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Linie' }).click();
    await clickOnMap(page, { x: 700, y: 400 });
    await dblclickOnMap(page, { x: 700, y: 600 });
    await expect(page.locator('app-selected-feature')).toBeVisible();
  });

  test('add text', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Text' }).click();
    await page.waitForSelector('app-text-dialog', { state: 'visible' });
    await page.getByPlaceholder('Ihr Text').fill('A TEST');
    await page.getByRole('button', { name: 'OK' }).click();
    await clickOnMap(page, { x: 700, y: 400 });
    await dblclickOnMap(page, { x: 600, y: 400 });
    await expect(page.locator('app-selected-feature')).toBeVisible();
    await expect(page.getByLabel('Name')).toHaveValue('A TEST');
  });


  test('add rectangle', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Rechteck' }).click();
    await clickOnMap(page, { x: 400, y: 400 });
    await dblclickOnMap(page, { x: 800, y: 600 });
    await expect(page.locator('app-selected-feature')).toBeVisible();
  });


  test('add circle', async ({ page }) => {
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('button', { name: 'Kreis' }).click();
    await clickOnMap(page, { x: 500, y: 400 });
    await dblclickOnMap(page, { x: 900, y: 600 });
    await expect(page.locator('app-selected-feature')).toBeVisible();
  });

  test('add and delete layer', async ({page}) => {
    // Add layer
    const layerName = 'test_' + Date.now();

    await page.getByRole('button', { name: 'Ebenen' }).click();
    await page.getByRole('button', { name: 'Zeichnungsebene' }).click();
    await page.getByRole('button', { name: 'Zeichnungsebene hinzufügen' }).click();
    await page.getByRole('textbox', { name: 'Name' }).fill(layerName);
    await page.getByRole('button', { name: 'OK' }).click();
    await page.getByRole('radio', { name: layerName }).check();

    // Draw element
    await page.getByRole('button', { name: 'Add' }).click();
    await page.getByRole('cell', { name: 'ABC Dekontaminationsstelle' }).click();
    await clickOnMap(page, { x: 659, y: 250 });
    await page.locator('.mat-drawer-animating').waitFor({ state: 'hidden' });
    await page.getByRole('button', { name: 'Schliessen' }).click();
    await page.locator('.mat-drawer-animating').waitFor({ state: 'hidden' });

    // Delete layer
    await page.getByRole('button', { name: 'Ebenen' }).click();
    await page.getByRole('button', { name: 'Filter', exact: true }).click();
    await page.getByRole('button', { name: 'Zeichnungsebene' }).click();

    // Filter should be visible
    await expect(page.getByRole('button', { name: 'ABC Dekontaminationsstelle' })).toBeVisible();

    await page.getByRole('radio', { name: layerName }).check();
    await page.getByRole('button', { name: 'Ebene löschen' }).click();
    await page.getByRole('button', { name: 'Bestätigen' }).click();

    // Filter should be gone (since element is gone)
    await expect(page.getByRole('button', { name: 'ABC Dekontaminationsstelle' })).not.toBeVisible();
  });
});
