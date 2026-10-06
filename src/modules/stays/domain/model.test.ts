import { expect, it } from "vitest";
import { parseStayActivities, staySchema } from "./model";
const stay = { id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", apartment: "403", arrivalDate: "2026-10-08", departureDate: "2026-10-12" };
const activity = { id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", stayId: stay.id, title: "Atividade fictícia", start: "2026-10-09T03:00:00Z", end: null, status: "confirmed" };
it("modelo próprio tem somente referência, apartamento e período civil válido", () => {
  expect(staySchema.parse(stay)).toEqual(stay);
  for (const value of [{ ...stay, id: "403" }, { ...stay, departureDate: "2026-10-07" }, { ...stay, arrivalDate: "2026-02-30" }, { ...stay, guest_name: "privado" }, { ...stay, apartment: "<script>" }]) expect(() => staySchema.parse(value)).toThrow();
  expect(staySchema.parse({ ...stay, departureDate: stay.arrivalDate })).toBeTruthy();
});
it("atividade exige vínculo explícito; apartamento coincidente não vincula", () => {
  for (const entry of [{ ...activity, stayId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc" }, { ...activity, stayId: null }, { ...activity, stayId: undefined }, { ...activity, apartment: "403" }, { ...activity, guest_name: "privado" }]) expect(() => parseStayActivities({ entries: [entry], complete: true }, stay, "portal")).toThrow();
});
it("intervalo civil inclui partida, preserva segundos e não inventa fim", () => {
  expect(parseStayActivities({ entries: [{ ...activity, start: "2026-10-13T02:59:59Z" }], complete: true }, stay, "osteria")[0]).toMatchObject({ date: "2026-10-12", end: null, source: "osteria" });
  for (const start of ["2026-10-08T02:59:59Z", "2026-10-13T03:00:00Z"]) expect(() => parseStayActivities({ entries: [{ ...activity, start }], complete: true }, stay, "pool")).toThrow();
});
it("lote parcial, duplicado ou duração inválida falha integralmente", () => {
  for (const response of [{ entries: [], complete: false }, { entries: [activity, activity], complete: true }, { entries: [{ ...activity, end: activity.start }], complete: true }, { entries: Array.from({ length: 501 }, () => activity), complete: true }]) expect(() => parseStayActivities(response, stay, "gym")).toThrow();
});
it("referências UUID normalizadas não duplicam vínculos por diferença de caixa", () => {
  const upper = { ...activity, id: activity.id.toUpperCase(), stayId: stay.id.toUpperCase() };
  expect(parseStayActivities({ entries: [upper], complete: true }, stay, "portal")[0].stayId).toBe(stay.id);
  expect(() => parseStayActivities({ entries: [activity, upper], complete: true }, stay, "portal")).toThrow();
});
