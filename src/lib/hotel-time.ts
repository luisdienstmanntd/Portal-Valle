export const hotelTimeZone = "America/Sao_Paulo";
const formatter = new Intl.DateTimeFormat("sv-SE", { timeZone: hotelTimeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
export function hotelDateTime(instant: string) { return formatter.format(new Date(instant)).replace(" ", "T"); }
export function hotelDateTimeToInstant(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) throw new Error("Data inválida.");
  const wall = Date.parse(value + ":00Z");
  if (!Number.isFinite(wall) || new Date(wall).toISOString().slice(0,16) !== value) throw new Error("Data inválida.");
  let candidate = wall;
  for (let i=0;i<3;i++) {
    const rendered = Date.parse(hotelDateTime(new Date(candidate).toISOString()) + ":00Z");
    candidate += wall - rendered;
  }
  const result = new Date(candidate).toISOString();
  if (hotelDateTime(result) !== value) throw new Error("Horário não existe no fuso do hotel.");
  return result;
}
