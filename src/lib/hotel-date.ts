import { z } from "zod";
import { hotelDateTime } from "./hotel-time";
const calendarDateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(v=>{
  const instant=Date.parse(v+"T12:00:00Z");
  return Number.isFinite(instant)&&new Date(instant).toISOString().slice(0,10)===v;
});
export const localDateSchema=calendarDateSchema.refine(v=>v>="1900-01-01"&&v<="2099-12-31");
export function addDays(value:string,days:number) {
  calendarDateSchema.parse(value);
  const date=new Date(value+"T12:00:00Z");date.setUTCDate(date.getUTCDate()+days);
  return calendarDateSchema.parse(date.toISOString().slice(0,10));
}
export function hotelToday(now:Date) {return hotelDateTime(now.toISOString()).slice(0,10);}
/** Earliest instant of a civil date, including a historical midnight skipped by DST. */
function dateBoundary(value:string) {
  calendarDateSchema.parse(value);
  const noon=Date.parse(value+"T12:00:00Z");
  let low=noon-36*60*60*1000,high=noon+36*60*60*1000;
  while(low<high) {
    const middle=Math.floor((low+high)/2);
    if(hotelToday(new Date(middle))<value) low=middle+1; else high=middle;
  }
  return new Date(low).toISOString();
}
export function hotelDayRange(value:string) {
  const date=localDateSchema.parse(value);
  return {date,from:dateBoundary(date),until:dateBoundary(addDays(date,1))};
}
