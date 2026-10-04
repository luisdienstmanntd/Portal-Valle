import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, Input, Label, Button, buttonClass } from "@/components/ui/primitives";
import { localDateSchema, hotelToday, addDays } from "@/lib/hotel-date";
import { readOsteriaDay } from "@/modules/osteria/application/read-day";
import { osteriaReader } from "@/modules/osteria/infrastructure/reader";
import { OsteriaDayPanel } from "@/modules/osteria/ui/day-panel";
export const dynamic = "force-dynamic";
export default async function OsteriaPage({ searchParams }: { searchParams: Promise<{ dia?: string | string[] }> }) {
  await guardPreparationPage("osteria.read");
  const params = await searchParams, parsed = localDateSchema.safeParse(params.dia), date = parsed.success ? parsed.data : hotelToday(new Date());
  const day = await readOsteriaDay({ date, reader: osteriaReader(), now: () => new Date() });
  const previous = addDays(date, -1), next = addDays(date, 1);
  return <><PageHeading title="Osteria" description="À mesa na Osteria Di Lucca." />
    <Card className="operation-panel"><div className="week-toolbar">
      {localDateSchema.safeParse(previous).success && <Link className={buttonClass("secondary")} href={`/osteria?dia=${previous}`}>← Dia anterior</Link>}
      {localDateSchema.safeParse(next).success && <Link className={buttonClass("secondary")} href={`/osteria?dia=${next}`}>Próximo dia →</Link>}
    </div><form className="week-selector" action="/osteria"><Label htmlFor="osteria-date">Escolher dia</Label><Input id="osteria-date" type="date" name="dia" min="1900-01-01" max="2099-12-31" defaultValue={date} required /><Button type="submit" variant="secondary">Ver dia</Button></form>
      {params.dia && !parsed.success && <p role="status">Data inválida. Exibindo o dia atual do hotel.</p>}</Card>
    <OsteriaDayPanel day={day} />
  </>;
}
