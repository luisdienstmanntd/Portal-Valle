import Link from "next/link";
import { EmptyState } from "@/components/ui/states";
import { buttonClass } from "@/components/ui/primitives";
export default function NotFound() {
  return <EmptyState title="Página não encontrada" description="O endereço pode ter mudado. Volte para Hoje para continuar navegando pelo Portal." icon="info" action={<Link href="/hoje" className={buttonClass()}>Ir para Hoje</Link>} />;
}
