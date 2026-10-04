import "server-only";
import { authConfigured } from "@/modules/auth/infrastructure/session";
import { loadWeek } from "@/modules/experiences/infrastructure/queries";
import type { AgendaProvider } from "../domain/model";
export function ExperienceAgendaProvider():AgendaProvider {
 return {id:"portal",label:"Experiências Portal",configured:authConfigured(),async getEntries(range,signal) {
  const data=await loadWeek(range.from,range.until,signal);
  return data.occurrences.map(o=>{
   const experience=data.experiences.find(e=>e.id===o.experience_id)!;
   return {id:o.id,type:"experience_session",title:o.metadata.film_title??o.title_override??experience.name,experience:experience.name,
    start:o.starts_at,end:o.ends_at,location:o.location,status:o.status,href:`/experiencias/${experience.slug}/${o.id}`};
  });
 }};
}
