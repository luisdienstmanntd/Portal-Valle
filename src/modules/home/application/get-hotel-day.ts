import { GetDailyAgenda } from "../../agenda/application/get-daily-agenda";
import type { AgendaProvider } from "../../agenda/domain/model";
import { localDateSchema } from "../../../lib/hotel-date";
import { readFacilityDay, type FacilitiesReader } from "../../facilities/application/read-day";
import { readOsteriaDay, type OsteriaReader } from "../../osteria/application/read-day";

export type HomeSource = { id: string; label: string; href: string; status: "unknown" | "unavailable" | "empty" | "available"; summary: string | null; fetchedAt: string | null };
export type HomeEntry = { id: string; title: string; start: string; end: string | null; detail: string; state: string; cancelled: boolean; href: string };
export type HotelDay = { date: string; sources: HomeSource[]; entries: HomeEntry[] };
const portalStates = { draft: "Rascunho", published: "Aberta para inscrições", cancelled: "Cancelada", completed: "Concluída" };

export async function GetHotelDay({ date, portalProviders, facilities, osteria, now, timeoutMs = 5000 }: {
  date: string; portalProviders: AgendaProvider[]; facilities: FacilitiesReader | null; osteria: OsteriaReader | null; now: () => Date; timeoutMs?: number;
}): Promise<HotelDay> {
  localDateSchema.parse(date);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new Error("Consulta inválida.");
  const settled = await Promise.allSettled([
    GetDailyAgenda({ date, providers: portalProviders, now, timeoutMs }),
    readFacilityDay({ date, facility: "pool", reader: facilities, now, timeoutMs }),
    readFacilityDay({ date, facility: "gym", reader: facilities, now, timeoutMs }),
    readOsteriaDay({ date, reader: osteria, now, timeoutMs }),
  ] as const);
  const sources: HomeSource[] = [], entries: HomeEntry[] = [];
  const portal = settled[0];
  if (portal.status === "fulfilled") {
    const state = portal.value.sources.some(s => s.status === "unavailable") ? "unavailable" : portal.value.sources.some(s => s.status === "unknown") || !portal.value.sources.length ? "unknown" : portal.value.entries.length ? "available" : "empty";
    sources.push({ id: "portal", label: "Experiências Portal", href: "/experiencias", status: state, summary: state === "available" || state === "empty" ? `${portal.value.entries.length} sessões na agenda` : null, fetchedAt: portal.value.sources.find(s => s.fetchedAt)?.fetchedAt ?? null });
    entries.push(...portal.value.entries.map(e => ({ id: e.id, title: e.title, start: e.start, end: e.end, detail: `${e.experience} · ${e.location}`, state: portalStates[e.status], cancelled: e.status === "cancelled", href: e.href })));
  } else sources.push({ id: "portal", label: "Experiências Portal", href: "/experiencias", status: "unavailable", summary: null, fetchedAt: null });
  for (const [index, id, label, href] of [[1, "pool", "Piscina", "/piscina"], [2, "gym", "Academia", "/academia"]] as const) {
    const result = settled[index];
    if (result.status === "rejected") { sources.push({ id, label, href, status: "unavailable", summary: null, fetchedAt: null }); continue; }
    const day = result.value;
    sources.push({ id, label, href, status: day.status, summary: day.reservedSlots === null ? null : `${day.reservedSlots} horários reservados`, fetchedAt: day.fetchedAt });
    entries.push(...day.reservations.map(e => ({ id: `${id}:${e.id}`, title: `${label} · horário reservado`, start: e.start, end: e.end, detail: label, state: "Reserva existente", cancelled: false, href: `${href}?dia=${date}` })));
  }
  const restaurant = settled[3];
  if (restaurant.status === "fulfilled") {
    const day = restaurant.value;
    sources.push({ id: "osteria", label: "Osteria", href: "/osteria", status: day.status, summary: day.summary ? `${day.summary.reservations} reservas ativas · ${day.summary.people} pessoas (inclui room service)` : null, fetchedAt: day.fetchedAt });
    entries.push(...day.reservations.map(e => ({ id: e.id, title: e.customerType === "roomservice" ? "Osteria · room service" : "Osteria · reserva", start: e.start, end: null, detail: `${e.adults} adultos · ${e.children} crianças · Mesa ${e.table ?? "não informada"}`, state: e.status === "cancelled" ? "Cancelada" : "Reserva ativa", cancelled: e.status === "cancelled", href: `/osteria?dia=${date}` })));
  } else sources.push({ id: "osteria", label: "Osteria", href: "/osteria", status: "unavailable", summary: null, fetchedAt: null });
  entries.sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return { date, sources, entries };
}
