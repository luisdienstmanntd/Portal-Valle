import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeading } from "@/components/shell/page-heading";
import { Card, buttonClass } from "@/components/ui/primitives";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { loadStay } from "@/modules/stays/infrastructure/queries";
export const dynamic = "force-dynamic";
export default async function StayPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await guardPreparationPage("stays.read");
  if (!staff) return <><PageHeading title="Estadia" description="Cadastro próprio do Portal."/><Card className="operation-panel"><p>Consulta indisponível: o banco próprio do Portal ainda não está conectado.</p><Link href="/estadias" className={buttonClass("secondary")}>Voltar às estadias</Link></Card></>;
  const stay = await loadStay((await params).id);
  if (!stay) notFound();
  return <>
    <PageHeading title={`Apartamento ${stay.apartment}`} description="Estadia cadastrada no Portal."/>
    <Card className="operation-panel"><h2>Período da estadia</h2>
      <p>Entrada: {stay.arrivalDate.split("-").reverse().join("/")} · Saída: {stay.departureDate.split("-").reverse().join("/")}</p>
      <p>Identificador do cadastro: <code>{stay.id}</code></p>
      <p role="status">Vínculo das reservas em implementação. O cadastro não associa atividades automaticamente.</p>
      <Link href="/estadias" className={buttonClass("secondary")}>Voltar às estadias</Link>
    </Card>
  </>;
}
