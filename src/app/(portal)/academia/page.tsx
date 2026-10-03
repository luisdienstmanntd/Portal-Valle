import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PreparationPage } from "@/components/shell/preparation-page";
export default async function GymPage() {
  await guardPreparationPage("facilities.read");
  return <PreparationPage title="Academia" description="Movimento e equilíbrio durante a estadia." emptyTitle="A visão da academia está sendo preparada" emptyDescription="As reservas da academia ainda não estão disponíveis no Portal. Para consultar ou reservar horários, continue utilizando o sistema de Piscina e Academia." icon="gym" />;
}
