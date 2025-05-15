import { test, expect } from '@playwright/test';

test('TC016 - Verify home page navigation', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/contact.html');
  await page.click('a.nav-link:has-text("Home")');
  await expect(page).toHaveURL('https://dronjo.wopee.io/');
});

test('TC017 - Verify gallery page navigation', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a.nav-link:has-text("Gallery")');
  await expect(page).toHaveURL('https://dronjo.wopee.io/gallery.html');
});

test('TC018 - Verify contact page navigation', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a.nav-link:has-text("Contact")');
  await expect(page).toHaveURL('https://dronjo.wopee.io/contact.html');
});