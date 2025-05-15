import { Page, TestInfo } from "@playwright/test";

let currentPage: Page | undefined = undefined;
let currentTestInfo: TestInfo | undefined = undefined;

export function getPage(): Page | undefined {
  return currentPage;
}

export function getTestInfo(): TestInfo | undefined {
  return currentTestInfo;
}

export function setPage(page: Page) {
  currentPage = page;
}

export function setTestInfo(testInfo: TestInfo) {
  currentTestInfo = testInfo;
}
