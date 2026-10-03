import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PreparationPage } from "@/components/shell/preparation-page";
export default async function OsteriaPage() {
  await guardPreparationPage("osteria.read");
  return <PreparationPage title="Osteria" description="À mesa na Osteria Di Lucca." emptyTitle="A visão da Osteria está sendo preparada" emptyDescription="As reservas do restaurante ainda não estão disponíveis no Portal. Continue utilizando o sistema da Osteria Di Lucca para a operação do restaurante." icon="dining" />;
}
