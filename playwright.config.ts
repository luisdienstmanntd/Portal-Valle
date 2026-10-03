import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 2,
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "tablet-portrait", use: { viewport: { width: 768, height: 1024 } } },
    { name: "tablet-landscape", use: { viewport: { width: 1024, height: 768 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
  ],
  use: { baseURL: "http://127.0.0.1:3100" },
  webServer: {
    command: "node ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
