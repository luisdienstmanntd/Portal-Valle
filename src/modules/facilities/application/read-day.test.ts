import { afterEach, expect, it, vi } from "vitest";
import { readFacilityDay } from "./read-day";
const base = { date: "2026-10-03", facility: "pool" as const, now: () => new Date("2026-10-03T12:00:00Z") };
afterEach(() => vi.useRealTimers());
it("fonte ausente não consulta nem inventa zero; vazio válido confirma zero", async () => {
  expect(await readFacilityDay({ ...base, reader: null })).toMatchObject({ status: "unknown", reservedSlots: null, fetchedAt: null });
  const readDay = vi.fn(async () => ({ rows: [], complete: true }));
  expect(await readFacilityDay({ ...base, reader: { readDay } })).toMatchObject({ status: "empty", reservedSlots: 0 });
  expect(readDay).toHaveBeenCalledExactlyOnceWith(base.date, base.facility, expect.any(AbortSignal));
});
it("401/403 e erro de transporte não expõem erro bruto nem zero", async () => {
  for (const status of [401, 403, 500]) {
    const result = await readFacilityDay({ ...base, reader: { readDay: async () => { throw new Error(`private ${status}`); } } });
    expect(result).toMatchObject({ status: "unavailable", reservedSlots: null, errorCode: "UNAVAILABLE" });
    expect(JSON.stringify(result)).not.toContain("private");
  }
  expect(await readFacilityDay({ ...base, reader: { readDay: async () => [{ facility: "spa" }] } })).toMatchObject({ status: "unavailable", errorCode: "INVALID_PAYLOAD" });
  expect(await readFacilityDay({ ...base, reader: { readDay: async () => ({ rows: [], complete: false }) } })).toMatchObject({ status: "unavailable", reservedSlots: null, errorCode: "INVALID_PAYLOAD" });
});
it("timeout aborta transport não cooperativo e limpa timer", async () => {
  vi.useFakeTimers(); let signal: AbortSignal | undefined;
  const result = readFacilityDay({ ...base, timeoutMs: 10, reader: { readDay: async (_, __, s) => { signal = s; return new Promise(() => {}); } } });
  await vi.advanceTimersByTimeAsync(11);
  expect(await result).toMatchObject({ status: "unavailable", errorCode: "TIMEOUT", reservedSlots: null });
  expect(signal?.aborted).toBe(true); expect(vi.getTimerCount()).toBe(0);
});
it("releituras refletem cancelamento por exclusão, sem cache nem mutação", async () => {
  const readDay = vi.fn().mockResolvedValueOnce({ rows: [{ id: "11111111-1111-4111-8111-111111111111", facility: "pool", reservation_date: base.date, slot_start: "13:00" }], complete: true }).mockResolvedValueOnce({ rows: [], complete: true });
  const reader = { readDay };
  expect(await readFacilityDay({ ...base, reader })).toMatchObject({ status: "available", reservedSlots: 1 });
  expect(await readFacilityDay({ ...base, reader })).toMatchObject({ status: "empty", reservedSlots: 0 });
  expect(Object.keys(reader)).toEqual(["readDay"]); expect(readDay).toHaveBeenCalledTimes(2);
});
