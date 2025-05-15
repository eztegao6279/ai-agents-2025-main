import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: ".",
  testMatch: ["**/*.spec.ts"],
  snapshotPathTemplate: "baselines{/projectName}/{testFilePath}/{arg}{ext}",
  fullyParallel: false,
  workers: 1, // Ensure tests run sequentially with one worker

  timeout: 10 * 60_000, // Max time in ms for each test
  globalTimeout: 10 * 60_000, // Max time in ms the whole test suite can run.

  reporter: [["@wopee-io/wopee.pw/wopee-reporter"], ["list"], ["html"]],
  use: {
    video: "on",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chrome",
      use: {
        headless: false,
        launchOptions: { args: ["--window-position=100,100"] }, // Move to right half of the screen (for debugging on my ultra-wide monitor)
        viewport: { width: 1600, height: 1000 },
        channel: "chrome",

        actionTimeout: 10_000,
        navigationTimeout: 30_000,
      },
    },
  ],
});
