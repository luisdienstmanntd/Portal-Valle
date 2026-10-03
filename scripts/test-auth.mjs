import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const runner = process.platform === "win32" ? "npx.cmd" : "npx";
const status = JSON.parse(execFileSync(runner, ["supabase", "status", "--output", "json"], { encoding: "utf8" }));
if (new URL(status.API_URL).hostname !== "127.0.0.1" || !status.PUBLISHABLE_KEY?.startsWith("sb_publishable_")) {
  throw new Error("Auth E2E exige stack local efêmero.");
}
// Admin credential is used only here to create synthetic Auth accounts on loopback.
// It is never passed to the Next application/browser, written to disk or printed.
const admin = createClient(status.API_URL, status.SECRET_KEY || status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const password = randomBytes(24).toString("base64url") + "Aa1!";
const users = {};
for (const name of ["recepcao", "gerencia", "admin", "inactive", "unlinked"]) {
  const email = `${name}@portal.test`;
  const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: "admin" } });
  if (error || !data.user || !/^[a-f0-9-]{36}$/.test(data.user.id)) throw new Error("Falha ao criar conta fictícia de teste.");
  users[name] = { email, id: data.user.id };
}
mkdirSync("work", { recursive: true });
writeFileSync("work/auth-fixtures.json", JSON.stringify({ users, password }));
const tuples = Object.entries(users).filter(([name]) => name !== "unlinked").map(([name, user]) =>
  `('${user.id}', '${name === "inactive" ? "admin" : name}', ${name !== "inactive"})`);
writeFileSync("work/auth-fixtures.sql", `insert into public.portal_profiles(id,role,active) values ${tuples.join(",")};`);
execFileSync(runner, ["supabase", "db", "query", "--local", "--file", "work/auth-fixtures.sql"], { stdio: ["ignore", "ignore", "inherit"] });
// Validate real Auth and RLS independently of Next/cookies before browser tests.
// Report only checkpoint and database error code; never tokens, keys or identities.
for (const name of ["recepcao", "gerencia", "admin", "inactive", "unlinked"]) {
  const probe = createClient(status.API_URL, status.PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const signedIn = await probe.auth.signInWithPassword({ email: users[name].email, password });
  if (signedIn.error) throw new Error(`Auth fixture checkpoint failed: ${signedIn.error.code || "unknown"}`);
  const profile = await probe.from("portal_profiles").select("id,role,active").maybeSingle();
  if (profile.error) throw new Error(`Profile RLS checkpoint failed: ${profile.error.code}`);
  const expected = name !== "inactive" && name !== "unlinked";
  if (Boolean(profile.data?.active) !== expected) throw new Error("Profile visibility checkpoint failed.");
  await probe.auth.signOut({ scope: "local" });
}
console.log("Synthetic Auth and profile RLS checkpoints PASS.");
const registrationProbe = createClient(status.API_URL, status.PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const registration = await registrationProbe.auth.signUp({ email: "self-registration@portal.test", password });
if (registration.error?.code !== "signup_disabled" || registration.data.user) {
  throw new Error("Public registration must remain disabled.");
}
console.log("Public registration disabled checkpoint PASS.");
const env = { ...process.env, NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: status.PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_PROJECT_REF: "local" };
execFileSync(runner, ["next", "build"], { stdio: "inherit", env });
execFileSync(runner, ["playwright", "test", "--config", "playwright.auth.config.ts"], { stdio: "inherit", env });
