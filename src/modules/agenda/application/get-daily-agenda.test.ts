import { afterEach,expect,it,vi } from "vitest";
import { GetDailyAgenda } from "./get-daily-agenda";
import type { AgendaProvider } from "../domain/model";
const now=()=>new Date("2026-10-03T12:00:00Z");
const entry=(id:string,start="2026-10-03T22:00:00Z")=>({id,type:"experience_session",title:"Evento fictício",experience:"La Vera Pizza",start,end:"2026-10-04T01:00:00Z",location:"Local fictício",status:"published",href:"/experiencias/la-vera-pizza/c8000000-0000-4000-8000-000000000001"});
const provider=(id:string,getEntries:AgendaProvider["getEntries"],configured=true):AgendaProvider=>({id,label:id,configured,getEntries});
afterEach(()=>vi.useRealTimers());
it("programação livre convive com Cine e Pizza sem invalidar a fonte",async()=>{
 const entries=[entry("pizza"),{...entry("cine"),experience:"Cine Toscana",href:"/experiencias/cine-toscana/c1000000-0000-4000-8000-000000000001"},{...entry("workshop"),experience:"Atividades do hotel",href:"/experiencias/programacao-hotel/c7000000-0000-4000-8000-000000000001"}];
 const loaded=await GetDailyAgenda({date:"2026-10-03",now,providers:[provider("portal",async()=>entries)]});
 expect(loaded.sources[0].status).toBe("available");expect(loaded.entries).toHaveLength(3);
});
it("executa fontes independentes, ordena e compõe IDs sem colisão",async()=>{
 const loaded=await GetDailyAgenda({date:"2026-10-03",now,providers:[provider("b",async()=>[entry("1"),entry("2","2026-10-03T21:00:00Z")]),provider("a",async()=>[entry("1")])]});
 expect(loaded.entries.map(v=>v.id)).toEqual(["b:2","a:1","b:1"]);
 expect(loaded.sources.map(v=>v.status)).toEqual(["available","available"]);
 expect(loaded.fetchedAt).toBe(now().toISOString());
});
it("vazio, desconhecido e indisponível não são confundidos e falha não derruba outra fonte",async()=>{
 const unknown=vi.fn();const loaded=await GetDailyAgenda({date:"2026-10-03",now,providers:[provider("empty",async()=>[]),provider("unknown",unknown,false),provider("bad",async()=>{throw new Error("SQL and private payload must not escape");}),provider("good",async()=>[entry("1")])]});
 expect(unknown).not.toHaveBeenCalled();expect(loaded.sources.map(v=>v.status)).toEqual(["empty","unknown","unavailable","available"]);
 expect(loaded.entries).toHaveLength(1);expect(JSON.stringify(loaded)).not.toContain("SQL");expect(loaded.sources[1].fetchedAt).toBeNull();
});
it("timeout termina e aborta mesmo quando provider não coopera",async()=>{
 vi.useFakeTimers();let signal:AbortSignal|undefined;
 const promise=GetDailyAgenda({date:"2026-10-03",now,timeoutMs:10,providers:[provider("slow",async(_,s)=>{signal=s;return new Promise(()=>{});}),provider("fast",async()=>[entry("1")])]});
 await vi.advanceTimersByTimeAsync(11);const loaded=await promise;
 expect(signal?.aborted).toBe(true);expect(loaded.sources[0]).toMatchObject({status:"unavailable",errorCode:"TIMEOUT"});expect(loaded.entries).toHaveLength(1);expect(vi.getTimerCount()).toBe(0);
});
it("timeout cooperativo mantém código estável e limpa timer no sucesso",async()=>{
 vi.useFakeTimers();const promise=GetDailyAgenda({date:"2026-10-03",now,timeoutMs:10,providers:[provider("slow",(_,signal)=>new Promise((_,reject)=>signal.addEventListener("abort",()=>reject(new Error("abort")),{once:true})))]});
 await vi.advanceTimersByTimeAsync(11);expect((await promise).sources[0].errorCode).toBe("TIMEOUT");expect(vi.getTimerCount()).toBe(0);
 await GetDailyAgenda({date:"2026-10-03",now,providers:[provider("fast",async()=>[])]});expect(vi.getTimerCount()).toBe(0);
});
it("payload inválido, duplicado ou fora do intervalo torna a fonte indisponível",async()=>{
 for(const rows of [[{...entry("1"),href:"https://unsafe.example"}],[entry("1"),entry("1")],[entry("1","2026-10-03T02:59:59Z")],[entry("1","2026-10-04T03:00:00Z")],[{...entry("1"),guest_name:"private"}]]) {
  const loaded=await GetDailyAgenda({date:"2026-10-03",now,providers:[provider("portal",async()=>rows)]});expect(loaded.sources[0].errorCode).toBe("INVALID_PAYLOAD");expect(loaded.entries).toEqual([]);
 }
});
it("limite inicial incluído e fim de evento noturno preservado",async()=>{
 const loaded=await GetDailyAgenda({date:"2026-10-03",now,providers:[provider("portal",async range=>{expect(range).toMatchObject({from:"2026-10-03T03:00:00.000Z",until:"2026-10-04T03:00:00.000Z"});return [entry("1","2026-10-03T03:00:00Z")];})]});expect(loaded.entries).toHaveLength(1);
});
