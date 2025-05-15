import { Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import * as zod from "zod";
import { CoreMessage, generateText, tool } from "ai";
import { azure } from "@ai-sdk/azure";
import { baseUrl, systemPrompt, userPrompt } from "../config.js";
import { assertPage, handleError, waitForLoader } from "../utils/utils.js";
import { splitHtmlIntoChunks } from "../utils/splitHtmlIntoChunks.js";
import { getPage } from "../utils/playwright.js";
const z = zod;

let page: Page | undefined = undefined;

export const startTesting = tool({
  description: "Start testing with this tool.",
  parameters: z.object({}),
  execute: async () => {
    try {
      page = getPage();
      assertPage(page);

      await page.goto(baseUrl);
      return `Testing started with url: ${baseUrl}`;
    } catch (error) {
      return handleError(error, "startTesting");
    }
  },
});

export const screenshotAndAnalyze = tool({
  description:
    "A tool for analyzing a screenshot to make sure that previous step conducted correctly and to provide detail information what is displayed for further processing.",
  parameters: z.object({ question: z.string() }),
  execute: async ({ question }) => {
    try {
      await waitForLoader(page);
      assertPage(page);
      const screenshot = await page.screenshot({
        fullPage: true,
        path: `test-results/screenshots/screenshot-${Date.now()}.png`,
      });

      const { text: responseText } = await generateText({
        messages: [
          {
            role: "system",
            content: `You are analyzing a webpage screenshot to make sure that previous step conducted correctly
            and also to provide detail information what is displayed for further processing.
            
            This is task requested by the user: 
            ${userPrompt}`,
          },
          {
            role: "user",
            content: `Please analyze this screenshot and answer: ${question}`,
          },
          {
            role: "user",
            content: [
              {
                type: "image",
                image: `data:image/png;base64,${screenshot.toString("base64")}`,
              },
            ],
          },
        ],
        model: azure("gpt-4o"),
      });

      return `Analyzed for question: ${question}
        Result: ${responseText.toString()}`;
    } catch (error) {
      return handleError(error, "screenshotAndAnalyze");
    }
  },
});

export const getActionInstructions = tool({
  description: `Get the action instructions in JSON format for the current page.

    Examples:
     - Action: Click on the button with text 'Login'
     - Instructions: 
     {
      "action": "click",
      "locator": "a >> text=Login"
     }

     - Action: Fill in the email field with the value 'test@test.com'
     - Instructions: 
     {
      "action": "fill",
      "locator": "input[type='email']",
      "value": "test@test.com"
     }

     - Action: Select the option with text 'Option 1' from the dropdown
     - Instructions: 
     {
      "action": "select",
      "locator": "select",
      "value": "Option 1"
     }
  `,
  parameters: z.object({
    action: z.string().describe("The action to perform."),
  }),

  execute: async ({ action }) => {
    try {
      assertPage(page);

      const htmlChunks = splitHtmlIntoChunks(await page.content());

      if (htmlChunks.length > 1)
        console.log(`Splitting HTML into ${htmlChunks.length} chunks`);

      const responses = [];

      for (const chunk of htmlChunks) {
        const messages: CoreMessage[] = [
          {
            role: "user",
            content: `Get instructions for action: "${action}" in JSON format for the current page I am providing HTML in chunks.
            Response should be in JSON format with no additional text. 
            
            When fields are divided into multiple segments (e.g., credit card numbers), ensure each segment is targeted with unique locator 
            and filled individually to prevent strict mode violation.
            
            Do not propose anything if action is not possible on this page - just return empty string.

            Examples:
              - Action: Click on the button with text 'Login'
              - Instructions: 
              {
                "action": "click",
                "locator": "a >> text=Login"
              }

              - Action: Fill in the email field with the value 'test@test.com'
              - Instructions: 
              {
                "action": "fill",
                "locator": "input[type='email']",
                "value": "test@test.com"
              }

              - Action: Select the option with text 'Option 1' from the dropdown
              - Instructions: 
              {
                "action": "select",
                "locator": "select",
                "value": "Option 1"
              }

              These instructions should be followed by the agent:
              ${systemPrompt}

              This is task requested by the user: 
              ${userPrompt}

              Within this HTML: ${chunk}`,
          },
        ];

        if (htmlChunks.length > 1)
          messages.push({
            role: "user",
            content:
              "If action is not possible on this page, do not propose anything, I will send another HTML fragment.",
          });

        const { text: responseText } = await generateText({
          messages,
          model: azure("gpt-4o"),
          // model: azure("o1-mini"),
        });

        responses.push(responseText);
      }

      return responses.join("\n\n");
    } catch (error) {
      return handleError(error, "getActionInstructions");
    }
  },
});

export const reportIssue = tool({
  description:
    "Report an issue by appending it and the current URL to a file in the project folder.",
  parameters: z.object({
    issue: z.string().describe("A description of the issue encountered."),
  }),
  execute: async ({ issue }) => {
    try {
      assertPage(page);
      const projectPath = process.cwd();
      const issuesFilePath = path.join(projectPath, "reported_issues.txt");
      const currentUrl = page.url();
      const log = `\nURL: ${currentUrl}\nIssue: ${issue}\n${"=".repeat(50)}\n`;

      fs.appendFileSync(issuesFilePath, log);
      return `Reported issue: ${issue} (stored in ${issuesFilePath})`;
    } catch (error) {
      return handleError(error, "reportIssue");
    }
  },
});

export const stopTesting = tool({
  description: "Stop testing and free resources.",
  parameters: z.object({}),
  execute: async () => {
    try {
      return "Testing stopped.";
    } catch (error) {
      return handleError(error, "stopTesting");
    }
  },
});

export const click = tool({
  description: "Click an element by locator.",
  parameters: z.object({
    locator: z.string().describe("Element locator."),
  }),
  execute: async ({ locator }) => {
    try {
      assertPage(page);
      await page.waitForSelector(`${locator}`, {
        state: "attached",
      });
      const element = await page.$(locator);

      if (element) {
        await element.click();

        return `Clicked element \`${locator}\` successfully`;
      }
      return `Could not find element \`${locator}\``;
    } catch (error) {
      return handleError(error, "click");
    }
  },
});

export const fill = tool({
  description: "Fill an input field with a specified value.",
  parameters: z.object({
    locator: z.string().describe("Element locator."),
    value: z.string().describe("The text value to fill in."),
  }),
  execute: async ({ locator, value }) => {
    try {
      assertPage(page);
      await page.locator(locator).fill(value);

      return `Filled "${value}" into element matching locator: ${locator}`;
    } catch (error) {
      return handleError(error, "fill");
    }
  },
});
