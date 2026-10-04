import Link from "next/link";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, Input, Label, Button, buttonClass } from "@/components/ui/primitives";
import { localDateSchema, hotelToday, addDays } from "@/lib/hotel-date";
import { readFacilityDay } from "../application/read-day";
import { facilitiesReader } from "../infrastructure/reader";
import type { Facility } from "../domain/reservations";
import { FacilityDayPanel } from "./day-panel";

export async function FacilityPage({ facility, searchParams }: { facility: Facility; searchParams: Promise<{ dia?: string | string[] }> }) {
  await guardPreparationPage("facilities.read");
  const params = await searchParams, parsed = localDateSchema.safeParse(params.dia), date = parsed.success ? parsed.data : hotelToday(new Date());
  const day = await readFacilityDay({ date, facility, reader: facilitiesReader(), now: () => new Date() });
  const title = facility === "pool" ? "Piscina" : "Academia", path = facility === "pool" ? "/piscina" : "/academia";
  const previous = addDays(date, -1), next = addDays(date, 1);
  return <><PageHeading title={title} description="Os horários do dia, em uma visão para a recepção." />
    <Card className="operation-panel"><div className="week-toolbar">
      {localDateSchema.safeParse(previous).success && <Link className={buttonClass("secondary")} href={`${path}?dia=${previous}`}>← Dia anterior</Link>}
      {localDateSchema.safeParse(next).success && <Link className={buttonClass("secondary")} href={`${path}?dia=${next}`}>Próximo dia →</Link>}
    </div><form className="week-selector" action={path}><Label htmlFor="facility-date">Escolher dia</Label><Input id="facility-date" type="date" name="dia" min="1900-01-01" max="2099-12-31" defaultValue={date} required /><Button type="submit" variant="secondary">Ver dia</Button></form>
      {params.dia && !parsed.success && <p role="status">Data inválida. Exibindo o dia atual do hotel.</p>}</Card>
    <FacilityDayPanel day={day} />
  </>;
}
