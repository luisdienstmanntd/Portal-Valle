import "server-only";
import { z } from "zod";
import { createPortalServerClient } from "@/lib/supabase/server";
import { loadWeek } from "@/modules/experiences/infrastructure/queries";
import { stayRange } from "../domain/stay";
import type { StayReader } from "../application/read-stay";

const bookingProjection = z.object({ id: z.uuid(), occurrence_id: z.uuid(), apartment_number: z.string(),
  status: z.enum(["reserved", "confirmed", "cancelled", "no_show"]) }).strict();
export const readPortalStay: StayReader = async (scope, signal) => {
  const range = stayRange(scope);
  const { experiences, occurrences } = await loadWeek(range.from, range.until, signal);
  if (!occurrences.length) return [];
  const client = await createPortalServerClient(false, signal);
  const rows = await client.from("experience_bookings").select("id,occurrence_id,apartment_number,status")
    .eq("apartment_number", scope.apartment).in("occurrence_id", occurrences.map(o => o.id))
    .order("id").limit(101).abortSignal(signal);
  if (rows.error || !rows.data || rows.data.length > 100) throw new Error("Consulta de inscrições indisponível.");
  return rows.data.map(raw => {
    const booking = bookingProjection.parse(raw);
    const occurrence = occurrences.find(o => o.id === booking.occurrence_id);
    const experience = experiences.find(e => e.id === occurrence?.experience_id);
    if (!occurrence || !experience) throw new Error("Vínculo de inscrição inválido.");
    return { id: booking.id, sessionId: occurrence.id, apartment: booking.apartment_number,
      slug: experience.slug, title: occurrence.metadata.film_title ?? occurrence.title_override ?? experience.name,
      start: occurrence.starts_at, end: occurrence.ends_at, bookingStatus: booking.status, sessionStatus: occurrence.status };
  });
};
