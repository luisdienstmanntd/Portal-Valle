import { afterEach, expect, it, vi } from "vitest";
import { readOsteriaDay } from "./read-day";
const base = { date: "2026-10-03", now: () => new Date("2026-10-03T12:00:00Z") };
const row = () => ({ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", data: base.date, horario: "20:00", hospede_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  hospedes: { tipo: "roomservice" }, paxs: 2, chd: 1, mesa_identificador: "ROOM", bloqueado: false, somente_hospedes: false, cancelado_em: null });
afterEach(() => vi.useRealTimers());
it("desconhecido/falha não produz zero, somente consulta completa permite resumo", async () => {
  expect(await readOsteriaDay({ ...base, reader: null })).toMatchObject({ status: "unknown", summary: null, fetchedAt: null });
  expect(await readOsteriaDay({ ...base, reader: { readDay: async () => ({ rows: [], complete: true }) } })).toMatchObject({ status: "empty", summary: { reservations: 0, people: 0 } });
  for (const raw of [[], { rows: [], complete: false }, { rows: [{ ...row(), pagamento: "pago" }], complete: true }])
    expect(await readOsteriaDay({ ...base, reader: { readDay: async () => raw } })).toMatchObject({ status: "unavailable", summary: null, errorCode: "INVALID_PAYLOAD" });
});
it("conta ativos sem canceladas/bloqueios, restauração aparece na próxima leitura", async () => {
  const cancelled = { ...row(), id: "11111111-1111-4111-8111-111111111111", cancelado_em: "2026-10-03T12:00:00Z" };
  const readDay = vi.fn().mockResolvedValueOnce({ rows: [row(), cancelled, { ...row(), id: "22222222-2222-4222-8222-222222222222", bloqueado: true }], complete: true })
    .mockResolvedValueOnce({ rows: [row(), { ...cancelled, cancelado_em: null }], complete: true });
  const reader = { readDay };
  expect(await readOsteriaDay({ ...base, reader })).toMatchObject({ status: "available", summary: { reservations: 1, adults: 2, children: 1, people: 3, roomService: 1, cancelled: 1 } });
  expect(await readOsteriaDay({ ...base, reader })).toMatchObject({ summary: { reservations: 2, people: 6, cancelled: 0 } });
  expect(Object.keys(reader)).toEqual(["readDay"]); expect(readDay).toHaveBeenCalledTimes(2);
});
it("401/403/erro não escapam para DTO", async () => {
  for (const status of [401, 403, 500]) {
    const result = await readOsteriaDay({ ...base, reader: { readDay: async () => { throw new Error(`private ${status}`); } } });
    expect(result).toMatchObject({ status: "unavailable", summary: null, errorCode: "UNAVAILABLE" }); expect(JSON.stringify(result)).not.toContain("private");
  }
});
it("deadline aborta provider não cooperativo e limpa timers", async () => {
  vi.useFakeTimers(); let signal: AbortSignal | undefined;
  const result = readOsteriaDay({ ...base, timeoutMs: 10, reader: { readDay: async (_, s) => { signal = s; return new Promise(() => {}); } } });
  await vi.advanceTimersByTimeAsync(11); expect(await result).toMatchObject({ status: "unavailable", summary: null, errorCode: "TIMEOUT" });
  expect(signal?.aborted).toBe(true); expect(vi.getTimerCount()).toBe(0);
});
