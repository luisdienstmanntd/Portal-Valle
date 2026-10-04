import { z } from "zod";
import { hotelDateTimeToInstant } from "../../../lib/hotel-time";
import { addDays,localDateSchema } from "../../../lib/hotel-date";
export { addDays,localDateSchema,hotelToday } from "../../../lib/hotel-date";
export function monday(value:string) {
  localDateSchema.parse(value);
  return addDays(value,-((new Date(value+"T12:00:00Z").getUTCDay()+6)%7));
}
export function weekRange(value:string) {
  localDateSchema.parse(value);
  const start=monday(value),end=addDays(start,7);
  return {start,end,days:Array.from({length:7},(_,i)=>addDays(start,i)),
    from:hotelDateTimeToInstant(start+"T00:00"),until:hotelDateTimeToInstant(end+"T00:00")};
}
const mondaySchema=localDateSchema.refine(v=>monday(v)===v);
export const duplicateWeekSchema=z.object({source_week:mondaySchema,target_week:mondaySchema}).strict()
  .refine(v=>v.source_week!==v.target_week,{message:"Escolha uma semana diferente."});
