import { test, expect } from '@playwright/test';

test('TC003 - Verify contact form availability', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/contact.html');
  const nameField = await page.$('input[placeholder="Name"]');
  const emailField = await page.$('input[placeholder="Your Email Address"]');
  const subjectField = await page.$('input[placeholder="Subject"]');
  const messageField = await page.$('textarea[placeholder="Your Message"]');
  expect(nameField).not.toBeNull();
  expect(emailField).not.toBeNull();
  expect(subjectField).not.toBeNull();
  expect(messageField).not.toBeNull();
});

test('TC006 - Verify contact information display', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/contact.html');
  const phoneNumber = await page.textContent('h3:has-text("+420 226 293 560")');
  const address = await page.textContent('h3:has-text("Budějovická 1550/15a")');
  expect(phoneNumber).toContain('+420 226 293 560 (CZ)');
  expect(address).toContain('Prague, 140 00');
});

test('TC004 - Verify contact form submission', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/contact.html');
  await page.fill('input[placeholder="Name"]', 'Test User');
  await page.fill('input[placeholder="Your Email Address"]', 'test@example.com');
  await page.fill('input[placeholder="Subject"]', 'Test Subject');
  await page.fill('textarea[placeholder="Your Message"]', 'This is a test message.');
  await page.click('button.btn-main-md');
  // Assuming a success message appears, verify the submission
  const successMessage = await page.textContent('div.success-message');
  expect(successMessage).toContain('Message is sent successfully');
});

test('TC005 - Verify form validation for empty fields', async ({ page }) => {
  await page.goto('https://dronjo.wopee.io/contact.html');
  await page.click('button.btn-main-md');
  const errorMessage = await page.textContent('div.error-message');
  expect(errorMessage).toContain('Error message is shown for empty required fields');
});