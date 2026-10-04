import { z } from "zod";
import { localDateSchema } from "../../../lib/hotel-date";
import { mapOsteriaReservations, type OsteriaReservation } from "../domain/reservations";

export type OsteriaReader = { readDay(date: string, signal: AbortSignal): Promise<unknown> };
export type OsteriaDay = {
  date: string; status: "unknown" | "unavailable" | "empty" | "available"; reservations: OsteriaReservation[];
  summary: { reservations: number; adults: number; children: number; people: number; roomService: number; cancelled: number } | null;
  fetchedAt: string | null; errorCode: "TIMEOUT" | "UNAVAILABLE" | "INVALID_PAYLOAD" | null;
};
class ReadFailure extends Error { constructor(readonly code: "TIMEOUT" | "INVALID_PAYLOAD") { super(code); } }
export async function readOsteriaDay({ date, reader, now, timeoutMs = 5000 }: {
  date: string; reader: OsteriaReader | null; now: () => Date; timeoutMs?: number;
}): Promise<OsteriaDay> {
  localDateSchema.parse(date);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new Error("Consulta inválida.");
  if (!reader) return { date, status: "unknown", reservations: [], summary: null, fetchedAt: null, errorCode: null };
  const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { reject(new ReadFailure("TIMEOUT")); controller.abort(); }, timeoutMs); });
    const raw = await Promise.race([Promise.resolve().then(() => reader.readDay(date, controller.signal)), deadline]);
    let reservations: OsteriaReservation[];
    try {
      const response = z.object({ rows: z.unknown(), complete: z.literal(true) }).strict().parse(raw);
      reservations = mapOsteriaReservations(response.rows, date);
    } catch { throw new ReadFailure("INVALID_PAYLOAD"); }
    const active = reservations.filter(row => row.status === "scheduled");
    const summary = { reservations: active.length, adults: active.reduce((sum, row) => sum + row.adults, 0),
      children: active.reduce((sum, row) => sum + row.children, 0), people: active.reduce((sum, row) => sum + row.people, 0),
      roomService: active.filter(row => row.customerType === "roomservice").length, cancelled: reservations.length - active.length };
    return { date, status: reservations.length ? "available" : "empty", reservations, summary, fetchedAt: now().toISOString(), errorCode: null };
  } catch (error) {
    return { date, status: "unavailable", reservations: [], summary: null, fetchedAt: now().toISOString(), errorCode: error instanceof ReadFailure ? error.code : "UNAVAILABLE" };
  } finally { if (timer !== undefined) clearTimeout(timer); }
}
