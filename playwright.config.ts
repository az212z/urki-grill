import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4178",
    trace: "on-first-retry",
  },
  webServer: {
    command: "python3 -m http.server 4178",
    url: "http://localhost:4178",
    reuseExistingServer: !process.env.CI,
    timeout: 30000,
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["iPhone 13"] } },
  ],
});
