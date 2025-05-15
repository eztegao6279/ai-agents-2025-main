import { test, expect } from '@playwright/test';

test('TC007 - Verify visual testing guide accessibility', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a.nav-link:has-text("Getting Started")');
  await expect(page).toHaveURL('https://dronjo.wopee.io/getting-started.html');
  const steps = await page.locator('ul.list-unstyled li');
  expect(steps.count()).toBeGreaterThan(0);
});