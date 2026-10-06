import { spawn } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { startPortalService } from "../tests/fixtures/portal-service.mjs";

if ([".env", ".env.local", ".env.production", ".env.production.local"].some(path => existsSync(path))) throw new Error("Resiliência exige checkout sem ENV de aplicação real.");
const env = { ...process.env, PORTAL_NEXT_DIST_DIR: ".next-resilience" };
for (const name of ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "NEXT_PUBLIC_SUPABASE_PROJECT_REF"]) delete env[name];
const run = (file, args, options = {}) => spawn(process.execPath, [file, ...args], { env, stdio: "inherit", ...options });
const complete = child => new Promise((resolve, reject) => { child.once("error", reject); child.once("exit", code => code === 0 ? resolve() : reject(new Error("Verificação de resiliência falhou."))); });
const children = [];
const nextTypes = readFileSync("next-env.d.ts");
let service;
try {
  // Build is separate from the owner's active preview; no operational/test switch in the app.
  await complete(run("node_modules/next/dist/bin/next", ["build"]));
  service = await startPortalService(3154);
  const configured = { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3154", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_synthetic_test_only", NEXT_PUBLIC_SUPABASE_PROJECT_REF: "local" };
  for (const [port, settings] of [[3114, configured], [3115, {}], [3116, { NEXT_PUBLIC_SUPABASE_URL: configured.NEXT_PUBLIC_SUPABASE_URL }],
    [3117, { ...configured, NEXT_PUBLIC_SUPABASE_URL: "https://fiamtckdglzdrynmrlpj.supabase.co", NEXT_PUBLIC_SUPABASE_PROJECT_REF: "fiamtckdglzdrynmrlpj" }]]) {
    children.push(run("node_modules/next/dist/bin/next", ["start", "--hostname", "127.0.0.1", "--port", String(port)], { env: { ...env, ...settings } }));
    const deadline = Date.now() + 15000;
    while (true) {
      try { if ((await fetch(`http://127.0.0.1:${port}/indisponivel`, { signal: AbortSignal.timeout(1000) })).ok) break; } catch { /* startup only */ }
      if (Date.now() > deadline) throw new Error("Servidor de teste não iniciou.");
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  await complete(run("node_modules/playwright/cli.js", ["test", "--config", "playwright.resilience.config.ts"]));
} finally {
  for (const child of children) child.kill();
  if (service) { service.closeAllConnections(); await new Promise(resolve => service.close(resolve)); }
  writeFileSync("next-env.d.ts", nextTypes);
}
