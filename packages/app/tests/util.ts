import { Page } from '@playwright/test';

export async function login(page: Page) {
  await page.goto('./login');
  await page.getByRole('button', { name: 'Als Gast fortfahren' }).click();
  await page.getByRole('button', { name: 'Bestätigen' }).click();
  await page.waitForResponse(/api\/operations/);
}

export async function clickOnMap(page: Page, position: { x: number; y: number }) {
  await page.waitForTimeout(100);
  await page.locator('#map canvas').last().click({ position });
}

export async function dblclickOnMap(page: Page, position: { x: number; y: number }) {
  await page.waitForTimeout(100);
  await page.locator('#map canvas').last().dblclick({ position });
}