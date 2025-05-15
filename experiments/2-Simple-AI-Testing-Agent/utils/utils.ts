import { Page } from "@playwright/test";

async function waitForLoader(page: Page | undefined) {
  assertPage(page);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
}

function assertPage(page: Page | undefined): asserts page is Page {
  if (!page) throw new Error("Page is not initialized");
}

function handleError(error: unknown, context: string): string {
  const errorMessage = error instanceof Error ? error.message : String(error);
  return `Error in ${context}: ${errorMessage}`;
}

export { waitForLoader, assertPage, handleError };
