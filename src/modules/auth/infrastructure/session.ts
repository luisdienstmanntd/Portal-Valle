import "server-only";
import { redirect } from "next/navigation";
import { createPortalServerClient } from "@/lib/supabase/server";
import { readPortalSupabaseConfig } from "@/lib/supabase/config";
import { can, type Permission, type Staff } from "../domain/permissions";

export function authConfigured() { return readPortalSupabaseConfig(process.env) !== null; }

export async function getStaff(): Promise<Staff | null> {
  if (!authConfigured()) return null;
  const client = await createPortalServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return null;
  // RLS also checks live auth.sessions, active profile and identity. No JWT role claims.
  const { data: profile } = await client.from("portal_profiles").select("id,role,active").eq("id", user.id).maybeSingle();
  return profile;
}

export async function requirePermission(permission: Permission): Promise<Staff> {
  if (!authConfigured()) throw new Error("Acesso da equipe ainda não disponível.");
  const staff = await getStaff();
  if (!staff) redirect("/login");
  if (!can(staff, permission)) redirect("/acesso-negado");
  return staff;
}

/** Only preparation pages can remain public while configuration is absent. */
export async function guardPreparationPage(permission: Permission = "portal.read") {
  if (authConfigured()) return requirePermission(permission);
  return null;
}
