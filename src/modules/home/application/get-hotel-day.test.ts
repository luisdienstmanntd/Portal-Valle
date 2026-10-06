import { afterEach, expect, it, vi } from "vitest";
import { GetHotelDay } from "./get-hotel-day";
import type { AgendaProvider } from "../../agenda/domain/model";
const base = { date: "2026-10-06", now: () => new Date("2026-10-06T12:00:00Z"), facilities: null, osteria: null };
const portal = (getEntries: AgendaProvider["getEntries"], configured = true): AgendaProvider => ({ id: "portal", label: "Portal", configured, getEntries });
const session = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", type: "experience_session", title: "Filme fictício", experience: "Cine Toscana", start: "2026-10-06T22:00:00Z", end: "2026-10-06T23:00:00Z", location: "Local fictício", status: "published", href: "/experiencias/cine-toscana/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa" };
const facility = (name: string) => ({ id: session.id, facility: name, reservation_date: base.date, slot_start: "00:00" });
const restaurant = { id: session.id, data: base.date, horario: "20:15:32", hospede_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", hospedes: { tipo: "roomservice" }, paxs: 2, chd: 1, mesa_identificador: "ROOM", bloqueado: false, somente_hospedes: false, cancelado_em: null };
afterEach(() => vi.useRealTimers());
it("quatro desconhecidas não consultam fonte desconectada nem produzem zero", async () => {
  const query = vi.fn(); const day = await GetHotelDay({ ...base, portalProviders: [portal(query, false)] });
  expect(query).not.toHaveBeenCalled(); expect(day.sources.map(s => s.status)).toEqual(["unknown", "unknown", "unknown", "unknown"]);
  expect(day.sources.every(s => s.summary === null)).toBe(true); expect(day.entries).toEqual([]);
});
it("combina quatro áreas, ordena IDs sem colisão e não inventa duração Osteria", async () => {
  const day = await GetHotelDay({ ...base, portalProviders: [portal(async () => [session])], facilities: { readDay: async (_, name) => ({ rows: [facility(name)], complete: true }) }, osteria: { readDay: async () => ({ rows: [restaurant], complete: true }) } });
  expect(new Set(day.entries.map(e => e.id)).size).toBe(4); expect(day.entries[0].start).toBe("2026-10-06T03:00:00.000Z");
  expect(day.sources.map(s => s.status)).toEqual(["available", "available", "available", "available"]);
  expect(day.entries.find(e => e.id.startsWith("osteria:"))).toMatchObject({ start: "2026-10-06T23:15:32.000Z", end: null });
  expect(JSON.stringify(day)).not.toMatch(/hospede_id|guest_name|telefone|apartment/);
});
it("falha Portal não derruba demais e somente consultas válidas confirmam vazio", async () => {
  const provider = portal(async () => []);
  const day = await GetHotelDay({ ...base, portalProviders: [provider, provider], facilities: { readDay: async (_, name) => { if (name === "pool") throw new Error("private SQL"); return { rows: [], complete: true }; } }, osteria: { readDay: async () => ({ rows: [], complete: true }) } });
  expect(day.sources.map(s => s.status)).toEqual(["unavailable", "unavailable", "empty", "empty"]);
  expect(day.sources[0].summary).toBeNull(); expect(JSON.stringify(day)).not.toContain("private");
  const empty = await GetHotelDay({ ...base, portalProviders: [provider], facilities: { readDay: async () => ({ rows: [], complete: true }) }, osteria: { readDay: async () => ({ rows: [], complete: true }) } });
  expect(empty.sources.every(s => s.status === "empty")).toBe(true);
});
it("timeout e schema divergente isolados preservam sessão Portal", async () => {
  vi.useFakeTimers(); const signals: AbortSignal[] = [];
  const pending = GetHotelDay({ ...base, timeoutMs: 10, portalProviders: [portal(async () => [session])], facilities: { readDay: async (_, __, signal) => { signals.push(signal); return new Promise(() => {}); } }, osteria: { readDay: async () => ({ rows: [], complete: false }) } });
  await vi.advanceTimersByTimeAsync(11); const day = await pending;
  expect(day.sources.map(s => s.status)).toEqual(["available", "unavailable", "unavailable", "unavailable"]);
  expect(day.entries).toHaveLength(1); expect(signals.every(s => s.aborted)).toBe(true); expect(vi.getTimerCount()).toBe(0);
});
it("data inválida é rejeitada antes das consultas", async () => {
  const query = vi.fn(); await expect(GetHotelDay({ ...base, date: "2026-02-30", portalProviders: [portal(query)] })).rejects.toThrow(); expect(query).not.toHaveBeenCalled();
});
