import { chromium, FullConfig } from '@playwright/test';
import { login } from './util';

async function globalSetup(config: FullConfig) {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const page = await browser.newPage({ baseURL });
  page.setDefaultNavigationTimeout(90000);
  await login(page);
  await page.getByRole('button', { name: 'Neues Ereignis' }).click();
  await page.getByText('Bearbeiten').waitFor();
  await page.getByPlaceholder('Name eingeben').fill('e2e test');
  await page.getByPlaceholder('Beschreibung eingeben').fill('e2e test');
  await page.getByTestId('operation-save').click();
  await page.waitForResponse(/api\/operations/);
  await browser.close();

  return async () => {
    const browser = await chromium.launch();
    const page = await browser.newPage({ baseURL });
    await login(page);
    
    const archiveButton = page.locator('.operation-list-item', { hasText: 'e2e test' }).first().getByRole('button', { name: 'More options' });
    await archiveButton.waitFor({ state: 'visible' });
    await archiveButton.click();
    const archiveMenuItem = page.getByRole('menuitem', { name: 'Ereignis Archivieren' });
    await archiveMenuItem.waitFor({ state: 'visible' });
    await archiveMenuItem.click();
    
    await page.getByRole('button', { name: 'Archivierte Ereignise anzeigen' }).click();
    await page.waitForResponse(/api\/operations\/overview\?phase=archived/);
    
    await page.waitForTimeout(500);
    
    const deleteButton = page.locator('.operation-list-item', { hasText: 'e2e test' }).first().getByRole('button', { name: 'More options' });
    await deleteButton.waitFor({ state: 'visible' });
    await deleteButton.click();
    const deleteMenuItem = page.getByRole('menuitem', { name: 'Ereignis löschen' });
    await deleteMenuItem.waitFor({ state: 'visible' });
    await deleteMenuItem.click();
    await page.getByRole('button', { name: 'Bestätigen' }).click();
    await page.waitForResponse(/api\/operations/);
  };
}

export default globalSetup;
