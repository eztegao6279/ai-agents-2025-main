import { azure } from "@ai-sdk/azure";
import { generateText } from "ai";
import { reportFinish, reportStep } from "./utils/reporter.js";
import {
  startTesting,
  screenshotAndAnalyze,
  click,
  fill,
  select,
  locatorVisibilityCheck,
  getActionInstructions,
  reportIssue,
  stopTesting,
} from "./tools/tools.js";
import { systemPrompt, userPrompt } from "./config.js";
import { getStepNumber, incrementStepNumber } from "./utils/stepper.js";
import { TestInfo, Browser } from "@playwright/test";
import { setPage, setTestInfo } from "./utils/playwright.js";

export async function agent(
  browser: Browser | undefined = undefined,
  testInfo: TestInfo | undefined = undefined
) {
  try {
    if (testInfo) setTestInfo(testInfo);

    const context = await browser?.newContext({
      storageState: "./experiments/3-AI-Testing-Agent-Revolut/data/auth.json",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    });
    const page = await context?.newPage();
    if (page) setPage(page);

    const { text: responseText } = await generateText({
      model: azure("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      tools: {
        startTesting,
        screenshotAndAnalyze,
        click,
        fill,
        select,
        locatorVisibilityCheck,
        getActionInstructions,
        reportIssue,
        stopTesting,
      },
      maxSteps: 50,
      onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
        const toolName = toolCalls?.[0]?.toolName ?? "No tool calls";
        console.log(`Step #${getStepNumber()}: finished (${toolName})\n`);
        console.log(`───────────────────────────────────────────\n`);

        reportStep(text, toolCalls, toolResults, finishReason, usage);
        incrementStepNumber();
      },
    });

    await reportFinish(responseText);
    return responseText;
  } catch (error) {
    console.error(
      "Error in agent:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
