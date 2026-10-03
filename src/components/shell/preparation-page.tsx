import Link from "next/link";
import { PageHeading } from "./page-heading";
import { EmptyState } from "@/components/ui/states";
import { buttonClass } from "@/components/ui/primitives";
import type { IconName } from "@/components/ui/icon";

export function PreparationPage({ title, description, emptyTitle, emptyDescription, icon }: { title: string; description: string; emptyTitle: string; emptyDescription: string; icon: IconName }) {
  return <><PageHeading title={title} description={description} /><EmptyState title={emptyTitle} description={emptyDescription} icon={icon} action={<Link className={buttonClass("secondary")} href="/hoje">Voltar para Hoje</Link>} /></>;
}
