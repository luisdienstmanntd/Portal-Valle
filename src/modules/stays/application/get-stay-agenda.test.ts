import { afterEach, expect, it, vi } from "vitest";
import { GetStayAgenda, type StayActivityReader } from "./get-stay-agenda";
const stay = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", apartment: "403", arrivalDate: "2026-10-08", departureDate: "2026-10-12" };
const entry = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", stayId: stay.id, title: "Atividade fictícia", start: "2026-10-09T03:00:00Z", end: null, status: "confirmed" };
const base = { stay, now: () => new Date("2026-10-06T12:00:00Z") };
const reader: StayActivityReader = { readStayActivities: async () => ({ entries: [entry], complete: true }) };
afterEach(() => vi.useRealTimers());
it("sem readers não afirma estadia vazia nem exibe atividades inventadas", async () => {
  const result = await GetStayAgenda({ ...base, readers: { portal: null, pool: null, gym: null, osteria: null } });
  expect(result.sources.every(source => source.status === "unknown" && source.linkedActivities === null && source.fetchedAt === null)).toBe(true); expect(result.entries).toEqual([]);
});
it("combina vínculos exatos com IDs compostos e cancelamentos distintos", async () => {
  const result = await GetStayAgenda({ ...base, readers: { portal: reader, pool: reader, gym: reader, osteria: { readStayActivities: async () => ({ entries: [{ ...entry, status: "cancelled" }], complete: true }) } } });
  expect(result.entries.map(entry => entry.key)).toEqual(["gym:", "osteria:", "pool:", "portal:"].map(prefix => prefix + entry.id));
  expect(result.entries.filter(entry => entry.status === "cancelled")).toHaveLength(1);
  expect(JSON.stringify(result)).not.toMatch(/guest_name|telefone|notes|payment/);
});
it("vínculo incompatível e fonte offline não eliminam outra atividade válida", async () => {
  const result = await GetStayAgenda({ ...base, readers: { portal: reader, pool: { readStayActivities: async () => { throw new Error("private SQL"); } }, gym: null, osteria: { readStayActivities: async () => ({ entries: [{ ...entry, stayId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" }], complete: true }) } } });
  expect(result.sources.map(source => source.status)).toEqual(["available", "unavailable", "unknown", "unavailable"]); expect(result.entries).toHaveLength(1); expect(JSON.stringify(result)).not.toContain("private");
});
it("timeout não cooperativo aborta e consulta completa vazia conta apenas vínculos", async () => {
  vi.useFakeTimers(); let signal: AbortSignal | undefined;
  const pending = GetStayAgenda({ ...base, timeoutMs: 10, readers: { portal: { readStayActivities: async (_, value) => { signal = value; return new Promise(() => {}); } }, pool: { readStayActivities: async () => ({ entries: [], complete: true }) }, gym: null, osteria: null } });
  await vi.advanceTimersByTimeAsync(11); const result = await pending;
  expect(result.sources[0]).toMatchObject({ status: "unavailable", linkedActivities: null, errorCode: "TIMEOUT" }); expect(result.sources[1]).toMatchObject({ status: "empty", linkedActivities: 0 }); expect(signal?.aborted).toBe(true); expect(vi.getTimerCount()).toBe(0);
});
it("escopo inválido não chega ao reader", async () => {
  const query = vi.fn(); await expect(GetStayAgenda({ ...base, stay: { ...stay, departureDate: "2026-10-07" }, readers: { portal: { readStayActivities: query }, pool: null, gym: null, osteria: null } })).rejects.toThrow(); expect(query).not.toHaveBeenCalled();
});
