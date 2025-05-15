import cliTable from "cli-table3";

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

  console.log(table.toString());
};
