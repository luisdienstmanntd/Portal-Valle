import type { ReactNode } from "react";
import { Icon, type IconName } from "./icon";

export function EmptyState({ title, description, icon = "calendar", action }: { title: string; description: string; icon?: IconName; action?: ReactNode }) {
  return <section className="empty-state"><span className="empty-icon"><Icon name={icon} width={30} height={30} /></span><h2>{title}</h2><p>{description}</p>{action && <div className="state-action">{action}</div>}</section>;
}

export function ErrorState({ title = "Não foi possível carregar esta informação", description, action }: { title?: string; description: string; action?: ReactNode }) {
  return <section className="error-state" role="alert"><Icon name="info" /><div><h2>{title}</h2><p>{description}</p>{action && <div className="state-action">{action}</div>}</div></section>;
}
