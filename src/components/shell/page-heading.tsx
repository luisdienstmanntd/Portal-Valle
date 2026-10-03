import type { ReactNode } from "react";

export function PageHeading({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="page-heading"><div><p className="eyebrow">PORTAL VALLE</p><h1>{title}</h1><p className="page-description">{description}</p></div>{action}</div>;
}
