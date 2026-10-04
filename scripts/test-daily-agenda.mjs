import { randomUUID } from "node:crypto";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
export async function seedDailyAgenda(manager,reception) {
 const instant=new Date(),date=new Intl.DateTimeFormat("sv-SE",{timeZone:"America/Sao_Paulo",year:"numeric",month:"2-digit",day:"2-digit"}).format(instant);
 const base={action:"save",version:0,location:"Local fictício da agenda",starts_at:instant.toISOString(),ends_at:new Date(instant.getTime()+90*60*1000).toISOString(),status:"published"};
 const cinema=randomUUID(),pizza=randomUUID();
 const call=(client,name,command)=>client.rpc(name,{p_request:randomUUID(),p_command:command});
 assert.equal((await call(manager,"portal_save_occurrence",{...base,id:cinema,experience_id:"c1000000-0000-4000-8000-000000000001",film_title:"Agenda fictícia Cine",capacity:4,person_limit:8})).error,null);
 assert.equal((await call(manager,"portal_pizza_save_occurrence",{...base,id:pizza,experience_id:"c8000000-0000-4000-8000-000000000001",title:"Agenda fictícia Pizza",capacity:12,person_limit:12})).error,null);
 assert.equal((await call(reception,"portal_pizza_save_booking",{action:"save",id:randomUUID(),version:0,occurrence_id:pizza,adults:2,children:0,apartment_number:"TEST-AGENDA",guest_name:"Pessoa privada fictícia da agenda",notes:"CHD 2 anos",status:"reserved",attendance_status:"pending"})).error,null);
 writeFileSync("work/daily-agenda-fixtures.json",JSON.stringify({date,cinema,pizza}));
 console.log("Daily agenda synthetic sessions checkpoint PASS.");
}
