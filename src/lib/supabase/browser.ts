"use client";

import { createBrowserClient } from "@supabase/ssr";
import { requirePortalSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export function createPortalBrowserClient() {
  const { url, publishableKey } = requirePortalSupabaseConfig();
  return createBrowserClient<Database>(url, publishableKey);
}
