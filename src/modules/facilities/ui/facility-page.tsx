import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PageHeading } from "@/components/shell/page-heading";
import { ExternalWorkspace } from "@/components/shell/external-workspace";
import { externalSystems } from "@/lib/external-systems";
import type { Facility } from "../domain/reservations";
export async function FacilityPage({ facility }: { facility: Facility; searchParams?: Promise<{dia?:string|string[]}> }) {
  await guardPreparationPage("facilities.read");
  return <><PageHeading title={facility==="pool"?"Piscina":"Academia"} description="Consulte e reserve no sistema atual, dentro do Portal."/>
    <ExternalWorkspace name="Piscina e Academia" url={externalSystems().facilities}/></>;
}
