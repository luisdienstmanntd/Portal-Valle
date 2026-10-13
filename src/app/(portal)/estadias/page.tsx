import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Badge, Button, Card, Input, Label } from "@/components/ui/primitives";
import { authConfigured, guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { hotelToday } from "@/lib/hotel-date";
import { hotelDateTime } from "@/lib/hotel-time";
import { stayScopeSchema } from "@/modules/stays/domain/stay";
import { readStay } from "@/modules/stays/application/read-stay";
import { readPortalStay } from "@/modules/stays/infrastructure/reader";

const bookingLabels = { reserved: "Reservada", confirmed: "Confirmada", cancelled: "Cancelada", no_show: "Não compareceu" };
const sessionLabels = { draft: "Rascunho", published: "Publicada", cancelled: "Cancelada", completed: "Concluída" };
export default async function StaysPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await guardPreparationPage("experiences.read");
  const params = await searchParams, today = hotelToday(new Date());
  const hasInput = [params.apto, params.inicio, params.fim].some(v => v !== undefined);
  const parsed = stayScopeSchema.safeParse({ apartment: params.apto, arrival: params.inicio, departure: params.fim });
  const view = parsed.success ? await readStay(parsed.data, authConfigured() ? readPortalStay : null) : null;
  return <><PageHeading title="Visão Estadia" description="Inscrições por apartamento e período, sem depender do PMS." />
    <Card className="operation-panel"><h2>Consultar apartamento</h2>
      <p>O período é informado pela recepção. Confira o hóspede na inscrição: um apartamento pode receber pessoas diferentes no mesmo período.</p>
      <form action="/estadias" className="stay-selector" aria-label="Consultar estadia">
        <div><Label htmlFor="stay-apartment">Apartamento</Label><Input id="stay-apartment" name="apto" maxLength={30} defaultValue={typeof params.apto === "string" ? params.apto : ""} required /></div>
        <div><Label htmlFor="stay-start">Início do período</Label><Input id="stay-start" name="inicio" type="date" min="1900-01-01" max="2099-12-31" defaultValue={parsed.success ? parsed.data.arrival : today} required /></div>
        <div><Label htmlFor="stay-end">Fim do período · inclusive</Label><Input id="stay-end" name="fim" type="date" min="1900-01-01" max="2099-12-31" defaultValue={parsed.success ? parsed.data.departure : today} required /></div>
        <Button type="submit">Consultar inscrições</Button>
      </form><p className="operation-help">Até 31 dias. A consulta não cria uma estadia nem associa hóspedes automaticamente.</p>
      {hasInput && !parsed.success && <p role="alert">Informe um apartamento válido e um período de até 31 dias, com fim igual ou posterior ao início.</p>}
    </Card>
    {view && <Card className="operation-panel" aria-label="Inscrições do apartamento"><h2>APTO {view.scope.apartment}</h2><p>{view.scope.arrival.split("-").reverse().join("/")} a {view.scope.departure.split("-").reverse().join("/")}</p>
      {view.status === "unknown" && <p role="status">Conexão pendente. As inscrições do Portal ainda não foram consultadas.</p>}
      {view.status === "unavailable" && <p role="status">Consulta indisponível. Tente consultar novamente; não é possível confirmar as inscrições deste período.</p>}
      {view.status === "empty" && <p>Nenhuma inscrição encontrada nas sessões ativas de Cine Toscana e La Vera Pizza para este apartamento e período.</p>}
      {view.entries.length > 0 && <ul className="stay-entries">{view.entries.map(entry => <li key={entry.id}><p><time dateTime={entry.start}>{hotelDateTime(entry.start).replace("T", " · ")}</time></p><h3><Link href={`/experiencias/${entry.slug}/${entry.sessionId}`}>{entry.title}</Link></h3><p>Inscrição: {bookingLabels[entry.bookingStatus]} · Sessão: {sessionLabels[entry.sessionStatus]}</p></li>)}</ul>}
    </Card>}
    <Card className="operation-panel"><Badge tone="warning">Visão parcial</Badge><h2>Outras experiências</h2><p>Piscina, Academia e Osteria: vínculo com a estadia pendente. Consulte os sistemas de origem. Lora del Vino permanece em preparação.</p><p>Esta visão inclui somente inscrições do Portal em Cine Toscana e La Vera Pizza com catálogo ativo. Cancelamentos e sessões em rascunho são identificados.</p></Card>
  </>;
}
