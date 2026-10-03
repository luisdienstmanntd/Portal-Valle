import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requirePortalSupabaseConfig } from "./config";
import type { Database } from "./database.types";

/** Read client per request. Auth mutations/session refresh require Phase 4's response adapter and proxy. */
export async function createPortalServerClient() {
  const { url, publishableKey } = requirePortalSupabaseConfig();
  const cookieStore = await cookies();
  return createServerClient<Database>(url, publishableKey, {
    cookies: { getAll: () => cookieStore.getAll() },
  });
}
