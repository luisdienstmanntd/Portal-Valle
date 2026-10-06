import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/e2e-resilience", workers: 1,
  projects: [{ name: "desktop", use: { viewport: { width: 1440, height: 1000 } } }, { name: "tablet", use: { viewport: { width: 768, height: 1024 } } }],
  use: { baseURL: "http://127.0.0.1:3114" },
});
