import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNavigation, SidebarNavigation } from "./navigation";
import { Badge } from "@/components/ui/primitives";

export function PortalShell({ children }: { children: ReactNode }) {
  return <div className="portal-shell">
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    <aside className="sidebar" aria-label="Menu do Portal">
      <Link href="/hoje" className="brand-link" aria-label="Portal Valle — início"><Image src="/brand/logo-valle-dincanto.jpg" alt="Valle D'Incanto" width={1024} height={364} priority /></Link>
      <p className="brand-subtitle">PORTAL DE EXPERIÊNCIAS</p>
      <SidebarNavigation />
      <footer className="sidebar-footer"><strong>Valle D&apos;Incanto</strong><span>Gramado, Rio Grande do Sul</span></footer>
    </aside>
    <div className="workspace">
      <header className="portal-header"><div className="header-start"><MobileNavigation /><span className="header-name">Portal Valle <span>/</span> <strong>Recepção</strong></span></div><Badge>Em preparação</Badge></header>
      <main id="main-content" tabIndex={-1} className="main-content">{children}</main>
      <footer className="workspace-footer">Valle D&apos;Incanto · Portal de Experiências</footer>
    </div>
  </div>;
}
