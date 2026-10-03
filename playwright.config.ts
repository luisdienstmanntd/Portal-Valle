import { defineConfig } from "@playwright/test";

const port = Number(process.env.PORTAL_E2E_PORT || 3100);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Porta E2E inválida.");
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  workers: 2,
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 1000 } } },
    { name: "tablet-portrait", use: { viewport: { width: 768, height: 1024 } } },
    { name: "tablet-landscape", use: { viewport: { width: 1024, height: 768 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
  ],
  use: { baseURL },
  webServer: {
    command: `node ./node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
