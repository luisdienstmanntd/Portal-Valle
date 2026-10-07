import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PageHeading } from "@/components/shell/page-heading";
import { ExternalWorkspace } from "@/components/shell/external-workspace";
import { externalSystems } from "@/lib/external-systems";
export const dynamic = "force-dynamic";
export default async function OsteriaPage() {
  await guardPreparationPage("osteria.read");
  return <><PageHeading title="Osteria" description="Acompanhe o restaurante e faça reservas no sistema atual."/>
    <ExternalWorkspace name="Osteria" url={externalSystems().osteria}/></>;
}
