import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { describe, expect, it } from "vitest";
import { requirePortalSupabaseConfig } from "../../src/lib/supabase/config";
import type { Database } from "../../src/lib/supabase/database.types";

// This suite must never run against hosted projects. RLS role assertions live in pgTAP.
const config = requirePortalSupabaseConfig();
if (config.projectRef !== "local") throw new Error("Integração HTTP exige Supabase local de teste.");
const client = createClient<Database>(config.url, config.publishableKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

describe("Supabase Portal HTTP real", () => {
  it.each(["experiences", "experience_occurrences", "experience_bookings", "audit_events"] as const)(
    "%s não expõe dados anônimos pela API", async table => {
      const { data, error } = await client.from(table).select("id");
      expect(data).toBeNull(); expect(error?.code).toBe("42501");
    });
  it("conecta à API e nega SELECT anônimo", async () => {
    const { data, error } = await client.from("portal_settings").select("timezone");
    expect(data).toBeNull();
    expect(error?.code).toBe("42501");
  });

  it("nega INSERT anônimo", async () => {
    const { error } = await client.from("portal_settings").insert({ singleton: true });
    expect(error?.code).toBe("42501");
  });

  it("o cliente SSR de leitura respeita a mesma fronteira", async () => {
    const serverClient = createServerClient<Database>(config.url, config.publishableKey, {
      cookies: { getAll: () => [] },
    });
    const { data, error } = await serverClient.from("portal_settings").select("timezone");
    expect(data).toBeNull();
    expect(error?.code).toBe("42501");
  });
});
