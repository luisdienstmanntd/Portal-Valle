import { expect,it } from "vitest";
import { bookingCommandSchema, pizzaBookingCommandSchema, pizzaOccurrenceCommandSchema, operationError, requiredPuffs } from "./commands";
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
it("Pizza inclui crianças e exige justificativa acima de20pessoas",()=>{
 const command={action:"save",id:"10000000-0000-4000-8000-000000000001",version:0,occurrence_id:"20000000-0000-4000-8000-000000000001",adults:12,children:0,apartment_number:"TEST",guest_name:"Pessoa fictícia",notes:"CHD 2 anos",status:"reserved",attendance_status:"pending"};
 expect(pizzaBookingCommandSchema.safeParse(command).success).toBe(true);
 expect(pizzaBookingCommandSchema.safeParse({...command,adults:21}).success).toBe(false);
 expect(pizzaBookingCommandSchema.safeParse({...command,children:1}).success).toBe(true);
 expect(bookingCommandSchema.safeParse({...command,adults:2}).success).toBe(true);
});
it("Pizza valida evento/horários sem aceitar filme ou financeiro",()=>{
 const command={action:"save",id:"10000000-0000-4000-8000-000000000001",version:0,experience_id:"20000000-0000-4000-8000-000000000001",starts_at:"2026-10-08T22:30:00Z",ends_at:"2026-10-09T00:30:00Z",title:"Evento fictício",location:"Local fictício",capacity:12,person_limit:12,status:"published"};
 expect(pizzaOccurrenceCommandSchema.safeParse(command).success).toBe(true);
 expect(pizzaOccurrenceCommandSchema.safeParse({...command,film_title:"Outro"}).success).toBe(false);
 expect(pizzaOccurrenceCommandSchema.safeParse({...command,price:100}).success).toBe(false);
 expect(pizzaOccurrenceCommandSchema.safeParse({...command,capacity:21}).success).toBe(false);
});
it("Pizza exige razão explícita acima de20pessoas contando crianças",()=>{
 const base={action:"save",id:"10000000-0000-4000-8000-000000000001",version:0,occurrence_id:"20000000-0000-4000-8000-000000000001",adults:18,children:2,apartment_number:"TEST",guest_name:"Pessoa fictícia",notes:"",status:"reserved",attendance_status:"pending"};
 expect(pizzaBookingCommandSchema.safeParse(base).success).toBe(true);
 expect(pizzaBookingCommandSchema.safeParse({...base,children:3}).success).toBe(false);
 expect(pizzaBookingCommandSchema.safeParse({...base,children:3,exception_reason:"curta"}).success).toBe(false);
 expect(pizzaBookingCommandSchema.safeParse({...base,children:3,exception_reason:"Exceção fictícia autorizada"}).success).toBe(true);
 expect(pizzaBookingCommandSchema.safeParse({...base,children:-1}).success).toBe(false);
});
