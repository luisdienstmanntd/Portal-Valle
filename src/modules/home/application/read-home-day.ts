import { GetDailyAgenda } from "../../agenda/application/get-daily-agenda";
import type { AgendaProvider, DailyAgenda } from "../../agenda/domain/model";
import { readFacilityDay, type FacilitiesReader, type FacilityDay } from "../../facilities/application/read-day";
import { readOsteriaDay, type OsteriaReader, type OsteriaDay } from "../../osteria/application/read-day";

export type HomeTimelineEntry = {
  id: string; start: string; end: string | null; title: string; detail: string;
  status: string; cancelled: boolean; href: string;
};
export type HomeDay = {
  date: string; agenda: DailyAgenda; pool: FacilityDay; gym: FacilityDay; osteria: OsteriaDay;
  entries: HomeTimelineEntry[]; nextEntry: HomeTimelineEntry | null;
};

/** Compose validated read models. Each source owns its deadline and sanitized failures. */
export async function readHomeDay({ date, experienceProvider, facilities, osteria, now, timeoutMs = 5000 }: {
  date: string; experienceProvider: AgendaProvider; facilities: FacilitiesReader | null;
  osteria: OsteriaReader | null; now: () => Date; timeoutMs?: number;
}): Promise<HomeDay> {
  const [agenda, pool, gym, restaurant] = await Promise.all([
    GetDailyAgenda({ date, providers: [experienceProvider], now, timeoutMs }),
    readFacilityDay({ date, facility: "pool", reader: facilities, now, timeoutMs }),
    readFacilityDay({ date, facility: "gym", reader: facilities, now, timeoutMs }),
    readOsteriaDay({ date, reader: osteria, now, timeoutMs }),
  ]);
  const labels = { draft: "Rascunho", published: "Aberta para inscrições", cancelled: "Cancelada", completed: "Concluída" };
  const entries: HomeTimelineEntry[] = [
    ...agenda.entries.map(row => ({ id: row.id, start: row.start, end: row.end, title: row.title,
      detail: `${row.experience} · ${row.location}`, status: labels[row.status], cancelled: row.status === "cancelled", href: row.href })),
    ...[pool, gym].flatMap(day => day.reservations.map(row => ({ id: `${day.facility}:${row.id}`, start: row.start, end: row.end,
      title: day.facility === "pool" ? "Piscina" : "Academia", detail: "Horário reservado", status: "Reservado", cancelled: false,
      href: `/${day.facility === "pool" ? "piscina" : "academia"}?dia=${date}` }))),
    ...restaurant.reservations.map(row => ({ id: row.id, start: row.start, end: null, title: "Osteria",
      detail: `${row.customerType === "roomservice" ? "Room service" : "Salão"} · ${row.people} pessoas${row.table ? ` · Mesa ${row.table}` : ""}`,
      status: row.status === "cancelled" ? "Cancelada" : "Agendada", cancelled: row.status === "cancelled", href: `/osteria?dia=${date}` })),
  ];
  entries.sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const reference = now().getTime();
  const nextEntry = entries.find(row => !row.cancelled && row.status !== "Concluída" && row.status !== "Rascunho" && Date.parse(row.start) >= reference) ?? null;
  return { date, agenda, pool, gym, osteria: restaurant, entries, nextEntry };
}
