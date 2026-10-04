import { describe,it,expect } from "vitest";
import { addDays,monday,weekRange,hotelToday,duplicateWeekSchema } from "./week";
describe("semana do hotel",()=>{
  it("segunda/domingo e virada do ano",()=>{
    expect(monday("2027-01-03")).toBe("2026-12-28");
    expect(addDays("2026-12-28",7)).toBe("2027-01-04");
    expect(weekRange("2026-10-04")).toMatchObject({start:"2026-09-28",end:"2026-10-05",from:"2026-09-28T03:00:00.000Z",until:"2026-10-05T03:00:00.000Z"});
  });
  it("relógio injetado usa o dia de Gramado",()=>expect(hotelToday(new Date("2026-10-04T01:00:00Z"))).toBe("2026-10-03"));
  it("fronteiras respeitam mudanças históricas de offset",()=>expect(weekRange("2018-10-29")).toMatchObject({from:"2018-10-29T03:00:00.000Z",until:"2018-11-05T02:00:00.000Z"}));
  it("datas impossíveis, semana igual e payload extra falham",()=>{
    expect(()=>weekRange("2026-02-30")).toThrow();
    expect(()=>weekRange("0000-01-01")).toThrow();
    expect(()=>weekRange("9999-12-31")).toThrow();
    expect(weekRange("2099-12-31").end).toBe("2100-01-04");
    expect(duplicateWeekSchema.safeParse({source_week:"2026-10-05",target_week:"2026-10-05"}).success).toBe(false);
    expect(duplicateWeekSchema.safeParse({source_week:"2026-10-06",target_week:"2026-10-12"}).success).toBe(false);
    expect(duplicateWeekSchema.safeParse({source_week:"2026-12-28",target_week:"2027-01-04"}).success).toBe(true);
    expect(duplicateWeekSchema.safeParse({source_week:"2026-12-28",target_week:"2027-01-04",bookings:true}).success).toBe(false);
  });
});
