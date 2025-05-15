import cliTable from "cli-table3";
import fs from "fs";
import { getStepNumber } from "./stepper";
import { trackWopeeStep } from "../tools/wopee";
import { getPage } from "./playwright";
import { assertPage } from "./utils";

export const reportStep = function (
  text: string,
  toolCalls: object[],
  toolResults: object[],
  finishReason: string,
  usage: { promptTokens: number; completionTokens: number; totalTokens: number }
) {
  // Create table structure
  const table = new cliTable({
    head: ["Step Details", "Value"],
    colWidths: [25, 90],
    wordWrap: true,
  });

  // Add data to table
  table.push(
    ["Step Description", text || "N/A"],
    [
      "Tool Calls",
      toolCalls.length ? JSON.stringify(toolCalls, null, 2) : "None",
    ],
    [
      "Tool Results",
      toolResults.length ? JSON.stringify(toolResults, null, 2) : "None",
    ],
    ["Finish Reason", finishReason || "N/A"],
    [
      "Usage",
      `Prompt Tokens: ${usage.promptTokens}, Completion Tokens: ${usage.completionTokens}, Total: ${usage.totalTokens}`,
    ]
  );

  const tableText = table.toString();
  // console.log(tableText);
  const toolName = toolCalls?.[0]?.toolName ?? "No tool calls";
  // console.log(`\nStep #${getStepNumber()} Finished (${toolName})`);

  const plainTextTable =
    `\nStep #${getStepNumber()}: Finished (${toolName}) ${new Date().toLocaleString()}\n` +
    tableText.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");

  fs.appendFileSync(`test-results/agent.log`, `${plainTextTable}`, "utf8");
};

export const reportFinish = async function (text: string) {
  console.log("\n--- AGENT FINISHED ---");
  console.log(text);

  const page = getPage();
  assertPage(page);

  await trackWopeeStep(`🤖 AGENT FINISHED 😍`, text, page);
};
