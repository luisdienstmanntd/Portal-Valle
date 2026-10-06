import { afterEach, expect, it, vi } from "vitest";
import { GetHotelDay } from "./get-hotel-day";
import type { AgendaProvider } from "../../agenda/domain/model";
import type { FacilitiesReader } from "../../facilities/application/read-day";
import type { OsteriaReader } from "../../osteria/application/read-day";

const date = "2026-10-06", now = () => new Date("2026-10-06T12:00:00Z");
const id = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const session = { id, type: "experience_session", title: "Sessão fictícia", experience: "Cine Toscana", start: "2026-10-06T22:00:00Z", end: "2026-10-06T23:00:00Z", location: "Local fictício", status: "published", href: `/experiencias/cine-toscana/${id}` };
const facilitiesRows = (facility: string) => ({ rows: [{ id, facility, reservation_date: date, slot_start: "13:00" }], complete: true });
const osteriaRows = { rows: [{ id, data: date, horario: "20:00", hospede_id: id, hospedes: { tipo: "hospede" }, paxs: 2, chd: 0, mesa_identificador: "A", bloqueado: false, somente_hospedes: false, cancelado_em: null }], complete: true };
type Target = "portal" | "facilities" | "osteria";
function healthy() {
  const portal: AgendaProvider = { id: "portal", label: "Portal", configured: true, getEntries: async () => [session] };
  const facilities: FacilitiesReader = { readDay: async (_, facility) => facilitiesRows(facility) };
  const osteria: OsteriaReader = { readDay: async () => osteriaRows };
  return { date, now, portalProviders: [portal], facilities, osteria, timeoutMs: 10 };
}
const affected = (target: Target) => target === "facilities" ? ["pool", "gym"] : [target];
afterEach(() => vi.useRealTimers());

for (const target of ["portal", "facilities", "osteria"] as const) {
  for (const failure of ["offline", "timeout", "schema"] as const) {
    it(`${target} ${failure}: preserva fontes válidas sem zero, PII ou erro bruto`, async () => {
      vi.useFakeTimers(); const input = healthy(); const signals: AbortSignal[] = [];
      const broken = async (signal: AbortSignal) => {
        signals.push(signal);
        if (failure === "offline") throw new Error("private connection URL/token");
        if (failure === "timeout") return new Promise<never>(() => {});
        return target === "portal" ? [{ ...session, private_guest: "não divulgar" }] : { rows: [], complete: false };
      };
      if (target === "portal") input.portalProviders[0].getEntries = (_, signal) => broken(signal);
      if (target === "facilities") input.facilities.readDay = (_, __, signal) => broken(signal);
      if (target === "osteria") input.osteria.readDay = (_, signal) => broken(signal);
      const pending = GetHotelDay(input);
      await vi.advanceTimersByTimeAsync(11); const day = await pending;
      const failed = affected(target);
      for (const source of day.sources) {
        expect(source.status).toBe(failed.includes(source.id) ? "unavailable" : "available");
        if (failed.includes(source.id)) expect(source.summary).toBeNull();
        else expect(source.summary).not.toBeNull();
      }
      expect(day.entries).toHaveLength(4 - failed.length);
      expect(JSON.stringify(day)).not.toMatch(/private|URL|token|hospede_id/);
      if (failure === "timeout") expect(signals.every(signal => signal.aborted)).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    });
  }
}

it("nova consulta recupera fonte sem reaproveitar falha ou dados antigos", async () => {
  const input = healthy(); input.osteria.readDay = vi.fn().mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce(osteriaRows);
  const first = await GetHotelDay(input); const second = await GetHotelDay(input);
  expect(first.sources.find(s => s.id === "osteria")).toMatchObject({ status: "unavailable", summary: null });
  expect(second.sources.find(s => s.id === "osteria")?.status).toBe("available");
  expect(first.entries).toHaveLength(3); expect(second.entries).toHaveLength(4);
});

it("todas as consultas começam antes de qualquer resposta, sem fila por fonte", async () => {
  const input = healthy(), started: string[] = [], release: (() => void)[] = [];
  const gate = (name: string) => { started.push(name); return new Promise<void>(resolve => release.push(resolve)); };
  input.portalProviders[0].getEntries = async () => { await gate("portal"); return [session]; };
  input.facilities.readDay = async (_, facility) => { await gate(facility); return facilitiesRows(facility); };
  input.osteria.readDay = async () => { await gate("osteria"); return osteriaRows; };
  const pending = GetHotelDay({ ...input, timeoutMs: 1000 });
  await Promise.resolve(); await Promise.resolve();
  expect(started.sort()).toEqual(["gym", "osteria", "pool", "portal"]);
  release.forEach(resolve => resolve()); expect((await pending).entries).toHaveLength(4);
});

it("resposta tardia após deadline não altera o resultado entregue", async () => {
  vi.useFakeTimers(); const input = healthy(); let resolveLate!: (value: unknown) => void;
  input.osteria.readDay = () => new Promise(resolve => { resolveLate = resolve; });
  const pending = GetHotelDay(input); await vi.advanceTimersByTimeAsync(11); const day = await pending;
  const snapshot = JSON.stringify(day); resolveLate(osteriaRows); await Promise.resolve();
  expect(JSON.stringify(day)).toBe(snapshot); expect(day.entries).toHaveLength(3); expect(vi.getTimerCount()).toBe(0);
});
