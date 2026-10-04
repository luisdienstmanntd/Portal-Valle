import { z } from "zod";
import { localDateSchema } from "../../../lib/hotel-date";
import { hotelDateTimeToInstant } from "../../../lib/hotel-time";

export type Facility = "pool" | "gym";
const rowSchema = z.object({
  id: z.uuid().transform(value => value.toLowerCase()), facility: z.enum(["pool", "gym"]), reservation_date: localDateSchema,
  slot_start: z.string().regex(/^([01]\d|2[0-3]):00(?::00)?$/),
}).strict();
export type FacilityReservation = { id: string; facility: Facility; start: string; end: string };
export function mapFacilityReservations(raw: unknown, date: string, facility: Facility): FacilityReservation[] {
  localDateSchema.parse(date);
  z.enum(["pool", "gym"]).parse(facility);
  const rows = z.array(rowSchema).max(facility === "pool" ? 12 : 24).parse(raw);
  const ids = new Set<string>(), slots = new Set<string>();
  const result = rows.map(row => {
    const hour = Number(row.slot_start.slice(0, 2));
    if (row.facility !== facility || row.reservation_date !== date || (facility === "pool" && hour !== 0 && hour < 13)
      || ids.has(row.id) || slots.has(row.slot_start.slice(0, 5))) throw new Error("Contrato Facilities inválido.");
    ids.add(row.id); slots.add(row.slot_start.slice(0, 5));
    const start = hotelDateTimeToInstant(`${date}T${row.slot_start.slice(0, 5)}`);
    return { id: `facilities:${row.id}`, facility, start, end: new Date(Date.parse(start) + 60 * 60 * 1000).toISOString() };
  });
  return result.sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}
