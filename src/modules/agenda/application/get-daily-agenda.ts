import { z } from "zod";
import { hotelDayRange } from "../../../lib/hotel-date";
import { agendaEntrySchema,type AgendaProvider,type AgendaSource,type DailyAgenda } from "../domain/model";
class AgendaFailure extends Error {constructor(readonly code:"TIMEOUT"|"INVALID_PAYLOAD") {super(code);}}
export async function GetDailyAgenda({date,providers,now,timeoutMs=5000}:{date:string;providers:AgendaProvider[];now:()=>Date;timeoutMs?:number}):Promise<DailyAgenda> {
 const range=hotelDayRange(date);
 if(!Number.isInteger(timeoutMs)||timeoutMs<1||timeoutMs>15000||providers.length>10) throw new Error("Configuração inválida da agenda.");
 const ids=providers.map(p=>z.string().regex(/^[a-z0-9-]{1,40}$/).parse(p.id));
 if(new Set(ids).size!==ids.length) throw new Error("Fonte repetida na agenda.");
 const settled=await Promise.allSettled(providers.map(async provider=>{
  if(!provider.configured) return null;
  const controller=new AbortController();let timer:ReturnType<typeof setTimeout>|undefined;
  try {
   const deadline=new Promise<never>((_,reject)=>{timer=setTimeout(()=>{reject(new AgendaFailure("TIMEOUT"));controller.abort();},timeoutMs);});
   const raw=await Promise.race([Promise.resolve().then(()=>provider.getEntries(range,controller.signal)),deadline]);
   const parsed=z.array(agendaEntrySchema).max(100).safeParse(raw);
   if(!parsed.success||parsed.data.some(e=>Date.parse(e.start)<Date.parse(range.from)||Date.parse(e.start)>=Date.parse(range.until))||new Set(parsed.data.map(e=>e.id)).size!==parsed.data.length) throw new AgendaFailure("INVALID_PAYLOAD");
   return parsed.data.map(e=>({...e,source:provider.id,id:`${provider.id}:${e.id}`}));
  } finally {if(timer!==undefined) clearTimeout(timer);}
 }));
 const fetchedAt=now().toISOString();
 const sources:AgendaSource[]=settled.map((result,i)=>{
  const provider=providers[i],base={id:provider.id,label:provider.label,fetchedAt:provider.configured?fetchedAt:null};
  if(result.status==="rejected") return {...base,status:"unavailable",errorCode:result.reason instanceof AgendaFailure?result.reason.code:"UNAVAILABLE"};
  return {...base,status:result.value===null?"unknown":result.value.length?"available":"empty",errorCode:null};
 });
 const entries=settled.flatMap(result=>result.status==="fulfilled"?result.value??[]:[])
  .sort((a,b)=>Date.parse(a.start)-Date.parse(b.start)||(a.id<b.id?-1:a.id>b.id?1:0));
 return {date:range.date,entries,sources,fetchedAt};
}
