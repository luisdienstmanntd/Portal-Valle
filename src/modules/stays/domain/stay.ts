import { z } from "zod";
import { addDays, hotelDayRange, localDateSchema } from "@/lib/hotel-date";

/** A manually selected consultation window, never an inferred guest identity. */
export const stayScopeSchema = z.object({
  apartment: z.string().trim().min(1).max(30),
  arrival: localDateSchema,
  departure: localDateSchema,
}).strict().refine(s => localDateSchema.safeParse(s.arrival).success && localDateSchema.safeParse(s.departure).success &&
  s.departure >= s.arrival && s.departure <= addDays(s.arrival, 30), {
  message: "Escolha um período de até 31 dias, com fim igual ou posterior ao início.",
});
export type StayScope = z.infer<typeof stayScopeSchema>;
export function stayRange(scope: StayScope) {
  const valid = stayScopeSchema.parse(scope);
  return { from: hotelDayRange(valid.arrival).from, until: hotelDayRange(valid.departure).until };
}
export const stayEntrySchema = z.object({
  id: z.uuid(), sessionId: z.uuid(), apartment: z.string(),
  slug: z.enum(["cine-toscana", "la-vera-pizza"]), title: z.string().min(1).max(160),
  start: z.iso.datetime({ offset: true }), end: z.iso.datetime({ offset: true }),
  bookingStatus: z.enum(["reserved", "confirmed", "cancelled", "no_show"]),
  sessionStatus: z.enum(["draft", "published", "cancelled", "completed"]),
}).strict().refine(e => Date.parse(e.end) > Date.parse(e.start));
export type StayEntry = z.infer<typeof stayEntrySchema>;
export type StayView = { scope: StayScope; status: "unknown" | "unavailable" | "empty" | "available"; entries: StayEntry[] };
