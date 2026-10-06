import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
export async function testStays(status, users, password) {
  assert.equal(new URL(status.API_URL).hostname, "127.0.0.1");
  const client = createClient(status.API_URL, status.PUBLISHABLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  assert.equal((await client.auth.signInWithPassword({ email: users.recepcao.email, password })).error, null);
  const command = { id: randomUUID(), apartment: "TEST-REGISTRY", arrival_date: "2026-10-09", departure_date: "2026-10-12" };
  const args = { p_request: randomUUID(), p_command: command };
  const concurrent = await Promise.all([client.rpc("portal_create_stay", args), client.rpc("portal_create_stay", args)]);
  assert(concurrent.every(result => !result.error && result.data === command.id));
  const rows = await client.from("portal_stays").select("id,apartment").eq("id", command.id);
  assert.equal(rows.error, null); assert.equal(rows.data.length, 1);
  assert.equal((await client.rpc("portal_create_stay", { ...args, p_command: { ...command, apartment: "CHANGED" } })).error?.message, "E_IDEMPOTENCY");
  assert((await client.from("portal_stays").insert(command)).error);
  await client.auth.signOut({ scope: "local" });
  assert((await client.rpc("portal_create_stay", args)).error);
  console.log("Stay HTTP concurrent retries, registry read, direct writes and anonymous access PASS.");
}
