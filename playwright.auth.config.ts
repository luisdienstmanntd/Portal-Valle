import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e-auth",
  workers: 1,
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
  ],
  use: { baseURL: "http://127.0.0.1:3103" },
  webServer: {
    command: "node ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3103",
    url: "http://127.0.0.1:3103/login", reuseExistingServer: false, timeout: 120_000,
  },
});
