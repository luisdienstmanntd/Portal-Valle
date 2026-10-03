import { expect,it } from "vitest";
import { bookingCommandSchema, operationError, requiredPuffs } from "./commands";
import { hotelDateTime,hotelDateTimeToInstant } from "../../../lib/hotel-time";
it.each([[1,1],[2,1],[3,2],[4,2],[8,4]])("%s adultos ocupam %s puffs",(adults,units)=>expect(requiredPuffs(adults)).toBe(units));
it.each([0,-1,1.5,9,NaN])("não calcula puffs para quantidade inválida %s",adults=>expect(()=>requiredPuffs(adults)).toThrow());
it("recusa crianças e unidades fornecidas pelo cliente",()=>{
  const command={action:"save",id:"10000000-0000-4000-8000-000000000001",version:0,occurrence_id:"20000000-0000-4000-8000-000000000001",adults:2,children:0,apartment_number:"TEST",guest_name:"Pessoa fictícia",notes:"",status:"reserved",attendance_status:"pending"};
  expect(bookingCommandSchema.safeParse(command).success).toBe(true);
  expect(bookingCommandSchema.safeParse({...command,children:1}).success).toBe(false);
  expect(bookingCommandSchema.safeParse({...command,units:0}).success).toBe(false);
});
it("converte horário do hotel sem depender do fuso do navegador/servidor",()=>{
  expect(hotelDateTimeToInstant("2026-10-08T19:30")).toBe("2026-10-08T22:30:00.000Z");
  expect(hotelDateTime("2026-10-08T22:30:00Z")).toBe("2026-10-08T19:30");
  expect(()=>hotelDateTimeToInstant("2026-02-30T19:30")).toThrow();
});
it("usa mensagens conhecidas e nunca devolve erro SQL recebido",()=>{
  expect(operationError("E_CAPACITY")).toContain("vagas");
  expect(operationError("private raw SQL token")).not.toContain("private raw");
});
