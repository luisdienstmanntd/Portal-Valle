import { guardPreparationPage } from "@/modules/auth/infrastructure/session";
import { PreparationPage } from "@/components/shell/preparation-page";
export default async function ExperiencesPage() {
  await guardPreparationPage("experiences.read");
  return <PreparationPage title="Experiências" description="Momentos que tornam a estadia especial." emptyTitle="As experiências estão sendo preparadas" emptyDescription="Este espaço será dedicado aos encontros do hotel e às inscrições dos hóspedes. As inscrições ainda não estão disponíveis no Portal." icon="sparkles" />;
}
