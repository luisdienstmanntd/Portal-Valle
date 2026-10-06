import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { readHomeDay } from "../application/read-home-day";
import { HomeDayView } from "./home-day";

const date = "2026-10-06", now = () => new Date("2026-10-06T12:00:00Z"), id = "11111111-1111-4111-8111-111111111111";
const portal = { id: "portal", label: "Experiências Portal", configured: true, async getEntries() {
  return [{ id, type: "experience_session", title: "Sessão fictícia resiliente", experience: "Cine Toscana", start: "2026-10-06T22:00:00Z", end: "2026-10-06T23:00:00Z", location: "Cinema", status: "published", href: `/experiencias/cine-toscana/${id}` }];
} };
const row = { id, data: date, horario: "20:00", hospede_id: id, hospedes: { tipo: "hospede" }, paxs: 2, chd: 0, mesa_identificador: "01", bloqueado: false, somente_hospedes: false, cancelado_em: null };
describe("degradação visível da Home", () => {
  it("Osteria offline não oculta horários Facilities ou sessão Portal", async () => {
    const day = await readHomeDay({ date, now, experienceProvider: portal,
      facilities: { async readDay(_date, facility) { return { complete: true, rows: [{ id, facility, reservation_date: date, slot_start: "13:00" }] }; } },
      osteria: { async readDay() { throw new Error("PRIVATE-SQL-SECRET"); } } });
    const html = renderToStaticMarkup(createElement(HomeDayView, { day }));
    expect(html).toContain("Sessão fictícia resiliente"); expect(html).toContain("1 horários reservados.");
    expect(html).toContain("Consulta indisponível"); expect(html).toContain("Visão parcial do dia");
    expect(html).not.toContain("0 reservas ativas"); expect(html).not.toContain("PRIVATE-SQL-SECRET");
    expect(day.entries).toHaveLength(3);
  });
  it("Facilities offline preserva Osteria; recuperação remove falha sem cache", async () => {
    let offline = true;
    const facilities = { async readDay() { if (offline) throw new Error("PRIVATE-transport"); return { complete: true, rows: [] }; } };
    const options = { date, now, experienceProvider: portal, facilities, osteria: { async readDay() { return { complete: true, rows: [row] }; } } };
    const failed = await readHomeDay(options), html = renderToStaticMarkup(createElement(HomeDayView, { day: failed }));
    expect(html).toContain("1 reservas ativas"); expect(html).not.toContain("0 horários reservados"); expect(html).not.toContain("PRIVATE-transport");
    offline = false; const recovered = await readHomeDay(options), recoveredHtml = renderToStaticMarkup(createElement(HomeDayView, { day: recovered }));
    expect(recoveredHtml).not.toContain("Visão parcial do dia"); expect(recoveredHtml).not.toContain("Consulta indisponível");
    expect(recovered.pool.reservedSlots).toBe(0);
  });
  it.each(["offline", "schema", "timeout"])("dois externos em %s preservam Portal e não informam dia vazio", async mode => {
    const fail = async () => { if (mode === "offline") throw new Error("PRIVATE-secret"); if (mode === "timeout") return new Promise(() => {}); return { complete: true, rows: [{ unexpected: "PRIVATE-data" }] }; };
    const day = await readHomeDay({ date, now, timeoutMs: 10, experienceProvider: portal, facilities: { readDay: fail }, osteria: { readDay: fail } });
    const html = renderToStaticMarkup(createElement(HomeDayView, { day }));
    expect(html).toContain("Sessão fictícia resiliente"); expect(html).toContain("Visão parcial do dia");
    expect(html).not.toContain("Nenhuma atividade encontrada"); expect(html).not.toContain("PRIVATE");
    expect(day.pool.reservedSlots).toBeNull(); expect(day.osteria.summary).toBeNull();
    expect(day.entries).toHaveLength(1);
  });
});
