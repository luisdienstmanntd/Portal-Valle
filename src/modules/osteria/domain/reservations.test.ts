import { expect, it } from "vitest";
import { mapOsteriaReservations } from "./reservations";
const row = () => ({ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", data: "2026-10-03", horario: "19:17:32",
  hospede_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", hospedes: { tipo: "hospede" }, paxs: 2, chd: 1,
  mesa_identificador: "Varanda A", bloqueado: false, somente_hospedes: false, cancelado_em: null });
it("preserva horário extra/segundos, mesa textual, pessoas e tipo sem PII", () => {
  const mapped = mapOsteriaReservations([row()], "2026-10-03");
  expect(mapped[0]).toEqual({ id: "osteria:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", start: "2026-10-03T22:17:32.000Z",
    adults: 2, children: 1, people: 3, table: "Varanda A", customerType: "hospede", status: "scheduled" });
  const room = mapOsteriaReservations([{ ...row(), hospedes: { tipo: "roomservice" }, mesa_identificador: "ROOM" }], "2026-10-03")[0];
  expect(room.customerType).toBe("roomservice"); expect(room.table).toBe("ROOM");
  expect(mapOsteriaReservations([{ ...row(), mesa_identificador: "ROOM" }], "2026-10-03")[0].customerType).toBe("hospede");
});
it("exclui linhas vazias e bloqueios explicitamente e mantém canceladas distintas", () => {
  expect(mapOsteriaReservations([{ ...row(), hospede_id: null, hospedes: null, paxs: 0, chd: 0 }], "2026-10-03")).toEqual([]);
  expect(mapOsteriaReservations([{ ...row(), bloqueado: true }], "2026-10-03")).toEqual([]);
  expect(mapOsteriaReservations([{ ...row(), somente_hospedes: true }], "2026-10-03")).toEqual([]);
  expect(mapOsteriaReservations([{ ...row(), cancelado_em: "2026-10-03T12:00:00Z" }], "2026-10-03")[0].status).toBe("cancelled");
});
it("rejeita join ausente, enums, dados pessoais, contagens, datas/horas e schema inválidos", () => {
  for (const value of [{ ...row(), hospedes: null }, { ...row(), hospedes: { tipo: "desconhecido" } }, { ...row(), obs: "Privado" },
    { ...row(), paxs: -1 }, { ...row(), chd: 0.5 }, { ...row(), paxs: 0 }, { ...row(), horario: "24:00" }, { ...row(), horario: "19:00:60" },
    { ...row(), data: "2026-02-30" }, { ...row(), data: "2026-10-04" }]) expect(() => mapOsteriaReservations([value], "2026-10-03")).toThrow();
  expect(() => mapOsteriaReservations([{ ...row(), data: "2018-11-04", horario: "00:30" }], "2018-11-04")).toThrow();
});
it("rejeita IDs repetidos inclusive caixa diferente e excesso sem truncar", () => {
  expect(() => mapOsteriaReservations([row(), { ...row(), id: row().id.toUpperCase() }], "2026-10-03")).toThrow();
  expect(() => mapOsteriaReservations(Array.from({ length: 501 }, row), "2026-10-03")).toThrow();
  const ordered = mapOsteriaReservations([row(), { ...row(), id: "11111111-1111-4111-8111-111111111111", horario: "00:00" }], "2026-10-03");
  expect(ordered[0].start).toBe("2026-10-03T03:00:00.000Z");
});
