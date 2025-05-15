import { test, expect } from '@playwright/test';

test('TC008 - Verify 404 error page display', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/non-existent-page');
  const errorMessage = await page.textContent('h1');
  expect(errorMessage).toContain('404');
  const returnHomeLink = await page.$('a:has-text("Return Home")');
  expect(returnHomeLink).not.toBeNull();
});