import { test } from "@playwright/test";
import { agent } from "./agent.js";

test("Agent flow", async ({ page }, testInfo) => {
  test.setTimeout(5 * 60_000); // 5 minutes
  await agent(page, testInfo);
});
