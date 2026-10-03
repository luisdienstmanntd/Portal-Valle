import {ExperienceSession} from "@/modules/experiences/ui/experience-session";
export default function Page({params}:{params:Promise<{id:string}>}){return <ExperienceSession flow="cinema" params={params} />;}
