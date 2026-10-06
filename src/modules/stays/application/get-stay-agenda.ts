import { parseStayActivities, staySchema, staySources, type Stay, type StayActivity, type StaySource } from "../domain/model";

// Future reader must return only activities explicitly linked to this Portal stay ID.
// Matching an apartment/name/date is not sufficient to implement this contract.
export type StayActivityReader = { readStayActivities(stayId: string, signal: AbortSignal): Promise<unknown> };
export type StayAgenda = {
  stay: Stay; entries: StayActivity[];
  sources: { source: StaySource; status: "unknown" | "unavailable" | "empty" | "available"; linkedActivities: number | null; fetchedAt: string | null; errorCode: "TIMEOUT" | "UNAVAILABLE" | "INVALID_PAYLOAD" | null }[];
};
class StayReadFailure extends Error { constructor(readonly code: "TIMEOUT" | "INVALID_PAYLOAD") { super(code); } }
export async function GetStayAgenda({ stay, readers, now, timeoutMs = 5000 }: {
  stay: Stay; readers: Record<StaySource, StayActivityReader | null>; now: () => Date; timeoutMs?: number;
}): Promise<StayAgenda> {
  const scope = staySchema.parse(stay);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 15000) throw new Error("Consulta inválida.");
  const settled = await Promise.allSettled(staySources.map(async source => {
    const reader = readers[source];
    if (!reader) return null;
    const controller = new AbortController(); let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { reject(new StayReadFailure("TIMEOUT")); controller.abort(); }, timeoutMs); });
      const raw = await Promise.race([Promise.resolve().then(() => reader.readStayActivities(scope.id, controller.signal)), deadline]);
      try { return parseStayActivities(raw, scope, source); } catch { throw new StayReadFailure("INVALID_PAYLOAD"); }
    } finally { if (timer !== undefined) clearTimeout(timer); }
  }));
  const sources: StayAgenda["sources"] = settled.map((result, index) => {
    const source = staySources[index];
    if (result.status === "rejected") return { source, status: "unavailable", linkedActivities: null, fetchedAt: now().toISOString(), errorCode: result.reason instanceof StayReadFailure ? result.reason.code : "UNAVAILABLE" };
    if (result.value === null) return { source, status: "unknown", linkedActivities: null, fetchedAt: null, errorCode: null };
    return { source, status: result.value.length ? "available" : "empty", linkedActivities: result.value.length, fetchedAt: now().toISOString(), errorCode: null };
  });
  const entries = settled.flatMap(result => result.status === "fulfilled" ? result.value ?? [] : [])
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start) || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  return { stay: scope, sources, entries };
}
