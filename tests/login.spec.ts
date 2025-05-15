import { test, expect } from '@playwright/test';

test('TC009 - Verify GitHub login functionality', async ({ page }) => {
  await page.goto('https://cmd.wopee.io/login');
  await page.click('button:has-text("GitHub")');
  // Assume successful login and redirect
  await expect(page).toHaveURL('https://cmd.wopee.io/dashboard');
});

test('TC010 - Verify GitLab login functionality', async ({ page }) => {
  await page.goto('https://cmd.wopee.io/login');
  await page.click('button:has-text("GitLab")');
  // Assume successful login and redirect
  await expect(page).toHaveURL('https://cmd.wopee.io/dashboard');
});

test('TC011 - Verify Google login functionality', async ({ page }) => {
  await page.goto('https://cmd.wopee.io/login');
  await page.click('button:has-text("Google")');
  // Assume successful login and redirect
  await expect(page).toHaveURL('https://cmd.wopee.io/dashboard');
});