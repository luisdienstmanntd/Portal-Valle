import { readPortalSupabaseConfig } from "./supabase/config";

export function validatePortalEnv(env: Record<string, string | undefined> = process.env) {
  return { supabaseConfigured: readPortalSupabaseConfig(env) !== null };
}
