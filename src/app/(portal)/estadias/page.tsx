import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { randomUUID } from "node:crypto";
import { Badge, Card, buttonClass } from "@/components/ui/primitives";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { can } from "@/modules/auth/domain/permissions";
import { loadStays } from "@/modules/stays/infrastructure/queries";
import { StayForm } from "@/modules/stays/ui/stay-form";
import type { Stay } from "@/modules/stays/domain/model";
export const dynamic = "force-dynamic";

export default async function StaysPage({ searchParams }: { searchParams: Promise<{ after?: string | string[] }> }) {
  const staff = await guardPreparationPage("stays.read");
  const after = (await searchParams).after;
  let stays: Stay[] | null = null;
  let nextCursor: string | null = null;
  let unavailable = false;
  if (staff) { try { const page = await loadStays(typeof after === "string" ? after : undefined); stays = page.stays; nextCursor = page.nextCursor; } catch { unavailable = true; } }
  return <>
    <PageHeading title="Estadias" description="As atividades vinculadas a uma estadia, reunidas em um só lugar."/>
    <Card className="operation-panel" data-testid="stay-preparation">
      <Badge tone={staff && !unavailable ? "success" : "warning"}>{staff && !unavailable ? "Cadastro próprio" : "Conexão pendente"}</Badge>
      <h2>Cadastro próprio da estadia</h2>
      <p>Apartamento, entrada e saída identificam o cadastro. Cada reserva será vinculada explicitamente a essa estadia.</p>
      {!staff && <p className="operation-notice" role="status">O banco próprio do Portal ainda não está conectado. Cadastro indisponível nesta prévia.</p>}
      {unavailable && <p className="operation-notice" role="alert">Não foi possível consultar as estadias. Atualize a página para tentar novamente.</p>}
      <StayForm available={can(staff,"stays.manage") && !unavailable} id={randomUUID()} request={randomUUID()}/>
    </Card>
    {stays !== null && <Card className="operation-panel"><h2>Estadias cadastradas</h2>
      <p>Até 50 estadias por página, ordenadas pela entrada mais recente.</p>
      {stays.length === 0 ? <p>{after ? "Nenhuma estadia nesta página." : "Nenhuma estadia cadastrada no Portal."}</p> : <ul>{stays.map(stay => <li key={stay.id}>
        <Link href={`/estadias/${stay.id}`}>Apartamento {stay.apartment} · {stay.arrivalDate.split("-").reverse().join("/")} a {stay.departureDate.split("-").reverse().join("/")}</Link>
      </li>)}</ul>}
      {nextCursor && <Link className={buttonClass("secondary")} href={`/estadias?after=${encodeURIComponent(nextCursor)}`}>Próximas estadias</Link>}
      {after && <Link className={buttonClass("secondary")} href="/estadias">Primeira página</Link>}
    </Card>}
    <div className="section-heading"><h2>Atividades da estadia</h2><span>Vínculos explícitos</span></div>
    <Card className="operation-panel"><h3>Aguardando cadastro e vínculo</h3>
      <p>A visão reunirá reservas de experiências, Piscina, Academia e Osteria quando os vínculos e as consultas estiverem disponíveis.</p>
      <p>O mesmo apartamento pode receber hóspedes diferentes. Coincidências de apartamento, nome ou data não vinculam reservas.</p>
      <p>Uma fonte desconectada não confirma ausência de atividades. Reservas sem vínculo ficam fora desta visão.</p>
      <Link className={buttonClass("secondary")} href="/experiencias">Abrir experiências</Link>
    </Card>
  </>;
}
