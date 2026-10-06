import "server-only";
import { z } from "zod";
import { createPortalServerClient } from "@/lib/supabase/server";
import { staySchema } from "../domain/model";
import { parseStayCursor, stayPage, stayPageSize } from "../domain/pagination";
export async function loadStays(cursor?: string) {
  const client = await createPortalServerClient();
  const after = parseStayCursor(cursor);
  let query = client.from("portal_stays").select("id,apartment,arrival_date,departure_date")
    .order("arrival_date", { ascending: false }).order("id").limit(stayPageSize + 1);
  if (after) query = query.or(`arrival_date.lt.${after.date},and(arrival_date.eq.${after.date},id.gt.${after.id})`);
  const result = await query;
  if (result.error || !result.data) throw new Error("Não foi possível carregar as estadias.");
  return stayPage(result.data.map(row => ({ id: row.id, apartment: row.apartment, arrivalDate: row.arrival_date, departureDate: row.departure_date })));
}
export async function loadStay(id: string) {
  const parsed = z.uuid().safeParse(id);
  if (!parsed.success) return null;
  const client = await createPortalServerClient();
  const result = await client.from("portal_stays").select("id,apartment,arrival_date,departure_date").eq("id", parsed.data).maybeSingle();
  if (result.error) throw new Error("Não foi possível carregar a estadia.");
  return result.data ? staySchema.parse({ id: result.data.id, apartment: result.data.apartment, arrivalDate: result.data.arrival_date, departureDate: result.data.departure_date }) : null;
}
