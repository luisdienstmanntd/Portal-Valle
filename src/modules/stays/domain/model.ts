import { z } from "zod";
import { localDateSchema } from "../../../lib/hotel-date";
import { hotelDateTime } from "../../../lib/hotel-time";

/** Concept only: no persistence, automatic association or PMS identity. */
const uuid = z.uuid().transform(value => value.toLowerCase());
export const staySchema = z.object({
  id: uuid, apartment: z.string().trim().min(1).max(30).regex(/^[\p{L}\p{N} -]+$/u),
  arrivalDate: localDateSchema, departureDate: localDateSchema,
}).strict().refine(value => value.departureDate >= value.arrivalDate, { message: "Período inválido." });
export type Stay = z.infer<typeof staySchema>;
export const staySources = ["portal", "pool", "gym", "osteria"] as const;
export type StaySource = typeof staySources[number];
const activitySchema = z.object({
  id: uuid, stayId: uuid, title: z.string().trim().min(1).max(160),
  start: z.iso.datetime({ offset: true }), end: z.iso.datetime({ offset: true }).nullable(),
  status: z.enum(["reserved", "confirmed", "cancelled", "completed"]),
}).strict().refine(value => value.end === null || Date.parse(value.end) > Date.parse(value.start));
export type StayActivity = z.infer<typeof activitySchema> & { source: StaySource; key: string; date: string };

export function parseStayActivities(raw: unknown, stay: Stay, source: StaySource): StayActivity[] {
  const scope = staySchema.parse(stay);
  if (!staySources.includes(source)) throw new Error("Fonte inválida.");
  const response = z.object({ entries: z.array(activitySchema).max(500), complete: z.literal(true) }).strict().parse(raw);
  if (new Set(response.entries.map(entry => entry.id)).size !== response.entries.length) throw new Error("Atividade repetida.");
  return response.entries.map(entry => {
    const date = hotelDateTime(entry.start).slice(0, 10);
    // Civil departure day is included; this does not imply a checkout time.
    if (entry.stayId !== scope.id || date < scope.arrivalDate || date > scope.departureDate) throw new Error("Vínculo inválido.");
    return { ...entry, source, key: `${source}:${entry.id}`, date };
  });
}
