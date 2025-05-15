import { test, expect } from '@playwright/test';

test('TC012 - Verify privacy policy link functionality', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a:has-text("Privacy Policy")');
  await expect(page).toHaveURL('https://dronjo.wopee.io/privacy-policy.html');
});

test('TC013 - Verify terms and conditions link functionality', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a:has-text("Terms and Conditions")');
  await expect(page).toHaveURL('http://wopee.io/terms-and-conditions');
});

test('TC014 - Verify sign-up link functionality', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a:has-text("Signup")');
  await expect(page).toHaveURL('https://dronjo.wopee.io/sign-up.html');
});

test('TC015 - Verify sign-in link functionality', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a:has-text("Login")');
  await expect(page).toHaveURL('https://dronjo.wopee.io/sign-in.html');
});