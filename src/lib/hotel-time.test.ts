import { expect, it } from "vitest";
import { hotelDateTimeToInstant, hotelDateTimeWithSeconds } from "./hotel-time";
it("converte minutos e segundos civis exatos inclusive offset histórico com segundos", () => {
  expect(hotelDateTimeToInstant("2026-10-03T20:00")).toBe("2026-10-03T23:00:00.000Z");
  expect(hotelDateTimeToInstant("2026-10-03T20:00:32")).toBe("2026-10-03T23:00:32.000Z");
  for (const local of ["1900-01-01T20:00:32", "1900-01-01T00:00:00", "2018-11-04T01:30:45"]) expect(hotelDateTimeWithSeconds(hotelDateTimeToInstant(local))).toBe(local);
  for (const invalid of ["2026-02-30T20:00:00", "2026-10-03T20:00:60", "2018-11-04T00:30:32"]) expect(() => hotelDateTimeToInstant(invalid)).toThrow();
});
