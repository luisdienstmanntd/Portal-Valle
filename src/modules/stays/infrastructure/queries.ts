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
export type StayBooking = { id: string; version: number; status: string; startsAt: string; experience: string; linked: boolean };
/** Linked bookings plus unlinked candidates of the same apartment; the operator still links explicitly. */
export async function loadStayBookings(stay: { id: string; apartment: string }): Promise<StayBooking[]> {
  const client = await createPortalServerClient();
  const select = "id,version,status,stay_id,apartment_number,occurrence_id";
  const [linked, candidates] = await Promise.all([
    client.from("experience_bookings").select(select).eq("stay_id", stay.id).limit(100),
    client.from("experience_bookings").select(select).is("stay_id", null).ilike("apartment_number", stay.apartment.replace(/[%_\\]/g, "\\$&"))
      .in("status", ["reserved", "confirmed"]).limit(100),
  ]);
  if (linked.error || candidates.error || !linked.data || !candidates.data) throw new Error("Não foi possível carregar as reservas da estadia.");
  const rows = [...linked.data, ...candidates.data];
  const ids = [...new Set(rows.map(row => row.occurrence_id))];
  if (!ids.length) return [];
  const [occurrences, experiences] = await Promise.all([
    client.from("experience_occurrences").select("id,starts_at,experience_id").in("id", ids),
    client.from("experiences").select("id,name"),
  ]);
  if (occurrences.error || experiences.error || !occurrences.data || !experiences.data) throw new Error("Não foi possível carregar as sessões da estadia.");
  const names = new Map(experiences.data.map(row => [row.id, row.name]));
  const sessions = new Map(occurrences.data.map(row => [row.id, row]));
  return rows.flatMap(row => {
    const session = sessions.get(row.occurrence_id);
    return session ? [{ id: row.id, version: row.version, status: row.status, startsAt: session.starts_at,
      experience: names.get(session.experience_id) ?? "Atividade", linked: row.stay_id === stay.id }] : [];
  }).sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}
