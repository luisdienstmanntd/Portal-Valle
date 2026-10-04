import {randomUUID} from "node:crypto";
import assert from "node:assert/strict";
export async function testWeek(manager,reception) {
 const call=(client,name,command,key=randomUUID())=>client.rpc(name,{p_request:key,p_command:command});
 const occurrence={action:"save",id:randomUUID(),version:0,experience_id:"c8000000-0000-4000-8000-000000000001",title:"Semana fictícia HTTP",location:"Local fictício",starts_at:"2026-12-31T23:00:00Z",ends_at:"2027-01-01T01:00:00Z",capacity:12,person_limit:12,status:"published"};
 assert.equal((await call(manager,"portal_pizza_save_occurrence",occurrence)).error,null);
 const booking={action:"save",id:randomUUID(),version:0,occurrence_id:occurrence.id,adults:2,children:0,apartment_number:"TEST",guest_name:"Pessoa fictícia semanal",notes:"CHD 2 anos",status:"confirmed",attendance_status:"present"};
 assert.equal((await call(reception,"portal_pizza_save_booking",booking)).error,null);
 const command={source_week:"2026-12-28",target_week:"2027-01-04"},key=randomUUID();
 assert.equal((await call(reception,"portal_duplicate_week",command)).error?.message,"E_FORBIDDEN");
 const clone=await call(manager,"portal_duplicate_week",command,key); assert.equal(clone.error,null);assert.equal(clone.data.length,1);
 assert.deepEqual((await call(manager,"portal_duplicate_week",command,key)).data,clone.data);
 assert.equal((await call(manager,"portal_duplicate_week",{...command,target_week:"2027-01-11"},key)).error?.message,"E_IDEMPOTENCY");
 const copied=await reception.from("experience_occurrences").select("*").eq("id",clone.data[0]).single();assert.equal(copied.error,null);
 assert.equal(copied.data.status,"draft");assert.equal(copied.data.version,1);assert.equal(copied.data.starts_at,"2027-01-07T23:00:00+00:00");
 const bookings=await reception.from("experience_bookings").select("id").eq("occurrence_id",clone.data[0]);assert.equal(bookings.error,null);assert.equal(bookings.data.length,0);
 const race=await Promise.all([call(manager,"portal_duplicate_week",{...command,target_week:"2027-01-11"}),call(manager,"portal_duplicate_week",{...command,target_week:"2027-01-11"})]);
 assert.equal(race.filter(r=>!r.error).length,1);assert.equal(race.filter(r=>r.error?.message==="E_WEEK_OCCUPIED").length,1);
 const concurrent=await Promise.all([call(manager,"portal_duplicate_week",{...command,target_week:"2027-01-18"}),call(manager,"portal_pizza_save_occurrence",{...occurrence,id:randomUUID(),starts_at:"2027-01-19T23:00:00Z",ends_at:"2027-01-20T01:00:00Z"})]);
 assert.equal(concurrent[1].error,null); assert(!concurrent[0].error||concurrent[0].error.message==="E_WEEK_OCCUPIED");
 const rows=await reception.from("experience_occurrences").select("id").gte("starts_at","2027-01-18T03:00:00Z").lt("starts_at","2027-01-25T03:00:00Z");
 assert.equal(rows.error,null);assert.equal(rows.data.length,concurrent[0].error?1:2);
 assert.equal((await call(manager,"portal_duplicate_week",{source_week:"2028-01-03",target_week:"2028-01-10"})).error?.message,"E_EMPTY_WEEK");
 console.log("Weekly HTTP duplication/empty destination/concurrency/manual writer/idempotency/no bookings/roles PASS.");
}
