# Cheat sheet for experiments with AI Testing Agent

## 2. Simple AI Testing Agent: Experiment 3

```typescript
// Ordering by price
export const userPrompt = `
  You are a QA tester for eCommerce app to test purchasing process.
  Test scenario to order products by price.
  Validate that products are ordered by price from lowest to highest.
`;
```

```typescript
export const select = tool({
  description: "Select an option in a SELECT element on the page.",
  parameters: z.object({
    locator: z.string().describe("Element locator."),
    value: z.string().describe("The option value to select."),
  }),
  execute: async ({ locator, value }) => {
    try {
      assertPage(page);
      await page.selectOption(locator, value);
      return `Selected value "${value}" in element matching locator: ${locator}`;
    } catch (error) {
      return handleError(error, "select");
    }
  },
});
```

## 2. Simple AI Testing Agent: Experiment 4

```typescript
// Login with locked_out_user
export const userPrompt = `
  You are a QA tester for testing login procedure.
  Login with \`locked_out_user\` credentials
`;
```

```typescript
// Login with problem_user
export const userPrompt = `
  You are a QA tester for testing login procedure.
  Login with \`problem_user\` credentials
`;
```

```typescript
// Login with performance_glitch_user
export const userPrompt = `
  You are a QA tester for testing login procedure.
  Login with \`performance_glitch_user\` credentials
`;
```

## 3. Advance AI Testing Agent: Experiment 1

Enhance system prompt to make it work (add into `Useful interactions` section).

```markdown
- When user is selecting currency, click on the flag icon to open the currency selector. Then select the account with appropriate currency and highest balance. If the appropriate account is selected, no need to click on the flag icon again.
```
