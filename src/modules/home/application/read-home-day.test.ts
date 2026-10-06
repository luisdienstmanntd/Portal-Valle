import { describe, expect, it } from "vitest";
import { readHomeDay } from "./read-home-day";
import type { AgendaProvider } from "../../agenda/domain/model";

const date = "2026-10-06", now = () => new Date("2026-10-06T12:00:00Z");
const id = "00000000-0000-4000-8000-000000000001";
const provider = (getEntries: AgendaProvider["getEntries"], configured = true): AgendaProvider => ({ id: "portal", label: "Experiências Portal", configured, getEntries });
const session = { id, type: "experience_session", title: "Filme fictício", experience: "Cine Toscana", start: "2026-10-06T22:00:00Z", end: "2026-10-07T01:00:00Z", location: "Cinema", status: "published", href: `/experiencias/cine-toscana/${id}` };
const restaurant = { id, data: date, horario: "20:30:12", hospede_id: id, hospedes: { tipo: "hospede" }, paxs: 2, chd: 1, mesa_identificador: "01", bloqueado: false, somente_hospedes: false, cancelado_em: null };

describe("Home Hoje combina fontes independentes", () => {
  it("próxima atividade exclui rascunhos, concluídas e horários passados", async () => {
    for (const status of ["draft", "completed", "cancelled"]) {
      const day = await readHomeDay({ date, now, experienceProvider: provider(async () => [{ ...session, status }]), facilities: null, osteria: null });
      expect(day.nextEntry).toBeNull();
    }
    const day = await readHomeDay({ date, now: () => new Date("2026-10-07T00:00:00Z"), experienceProvider: provider(async () => [session]), facilities: null, osteria: null });
    expect(day.entries).toHaveLength(1); expect(day.nextEntry).toBeNull();
  });
  it("mantém fontes desconhecidas sem zeros e sem consultar readers ausentes", async () => {
    const day = await readHomeDay({ date, now, experienceProvider: provider(async () => { throw new Error("não deve consultar"); }, false), facilities: null, osteria: null });
    expect(day.agenda.sources[0].status).toBe("unknown");
    expect(day.pool.reservedSlots).toBeNull(); expect(day.gym.reservedSlots).toBeNull(); expect(day.osteria.summary).toBeNull(); expect(day.entries).toEqual([]);
  });
  it("ordena todos os domínios, preserva segundos e não inventa fim da Osteria", async () => {
    const day = await readHomeDay({ date, now, experienceProvider: provider(async () => [session]),
      facilities: { async readDay(requested, facility) { expect(requested).toBe(date); return { complete: true, rows: [{ id, facility, reservation_date: date, slot_start: facility === "pool" ? "13:00" : "23:00" }] }; } },
      osteria: { async readDay() { return { complete: true, rows: [restaurant] }; } } });
    expect(day.entries.map(row => row.title)).toEqual(["Piscina", "Filme fictício", "Osteria", "Academia"]);
    expect(new Set(day.entries.map(row => row.id)).size).toBe(4);
    expect(day.entries[2]).toMatchObject({ start: "2026-10-06T23:30:12.000Z", end: null });
    expect(day.entries[3].end).toBe("2026-10-07T03:00:00.000Z");
    expect(day.osteria.summary?.people).toBe(3);
    expect(day.nextEntry?.title).toBe("Piscina");
    expect(JSON.stringify(day.entries)).not.toContain("hospede_id");
  });
  it("isola falha Portal e Piscina, mantendo Academia e Osteria válidas", async () => {
    const day = await readHomeDay({ date, now, experienceProvider: provider(async () => { throw new Error("segredo de teste"); }),
      facilities: { async readDay(_date, facility) { if (facility === "pool") throw new Error("segredo externo"); return { complete: true, rows: [] }; } },
      osteria: { async readDay() { return { complete: true, rows: [restaurant] }; } } });
    expect(day.agenda.sources[0].status).toBe("unavailable"); expect(day.pool.status).toBe("unavailable");
    expect(day.gym).toMatchObject({ status: "empty", reservedSlots: 0 }); expect(day.entries).toHaveLength(1);
    expect(JSON.stringify(day)).not.toContain("segredo");
  });
  it("timeout não cooperativo e schema inválido não apagam sessões válidas", async () => {
    const day = await readHomeDay({ date, now, timeoutMs: 10, experienceProvider: provider(async () => [session]),
      facilities: { readDay: () => new Promise(() => {}) }, osteria: { async readDay() { return { complete: false, rows: [restaurant] }; } } });
    expect(day.pool.errorCode).toBe("TIMEOUT"); expect(day.gym.errorCode).toBe("TIMEOUT"); expect(day.osteria.errorCode).toBe("INVALID_PAYLOAD");
    expect(day.entries[0].title).toBe("Filme fictício"); expect(day.osteria.summary).toBeNull();
  });
  it("consulta vazia permite zero, canceladas ficam na timeline fora do resumo ativo", async () => {
    const empty = await readHomeDay({ date, now, experienceProvider: provider(async () => []), facilities: { async readDay() { return { complete: true, rows: [] }; } }, osteria: { async readDay() { return { complete: true, rows: [] }; } } });
    expect(empty.agenda.sources[0].status).toBe("empty"); expect(empty.pool.reservedSlots).toBe(0); expect(empty.osteria.summary?.people).toBe(0);
    const cancelled = await readHomeDay({ date, now, experienceProvider: provider(async () => [{ ...session, status: "cancelled" }]), facilities: null,
      osteria: { async readDay() { return { complete: true, rows: [{ ...restaurant, cancelado_em: now().toISOString() }] }; } } });
    expect(cancelled.entries.every(row => row.cancelled)).toBe(true); expect(cancelled.osteria.summary).toMatchObject({ reservations: 0, people: 0, cancelled: 1 });
    expect(cancelled.nextEntry).toBeNull();
  });
});
