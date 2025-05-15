import { Locator, Page, TestInfo } from "@playwright/test";
import { Wopee } from "@wopee-io/wopee.pw";
import { getStepNumber } from "../utils/stepper.js";
import { waitForLoader } from "../utils/utils.js";
let wopee: Wopee | null = null;

wopee = new Wopee();

export function assertWopee(wopee: Wopee | null): asserts wopee is Wopee {
  if (!wopee) throw new Error("Wopee instance is not initialized");
}

export async function startWopeeSuite(suiteName: string) {
  assertWopee(wopee);
  await wopee.startSuite(suiteName);
}

export async function startWopeeScenario(
  scenarioName: string,
  testInfo: TestInfo | undefined = undefined
) {
  assertWopee(wopee);
  await wopee.startScenario(scenarioName, testInfo);
}

export async function trackWopeeStep(
  stepName: string,
  comment: string = "",
  page: Page
) {
  assertWopee(wopee);
  await waitForLoader(page);

  await page.waitForTimeout(1000);

  const imageBase64 = await page.screenshot();

  await wopee.trackImage({
    stepName: `#${getStepNumber()}: ${stepName}`,
    comment,
    imageBase64: imageBase64.toString("base64"),
  });

  // await wopee.trackFullPage({
  //   stepName: `#${getStepNumber()}: ${stepName}`,
  //   comment,
  //   page,
  // });
}

export async function trackWopeeElement(
  stepName: string,
  comment: string = "",
  element: Locator
) {
  assertWopee(wopee);

  await element.waitFor({ state: "visible" });
  const imageBase64 = await element.screenshot();

  await wopee.trackImage({
    stepName: `#${getStepNumber()}: ${stepName}`,
    comment,
    imageBase64: imageBase64.toString("base64"),
  });
}

export async function stopWopeeScenario() {
  assertWopee(wopee);
  await wopee.stopScenario();
}
