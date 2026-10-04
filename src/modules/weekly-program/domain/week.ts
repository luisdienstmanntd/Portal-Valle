import { z } from "zod";
import { hotelDateTime, hotelDateTimeToInstant } from "../../../lib/hotel-time";
export const localDateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{
  const instant=Date.parse(v+"T12:00:00Z");
  return Number.isFinite(instant)&&new Date(instant).toISOString().slice(0,10)===v;
});
export function addDays(value:string,days:number) {
  localDateSchema.parse(value);
  const date=new Date(value+"T12:00:00Z"); date.setUTCDate(date.getUTCDate()+days);
  return localDateSchema.parse(date.toISOString().slice(0,10));
}
export function monday(value:string) {
  localDateSchema.parse(value);
  return addDays(value,-((new Date(value+"T12:00:00Z").getUTCDay()+6)%7));
}
export function weekRange(value:string) {
  const start=monday(value),end=addDays(start,7);
  return {start,end,days:Array.from({length:7},(_,i)=>addDays(start,i)),
    from:hotelDateTimeToInstant(start+"T00:00"),until:hotelDateTimeToInstant(end+"T00:00")};
}
export function hotelToday(now:Date) {return hotelDateTime(now.toISOString()).slice(0,10);}
const mondaySchema=localDateSchema.refine(v=>monday(v)===v);
export const duplicateWeekSchema=z.object({source_week:mondaySchema,target_week:mondaySchema}).strict()
  .refine(v=>v.source_week!==v.target_week,{message:"Escolha uma semana diferente."});
