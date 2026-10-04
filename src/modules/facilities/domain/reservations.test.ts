import { expect, it } from "vitest";
import { mapFacilityReservations } from "./reservations";
const row = (slot_start = "13:00:00") => ({ id: "11111111-1111-4111-8111-111111111111", facility: "pool", reservation_date: "2026-10-03", slot_start });
it("mapeia slots civis, meia-noite e término no próximo dia sem PII", () => {
  const mapped = mapFacilityReservations([row("23:00:00"), { ...row("00:00"), id: "22222222-2222-4222-8222-222222222222" }], "2026-10-03", "pool");
  expect(mapped[0].start).toBe("2026-10-03T03:00:00.000Z");
  expect(mapped[1].end).toBe("2026-10-04T03:00:00.000Z");
  expect(mapped[0].id).toBe("facilities:22222222-2222-4222-8222-222222222222");
  expect(Object.keys(mapped[0])).toEqual(["id", "facility", "start", "end"]);
  expect(mapFacilityReservations([{ ...row("09:00"), facility: "gym" }], "2026-10-03", "gym")).toHaveLength(1);
});
it("rejeita schema divergente, PII, datas/slots inválidos, fonte errada, duplicatas e excesso", () => {
  const invalid = [null, [{ ...row(), guest_name: "Fictício" }], [{ ...row(), facility: "spa" }], [row("09:00")], [row("13:30")], [{ ...row(), reservation_date: "2026-02-30" }], [{ ...row(), reservation_date: "2026-10-04" }], [row(), row()], [row(), { ...row(), id: "22222222-2222-4222-8222-222222222222" }], Array.from({ length: 13 }, () => row())];
  for (const raw of invalid) expect(() => mapFacilityReservations(raw, "2026-10-03", "pool")).toThrow();
  expect(() => mapFacilityReservations([{ ...row("00:00"), reservation_date: "2018-11-04" }], "2018-11-04", "pool")).toThrow();
});
