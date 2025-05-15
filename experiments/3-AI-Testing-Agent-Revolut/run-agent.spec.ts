import { test } from "@playwright/test";
import { agent } from "./agent.js";
import {
  startWopeeSuite,
  startWopeeScenario,
  stopWopeeScenario,
} from "./tools/wopee.js";
import { getTestName } from "./utils/testName.js";
import { userPrompt } from "./config.js";

test("Agent flow", async ({ browser }, testInfo) => {
  test.setTimeout(10 * 60_000); // 10 minutes

  await startWopeeSuite("Wopee Agent");
  await startWopeeScenario(await getTestName(userPrompt), testInfo);

  await agent(browser, testInfo);

  await stopWopeeScenario();
});
