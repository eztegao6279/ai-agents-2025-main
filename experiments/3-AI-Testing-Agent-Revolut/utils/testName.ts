import { generateText } from "ai";
import { azure } from "@ai-sdk/azure";
// use AI to generate a test name from userPrompt
export async function generateTestName(userPrompt: string) {
  const { text: responseText } = await generateText({
    model: azure("gpt-4o"),
    system: `Generate a clear, concise, and well-structured test name based on the provided user prompt. 
        Follow best practices for naming tests, ensuring readability, specificity, and relevance to the test scenario. 
        Avoid generic or ambiguous names and use natural language.
        
        Examples:
        - Login using valid credentials
        - Create a new supplier contact
        - Add a new product using the product form
        `,
    prompt: `${userPrompt}`,
  });
  return responseText;
}

export async function getTestName(userPrompt: string) {
  return (
    (await generateTestName(userPrompt)) + " - " + new Date().toLocaleString()
  );
}
