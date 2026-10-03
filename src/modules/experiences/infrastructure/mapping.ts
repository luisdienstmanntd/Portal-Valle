import { z } from "zod";
import type { Database } from "@/lib/supabase/database.types";
import { bookingSchema, experienceSchema, occurrenceSchema } from "../domain/model";
type Rows = Database["public"]["Tables"];
const timestamps = z.object({ created_at: z.iso.datetime({ offset: true }), updated_at: z.iso.datetime({ offset: true }) });

/** Database-generated timestamps are validated, then separated from pure domain data. */
function withoutTimestamps(row: Rows["experiences"]["Row"] | Rows["experience_occurrences"]["Row"] | Rows["experience_bookings"]["Row"]) {
  const { created_at, updated_at, ...value } = row;
  timestamps.parse({ created_at, updated_at });
  return value;
}
export function toExperience(row: Rows["experiences"]["Row"]) { return experienceSchema.parse(withoutTimestamps(row)); }
export function toOccurrence(row: Rows["experience_occurrences"]["Row"]) { return occurrenceSchema.parse(withoutTimestamps(row)); }
export function toBooking(row: Rows["experience_bookings"]["Row"]) { return bookingSchema.parse(withoutTimestamps(row)); }
