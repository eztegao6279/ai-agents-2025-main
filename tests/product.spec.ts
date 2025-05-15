import { test, expect } from '@playwright/test';

test('TC001 - Verify product details are displayed', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  const productName = await page.textContent('h1.text-white.font-weight-bold');
  const productFeatures = await page.textContent('p.text-white.mb-5');
  const productPrice = await page.textContent('h2.text-white.font-weight-bold');
  expect(productName).toContain('DJI Phantom 4 Pro V2.0');
  expect(productFeatures).toContain('Featuring a 1-inch CMOS sensor');
  expect(productPrice).toContain('now: 699 €');
});

test('TC019 - Verify product discount display', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  const discountedPrice = await page.textContent('h2.text-white.font-weight-bold');
  const originalPrice = await page.textContent('h2.text-white.font-weight-bold s');
  expect(discountedPrice).toContain('now: 699 €');
  expect(originalPrice).toContain('1 699 €');
});

test('TC002 - Verify Buy Now button functionality', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/');
  await page.click('a.btn-main-md');
  await expect(page).toHaveURL('https://dronjo.wopee.io/buy.html');
});