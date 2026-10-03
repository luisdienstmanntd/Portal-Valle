import { execFileSync } from "node:child_process";

const runner = process.platform === "win32" ? "npx.cmd" : "npx";
const raw = execFileSync(runner, ["supabase", "status", "--output", "json"], { encoding: "utf8" });
const status = JSON.parse(raw);
const url = status.API_URL;
const key = status.PUBLISHABLE_KEY;
if (!url || !key?.startsWith("sb_publishable_")) {
  throw new Error("Supabase local não retornou URL e chave publicável; não usar chave privilegiada.");
}
execFileSync(runner, ["vitest", "run", "tests/integration"], {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: url,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: key, NEXT_PUBLIC_SUPABASE_PROJECT_REF: "local" },
});
