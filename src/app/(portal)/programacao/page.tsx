import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PreparationPage } from "@/components/shell/preparation-page";
export default async function ProgramPage() {
  await guardPreparationPage("portal.read");
  return <PreparationPage title="Programação" description="Uma visão da semana e das experiências no Valle." emptyTitle="A programação está sendo preparada" emptyDescription="Os encontros e horários da semana terão seu lugar aqui. Nenhuma programação está disponível no Portal neste momento." icon="week" />;
}
