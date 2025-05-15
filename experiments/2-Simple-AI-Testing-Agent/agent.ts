import { azure } from "@ai-sdk/azure";
import { generateText } from "ai";
import { reportStep } from "./utils/reporter.js";
import {
  startTesting,
  screenshotAndAnalyze,
  getActionInstructions,
  click,
  fill,
  reportIssue,
  stopTesting,
} from "./tools/tools.js";
import { systemPrompt, userPrompt } from "./config.js";
import { getStepNumber, incrementStepNumber } from "./utils/stepper.js";
import { TestInfo, Page } from "@playwright/test";
import { setPage, setTestInfo } from "./utils/playwright.js";

export async function agent(
  page: Page | undefined = undefined,
  testInfo: TestInfo | undefined = undefined
) {
  try {
    if (page) setPage(page);
    if (testInfo) setTestInfo(testInfo);

    const { text: responseText } = await generateText({
      model: azure("gpt-4o"),
      system: systemPrompt,
      prompt: userPrompt,
      tools: {
        startTesting,
        screenshotAndAnalyze,
        getActionInstructions,
        click,
        fill,
        reportIssue,
        stopTesting,
      },
      maxSteps: 50,
      onStepFinish({ text, toolCalls, toolResults, finishReason, usage }) {
        incrementStepNumber();

        const toolName = toolCalls?.[0]?.toolName ?? "No tool calls";
        console.log(`\nStep #${getStepNumber()} Finished (${toolName})`);

        reportStep(text, toolCalls, toolResults, finishReason, usage);
      },
    });

    console.log("\n--- AGENT FINISHED ---");
    console.log(responseText);
    return responseText;
  } catch (error) {
    console.error(
      "Error in agent:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
