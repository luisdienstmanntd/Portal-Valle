import { expect,it } from "vitest";
import { hotelDayRange,hotelToday } from "./hotel-date";
it("dia do hotel não depende do fuso da máquina",()=>{
 expect(hotelToday(new Date("2026-10-04T01:00:00Z"))).toBe("2026-10-03");
 expect(hotelDayRange("2026-10-03")).toEqual({date:"2026-10-03",from:"2026-10-03T03:00:00.000Z",until:"2026-10-04T03:00:00.000Z"});
});
it("meia-noite histórica inexistente e virada do limite superior",()=>{
 expect(hotelDayRange("2018-11-04")).toEqual({date:"2018-11-04",from:"2018-11-04T03:00:00.000Z",until:"2018-11-05T02:00:00.000Z"});
 expect(hotelDayRange("2099-12-31").until).toBe("2100-01-01T03:00:00.000Z");
 expect(()=>hotelDayRange("2026-02-30")).toThrow();
});
