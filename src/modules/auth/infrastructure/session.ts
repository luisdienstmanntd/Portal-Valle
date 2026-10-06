import "server-only";
import { redirect, unstable_rethrow } from "next/navigation";
import { createPortalServerClient } from "@/lib/supabase/server";
import { readPortalSupabaseConfig } from "@/lib/supabase/config";
import { z } from "zod";
import { can, roles, type Permission, type Staff } from "../domain/permissions";
import { AccessUnavailable, withAccessDeadline } from "../application/deadline";

export function authConfigured() { return readPortalSupabaseConfig(process.env) !== null; }

export async function getStaff(parentSignal?: AbortSignal): Promise<Staff | null> {
  if (!authConfigured()) return null;
  return withAccessDeadline(async signal => {
    const client = await createPortalServerClient(false, parentSignal ? AbortSignal.any([parentSignal, signal]) : signal);
    const { data: { user }, error } = await client.auth.getUser();
    if (error && (!error.status || error.status >= 500)) throw new AccessUnavailable();
    if (error || !user) return null;
    // RLS checks live sessions and profile. A database error is not an anonymous user.
    const { data: profile, error: profileError } = await client.from("portal_profiles").select("id,role,active").eq("id", user.id).maybeSingle();
    if (profileError) throw new AccessUnavailable();
    if (!profile) return null;
    const staff = z.object({ id: z.uuid(), role: z.enum(roles), active: z.boolean() }).strict().parse(profile);
    if (staff.id !== user.id) throw new AccessUnavailable();
    return staff;
  });
}

export async function requirePermission(permission: Permission): Promise<Staff> {
  if (!authConfigured()) throw new Error("Acesso da equipe ainda não disponível.");
  let staff: Staff | null;
  try { staff = await getStaff(); }
  catch (error) { unstable_rethrow(error); redirect("/indisponivel"); }
  if (!staff) redirect("/login");
  if (!can(staff, permission)) redirect("/acesso-negado");
  return staff;
}

/** Only preparation pages can remain public while configuration is absent. */
export async function guardPreparationPage(permission: Permission = "portal.read") {
  if (authConfigured()) await requirePermission(permission);
}
