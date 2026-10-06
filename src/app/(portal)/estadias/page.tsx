import Link from "next/link";
import { PageHeading } from "@/components/shell/page-heading";
import { Badge, Card, Button, Input, Label, buttonClass } from "@/components/ui/primitives";
import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
export const dynamic = "force-dynamic";

export default async function StaysPage() {
  await guardPreparationPage("experiences.read");
  return <>
    <PageHeading title="Estadias" description="As atividades vinculadas a uma estadia, reunidas em um só lugar."/>
    <Card className="operation-panel" data-testid="stay-preparation">
      <Badge tone="warning">Em preparação</Badge>
      <h2>Cadastro próprio da estadia</h2>
      <p>Apartamento, entrada e saída identificam o cadastro. Cada reserva será vinculada explicitamente a essa estadia.</p>
      <p className="operation-notice" role="status">Cadastro e vínculos ainda indisponíveis. Nenhuma reserva foi associada automaticamente.</p>
      <fieldset disabled className="stay-fields"><legend>Dados da estadia</legend>
        <div><Label htmlFor="stay-apartment">Apartamento</Label><Input id="stay-apartment" name="apartment" maxLength={30}/></div>
        <div><Label htmlFor="stay-arrival">Entrada</Label><Input id="stay-arrival" name="arrivalDate" type="date"/></div>
        <div><Label htmlFor="stay-departure">Saída</Label><Input id="stay-departure" name="departureDate" type="date"/></div>
        <Button disabled>Cadastrar estadia</Button>
      </fieldset>
    </Card>
    <div className="section-heading"><h2>Atividades da estadia</h2><span>Vínculos explícitos</span></div>
    <Card className="operation-panel"><h3>Aguardando cadastro e vínculo</h3>
      <p>A visão reunirá reservas de experiências, Piscina, Academia e Osteria quando os vínculos e as consultas estiverem disponíveis.</p>
      <p>O mesmo apartamento pode receber hóspedes diferentes. Coincidências de apartamento, nome ou data não vinculam reservas.</p>
      <p>Uma fonte desconectada não confirma ausência de atividades. Reservas sem vínculo ficam fora desta visão.</p>
      <Link className={buttonClass("secondary")} href="/experiencias">Abrir experiências</Link>
    </Card>
  </>;
}
