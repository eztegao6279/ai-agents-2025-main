import fs from "fs";

export const systemPrompt = fs.readFileSync(
  "experiments/3-AI-Testing-Agent-Revolut/prompts/systemPrompt.md",
  "utf8"
);

export const baseUrl = "https://sandbox-business.revolut.com/";

// Example 1: Login into Revolut account and check balance
export const userPrompt = `
  You are a QA tester for Revolut banking app.
  You are already logged in into account.
  If you need to login again, use ${process.env.USER_LOGIN_EMAIL} / ${process.env.USER_LOGIN_PASSWORD}.
  Make sure you are on Dashboard (Home) page if not navigate to it first.
  Test that balance is greater than 0.
`;

// Example 2: Login into Revolut account and check balance
// export const userPrompt = `
//   You are a QA tester for Revolut banking app.
//   You are already logged in into account.
//   If you need to login again, use ${process.env.USER_LOGIN_EMAIL} / ${process.env.USER_LOGIN_PASSWORD}.
//   Make sure you are starting from Dashboard (Home) page if not navigate to it first.
//   Test money exchange feature from EUR to USD where amount is 10 EUR.
// `;

// Example 3: Resend last payment again but change amount to 1
// export const userPrompt = `
//   You are a QA tester for Revolut banking app.
//   You are already logged in into account.
//   If you need to login again, use ${process.env.USER_LOGIN_EMAIL} / ${process.env.USER_LOGIN_PASSWORD}.
//   Make sure you are starting from Dashboard (Home) page if not navigate to it first.
//   Navigate to Payments page (Transfers), then open list of last payments.
//   Open last payment details by clicking on it.
//   Resend last payment again by clicking on "Send again" button.
//   Change amount to 1 EUR.
//   Payment should be resent successfully.
// `;
