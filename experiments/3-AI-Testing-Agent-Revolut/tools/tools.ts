import { expect, Page } from "@playwright/test";
import fs from "fs";
import path from "path";
import * as zod from "zod";
import { CoreMessage, generateText, tool } from "ai";
import { azure } from "@ai-sdk/azure";
import { baseUrl, systemPrompt, userPrompt } from "../config.js";
import { assertPage, handleError, waitForLoader } from "../utils/utils.js";
import { trackWopeeStep } from "./wopee.js";
import { splitHtmlIntoChunks } from "../utils/splitHtmlIntoChunks.js";
import { getPage } from "../utils/playwright.js";
import { getStepNumber } from "../utils/stepper.js";
const z = zod;

let page: Page | undefined = undefined;

export const startTesting = tool({
  description: "Start testing with this tool.",
  parameters: z.object({}),
  execute: async () => {
    console.log(`#${getStepNumber()} 🔧 Tool 'startTesting' started`);

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
    console.log(
      `#${getStepNumber()} 🔧 Tool 'screenshotAndAnalyze' started with question: ${question}`
    );

    try {
      await waitForLoader(page);
      assertPage(page);
      const screenshot = await page.screenshot();

      const { text: responseText } = await generateText({
        messages: [
          {
            role: "system",
            content: `You are analyzing a webpage screenshot to make sure that previous step conducted correctly
            and also to provide detail information what is displayed for further processing.
            
            This is system prompt with useful information about the application: 
            ${systemPrompt}

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
        model: azure("gpt-4o-mini"),
      });

      await trackWopeeStep(
        `Screenshot analyzed`,
        `Analyzed screenshot for question: ${question} \n\nResult: ${responseText.toString()}`,
        page
      );

      return `Analyzed for question: ${question}
        Result: ${responseText.toString()}`;
    } catch (error) {
      return handleError(error, "screenshotAndAnalyze");
    }
  },
});

export const getActionInstructions = tool({
  description: `Get the instructions in JSON format for action on the current page.
    If previous tool failed, error message is provided in the 'error' parameter.

    Examples:
     - Action: Click on the button with text 'Login'
     - Instructions: 
     [
       { "action": "click", "locator": "a >> text=Login" },
       { "action": "click", "locator": "button >> text=Login" }
     ]

     - Action: Fill in the email field with the value 'test@test.com'
     - Instructions: 
     [
       { "action": "fill", "locator": "input[type='email']", "value": "test@test.com" },
       { "action": "fill", "locator": "[name='email']", "value": "test@test.com" }
     ]

     - Action: Select the option with text 'Option 1' from the dropdown
     - Instructions: 
     [
       { "action": "select", "locator": "select", "value": "Option 1" },
       { "action": "select", "locator": "[data-test='dropdown']", "value": "Option 1" }
     ]
  `,
  parameters: z.object({
    action: z.string().describe("The action to perform."),
    error: z.string().describe("The error message from the previous tool."),
  }),

  execute: async ({ action, error }) => {
    console.log(
      `#${getStepNumber()} 🔧 Tool 'getActionInstructions' started with action: ${action}`
    );

    try {
      assertPage(page);
      await waitForLoader(page);

      const htmlChunks = splitHtmlIntoChunks(await page.content());
      let validJsonResponse = [];

      for (const chunk of htmlChunks) {
        const messages: CoreMessage[] = [
          {
            role: "system",
            content: `
              You are a tool that provides instructions for interacting with a web app based on a requested action.
              Return a JSON array with 2 - 5 objects sorted by best locator first. 
              Do not include any extra text or explanations.

              Important guidelines for locators:
              1. **Prefer stable, unique locators** such as \`data-test\` attributes, IDs, or unique text content.
              2. **Do not** use generic nth-of-type or last-of-type or role-based locators (e.g., \`div[role='row']:last-of-type\`) if they might match multiple elements. 
                 - If you must use them, ensure the element truly is unique on the page (e.g., the only one with that role).
              3. If multiple elements match, **refine** the locator by combining attributes or text content (e.g., \`div[role="row"][data-test="unique-row"] >> text="Payment #12345"\`).

              This is system prompt with useful information about the application: 
              ${systemPrompt}

              This is task requested by the user: 
              ${userPrompt}

              Based on the action, follow these rules:

              1. For a click action (e.g., "Click on the button with text 'Login'"):
                - Inspect the provided HTML snippet.
                - Look for a clickable element (button, link, or icon) with text or attributes like "Login", "Anmelden", "Einloggen", or "Sign In".
                - Return a JSON array with objects in the format:
                [
                  {
                    "action": "click",
                    "locator": "<unique locator>"
                  },
                  {
                    "action": "click",
                    "locator": "<other unique locator>"
                  }
                ]

              2. For a fill action (e.g., "Fill in the email field with the value 'test@test.com'"):
                - Inspect the HTML snippet for an input field related to the target (e.g., with placeholder, name, or data-test attributes suggesting an email field).
                - Extract the value to fill from the action.
                - Return a JSON array with objects in the format:
                [
                  {
                    "action": "fill",
                    "locator": "<unique locator>",
                    "value": "<extracted value>"
                  },
                  {
                    "action": "fill",
                    "locator": "<other unique locator>",
                    "value": "<extracted value>"
                  }
                ]

              3. For a select action (e.g., "Select the option with text 'Option 1' from the dropdown"):
                - Inspect the HTML snippet for a dropdown element (<select> or similar).
                - Identify the option that matches the provided text.
                - Return a JSON array with objects in the format:
                [
                  {
                    "action": "select",
                    "locator": "<unique locator>",
                    "value": "<option text>"
                  },
                  {
                    "action": "select",
                    "locator": "<other unique locator>",
                    "value": "<option text>"
                  }
                ]

              When fields are divided into multiple segments (e.g., credit card numbers), ensure each segment is targeted individually.

              `,
          },
          {
            role: "user",
            content: `Get instructions for action: "${action}" using the HTML snippet provided below.

              This is the HTML snippet to analyze: ${chunk}
            `,
          },
        ];

        if (error) {
          messages.push({
            role: "user",
            content: `The previous tool failed with error: ${error}`,
          });
        }

        // Only add additional instructions if there are multiple chunks
        if (htmlChunks.length > 1) {
          messages.push({
            role: "user",
            content:
              "ONLY return an empty array [] if the action is not possible on this HTML snippet.",
          });
        }

        const { text: responseText } = await generateText({
          messages,
          model: azure("gpt-4o"),
        });

        try {
          // Remove markdown fences and any extra characters
          const cleanedResponse = responseText
            .replace(/```(json)?/g, "")
            .trim();
          const parsedJson = JSON.parse(cleanedResponse);

          if (Array.isArray(parsedJson) && parsedJson.length > 0) {
            validJsonResponse = parsedJson;
            break; // Stop processing if valid instructions are found
          }
        } catch (error) {
          console.log(`Failed to parse JSON response: ${error.message}`);
          // Continue to the next chunk if parsing fails
        }
      }

      // Return the valid JSON array directly
      return validJsonResponse;
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
    console.log(
      `#${getStepNumber()} 🔧 Tool 'reportIssue' started with issue: ${issue}`
    );
    try {
      assertPage(page);
      const projectPath = process.cwd();
      const issuesFilePath = path.join(
        projectPath,
        "test-results/reported_issues.txt"
      );
      const currentUrl = page.url();
      const log = `\nURL: ${currentUrl}\nIssue: ${issue}\n${"=".repeat(50)}\n`;

      fs.appendFileSync(issuesFilePath, log);
      return `${new Date().toLocaleString()} Reported issue: ${issue} (stored in ${issuesFilePath})`;
    } catch (error) {
      return handleError(error, "reportIssue");
    }
  },
});

export const stopTesting = tool({
  description: "Stop testing and free resources.",
  parameters: z.object({}),
  execute: async () => {
    console.log(`#${getStepNumber()} 🔧 Tool 'stopTesting' started`);
    try {
      return "Testing stopped.";
    } catch (error) {
      return handleError(error, "stopTesting");
    }
  },
});

export const locatorVisibilityCheck = tool({
  description: "Check if an element is visible or not by locator.",
  parameters: z.object({
    locator: z.string().describe("Element locator."),
    expectedVisibility: z
      .enum(["visible", "not_visible"])
      .describe("If the element should be visible or not."),
  }),
  execute: async ({ locator, expectedVisibility }) => {
    console.log(
      `#${getStepNumber()} 🔧 Tool 'locatorVisibilityCheck' started with locator: ${locator}, expected: ${expectedVisibility}`
    );

    try {
      assertPage(page);

      if (expectedVisibility === "visible") {
        await expect(page.locator(locator)).toBeVisible();
      } else {
        await expect(page.locator(locator)).not.toBeVisible();
      }

      const result =
        expectedVisibility === "visible" ? "visible " : "NOT visible ";

      await waitForLoader(page);
      await trackWopeeStep(
        `Element (locator: ${locator}) is ${result}`,
        `locator: ${locator}`,
        page
      );

      console.log(`   ✅ Element \`${locator}\` is ${result} as expected.`);
      return `Element \`${locator}\` is ${result} as expected.`;
    } catch (error) {
      console.log(
        `   ❌ Visibility check failed for element \`${locator}\` with error: ${error}`
      );
      return handleError(error, "locatorVisibilityCheck");
    }
  },
});

export const click = tool({
  description: "Click an element by locator.",
  parameters: z.object({
    locator: z.string().describe("Element locator."),
  }),
  execute: async ({ locator }) => {
    console.log(
      `#${getStepNumber()} 🔧 Tool 'click' started with locator: ${locator}`
    );
    try {
      assertPage(page);

      const newTabPromise = page
        .context()
        .waitForEvent("page", {
          timeout: 3000,
        })
        .catch(() => null);

      await page.click(locator);

      // See if a new tab actually opened
      const newTab = await newTabPromise;

      if (newTab) {
        await newTab.waitForLoadState();
        page = newTab;
        await page.bringToFront();
        console.log(
          `   ✅ Clicked element \`${locator}\` successfully - new tab opened`
        );
      } else {
        console.log(`   ✅ Clicked element \`${locator}\` successfully`);
      }

      await waitForLoader(page);

      await trackWopeeStep(`Click`, `locator: ${locator}`, page);
      return `Clicked element \`${locator}\` successfully`;
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
    console.log(
      `#${getStepNumber()} 🔧 Tool 'fill' started with locator: ${locator}, value: ${value}`
    );
    try {
      assertPage(page);
      await page.locator(locator).fill(value);
      console.log(`   ✅ Filled \`${locator}\` with value: ${value}`);

      await waitForLoader(page);
      await trackWopeeStep(
        `Fill with value: ${value}`,
        `locator: ${locator} \n value: ${value}`,
        page
      );

      return `Filled "${value}" into element matching locator: ${locator}`;
    } catch (error) {
      return handleError(error, "fill");
    }
  },
});

export const select = tool({
  description: "Select an option in a SELECT element on the page.",
  parameters: z.object({
    locator: z.string().describe("Element locator."),
    value: z.string().describe("The option value to select."),
  }),
  execute: async ({ locator, value }) => {
    console.log(
      `#${getStepNumber()} 🔧 Tool 'select' started with locator: ${locator}, value: ${value}`
    );
    try {
      assertPage(page);
      await page.selectOption(locator, value);
      console.log(`   ✅ Selected \`${locator}\` with value: ${value}`);

      await waitForLoader(page);
      await trackWopeeStep(
        `Select`,
        `locator: ${locator} \n value: ${value}`,
        page
      );
      return `Selected value "${value}" in element matching locator: ${locator}`;
    } catch (error) {
      return handleError(error, "select");
    }
  },
});
