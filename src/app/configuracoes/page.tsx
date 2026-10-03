import { PageHeading } from "@/components/shell/page-heading";
import { EmptyState } from "@/components/ui/states";
import { Dialog } from "@/components/ui/dialog";

export default function SettingsPage() {
  return <><PageHeading title="Configurações" description="Preferências e organização do Portal." action={<Dialog triggerLabel="Ajuda de navegação" title="Como navegar pelo Portal" description="Use o menu para alternar entre as áreas do hotel. No celular, toque no botão de menu no alto da página."><p>Você também pode navegar com a tecla Tab. Em janelas abertas, pressione Esc para fechar e voltar ao botão de origem.</p></Dialog>} /><EmptyState title="As configurações estão sendo preparadas" description="As preferências do Portal estarão disponíveis aqui. Ainda não há configurações para alterar." icon="settings" /></>;
}
