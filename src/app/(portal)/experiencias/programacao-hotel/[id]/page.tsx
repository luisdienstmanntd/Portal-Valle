import { ExperienceSession } from "@/modules/experiences/ui/experience-session";
export const dynamic = "force-dynamic";
export default function HotelActivityPage({ params }: { params: Promise<{id:string}> }) { return <ExperienceSession flow="program" params={params}/>; }
