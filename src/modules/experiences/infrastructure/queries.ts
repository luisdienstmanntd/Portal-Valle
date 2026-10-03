import "server-only";
import { createPortalServerClient } from "@/lib/supabase/server";
import { toBooking, toExperience, toOccurrence } from "./mapping";
import {experienceFlows,type ExperienceFlow} from "../domain/flows";
export async function loadExperience(flow:ExperienceFlow) {
  const client=await createPortalServerClient();
  const {data,error}=await client.from("experiences").select("*").eq("slug",experienceFlows[flow].slug).eq("category",experienceFlows[flow].category).single();
  if(error||!data) throw new Error("Não foi possível carregar a experiência.");
  const experience=toExperience(data);
  const rows=await client.from("experience_occurrences").select("*").eq("experience_id",experience.id).order("starts_at").limit(100);
  if(rows.error) throw new Error("Não foi possível carregar as sessões.");
  return {experience,occurrences:(rows.data??[]).map(toOccurrence)};
}
export async function loadExperienceSession(flow:ExperienceFlow,id:string) {
  const client=await createPortalServerClient();
  const row=await client.from("experience_occurrences").select("*").eq("id",id).maybeSingle();
  if(row.error) throw new Error("Não foi possível carregar a sessão.");
  if(!row.data) return null;
  const catalog=await client.from("experiences").select("*").eq("id",row.data.experience_id).eq("slug",experienceFlows[flow].slug).eq("category",experienceFlows[flow].category).maybeSingle();
  if(catalog.error) throw new Error("Não foi possível carregar a experiência.");
  if(!catalog.data) return null;
  const bookings=await client.from("experience_bookings").select("*").eq("occurrence_id",id).order("created_at");
  if(bookings.error) throw new Error("Não foi possível carregar as inscrições.");
  return {experience:toExperience(catalog.data),occurrence:toOccurrence(row.data),bookings:(bookings.data??[]).map(toBooking)};
}
