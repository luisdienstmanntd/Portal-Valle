import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePortalSupabaseConfig } from "./config";
import type { Database } from "./database.types";

/** New client per request; only Server Actions may opt into cookie writes. */
export async function createPortalServerClient(writable = false, signal?: AbortSignal) {
  const { url, publishableKey } = requirePortalSupabaseConfig();
  const cookieStore = await cookies();
  const requestSignal = signal ?? AbortSignal.timeout(5000);
  return createServerClient<Database>(url, publishableKey, {
    db: { retry: false },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store",
      signal: init?.signal ? AbortSignal.any([requestSignal, init.signal]) : requestSignal }) },
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        if (!writable) return; // Proxy has already refreshed response/request cookies.
        cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
      },
    },
  });
}
