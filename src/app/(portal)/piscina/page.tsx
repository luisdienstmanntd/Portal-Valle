import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PreparationPage } from "@/components/shell/preparation-page";
export default async function PoolPage() {
  await guardPreparationPage("facilities.read");
  return <PreparationPage title="Piscina" description="Um momento de descanso no Valle." emptyTitle="A visão da piscina está sendo preparada" emptyDescription="As reservas da piscina ainda não estão disponíveis no Portal. Para consultar ou reservar horários, continue utilizando o sistema de Piscina e Academia." icon="pool" />;
}
