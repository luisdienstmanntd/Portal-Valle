import { localDateSchema } from "../../../lib/hotel-date";
import { z } from "zod";
import { mapFacilityReservations, type Facility, type FacilityReservation } from "../domain/reservations";

// Implement only with a separately verified SELECT-only identity or official read endpoint.
// No administrative Supabase client, shared reception cookie or write methods.
export type FacilitiesReader = { readDay(date: string, facility: Facility, signal: AbortSignal): Promise<unknown> };
export type FacilityDay = {
  date: string; facility: Facility; status: "unknown" | "unavailable" | "empty" | "available";
  reservations: FacilityReservation[]; reservedSlots: number | null; fetchedAt: string | null;
  errorCode: "TIMEOUT" | "UNAVAILABLE" | "INVALID_PAYLOAD" | null;
};
class ReadFailure extends Error { constructor(readonly code: "TIMEOUT" | "INVALID_PAYLOAD") { super(code); } }
export async function readFacilityDay({ date, facility, reader, now, timeoutMs = 5000 }: {
  date: string; facility: Facility; reader: FacilitiesReader | null; now: () => Date; timeoutMs?: number;
}): Promise<FacilityDay> {
  localDateSchema.parse(date);
  if (!["pool", "gym"].includes(facility) || !Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new Error("Consulta inválida.");
  const base = { date, facility };
  if (!reader) return { ...base, status: "unknown", reservations: [], reservedSlots: null, fetchedAt: null, errorCode: null };
  const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { reject(new ReadFailure("TIMEOUT")); controller.abort(); }, timeoutMs); });
    const raw = await Promise.race([Promise.resolve().then(() => reader.readDay(date, facility, controller.signal)), deadline]);
    let reservations: FacilityReservation[];
    try {
      const response = z.object({ rows: z.unknown(), complete: z.literal(true) }).strict().parse(raw);
      reservations = mapFacilityReservations(response.rows, date, facility);
    } catch { throw new ReadFailure("INVALID_PAYLOAD"); }
    return { ...base, status: reservations.length ? "available" : "empty", reservations, reservedSlots: reservations.length, fetchedAt: now().toISOString(), errorCode: null };
  } catch (error) {
    return { ...base, status: "unavailable", reservations: [], reservedSlots: null, fetchedAt: now().toISOString(), errorCode: error instanceof ReadFailure ? error.code : "UNAVAILABLE" };
  } finally { if (timer !== undefined) clearTimeout(timer); }
}
