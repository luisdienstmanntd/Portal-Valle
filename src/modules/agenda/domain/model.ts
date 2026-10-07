import { z } from "zod";
export const agendaEntrySchema=z.object({
 id:z.string().min(1).max(160).regex(/^[a-zA-Z0-9_-]+$/),type:z.literal("experience_session"),
 title:z.string().trim().min(1).max(160),experience:z.string().trim().min(1).max(160),
 start:z.iso.datetime({offset:true}),end:z.iso.datetime({offset:true}),location:z.string().trim().min(1).max(160),
 status:z.enum(["draft","published","cancelled","completed"]),
 href:z.string().max(300).regex(/^\/experiencias\/(cine-toscana|la-vera-pizza|programacao-hotel)\/[a-f0-9-]{36}$/),
}).strict().refine(v=>Date.parse(v.end)>Date.parse(v.start));
export type AgendaEntry=z.infer<typeof agendaEntrySchema> & {source:string};
export type AgendaProvider={id:string;label:string;configured:boolean;getEntries(range:{date:string;from:string;until:string},signal:AbortSignal):Promise<unknown>};
export type AgendaSource={id:string;label:string;status:"unknown"|"unavailable"|"empty"|"available";fetchedAt:string|null;errorCode:"TIMEOUT"|"UNAVAILABLE"|"INVALID_PAYLOAD"|null};
export type DailyAgenda={date:string;entries:AgendaEntry[];sources:AgendaSource[];fetchedAt:string};
