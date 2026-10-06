import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, buttonClass } from "@/components/ui/primitives";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { linkBookingToStay } from "../actions";
import { loadStay, loadStayBookings } from "@/modules/stays/infrastructure/queries";
export const dynamic = "force-dynamic";
export default async function StayPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string | string[] }> }) {
  const staff = await guardPreparationPage("stays.read");
  if (!staff) return <><PageHeading title="Estadia" description="Cadastro próprio do Portal."/><Card className="operation-panel"><p>Consulta indisponível: o banco próprio do Portal ainda não está conectado.</p><Link href="/estadias" className={buttonClass("secondary")}>Voltar às estadias</Link></Card></>;
  const stay = await loadStay((await params).id);
  if (!stay) notFound();
  const bookings = await loadStayBookings(stay);
  const erro = (await searchParams).erro;
  const when = (iso: string) => new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "short" }).format(new Date(iso));
  const bind = linkBookingToStay.bind(null, stay.id);
  return <>
    <PageHeading title={`Apartamento ${stay.apartment}`} description="Estadia cadastrada no Portal."/>
    <Card className="operation-panel"><h2>Período da estadia</h2>
      <p>Entrada: {stay.arrivalDate.split("-").reverse().join("/")} · Saída: {stay.departureDate.split("-").reverse().join("/")}</p>
      <p>Identificador do cadastro: <code>{stay.id}</code></p>
      {typeof erro === "string" && <p role="alert" className="login-error">{erro.slice(0, 200)}</p>}
      <h2>Reservas</h2>
      <p role="status">Nada é associado automaticamente: confirme cada reserva do mesmo apartamento.</p>
      {bookings.length === 0 ? <p>Nenhuma reserva vinculada ou candidata.</p> : <ul>{bookings.map(b => <li key={b.id}>
        {b.experience} · {when(b.startsAt)} · {b.status} · {b.linked ? "vinculada" : "candidata"}
        <form action={bind}><input type="hidden" name="request" value={crypto.randomUUID()}/><input type="hidden" name="bookingId" value={b.id}/>
          <input type="hidden" name="version" value={b.version}/><input type="hidden" name="stayId" value={b.linked ? "" : stay.id}/>
          <button type="submit" className={buttonClass("secondary")}>{b.linked ? "Desvincular" : "Vincular"}</button></form>
      </li>)}</ul>}
      <Link href="/estadias" className={buttonClass("secondary")}>Voltar às estadias</Link>
    </Card>
  </>;
}
