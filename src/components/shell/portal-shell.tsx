import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileNavigation, SidebarNavigation } from "./navigation";
import { Badge, Button, buttonClass } from "@/components/ui/primitives";
import { can, roleLabels, type Staff } from "@/modules/auth/domain/permissions";
import { logout } from "@/app/login/actions";

export function PortalShell({ children, staff }: { children: ReactNode; staff: Staff | null }) {
  return <div className="portal-shell">
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    <aside className="sidebar" aria-label="Menu do Portal">
      <Link href="/hoje" className="brand-link" aria-label="Portal Valle — início"><Image src="/brand/logo-valle-dincanto.jpg" alt="Valle D'Incanto" width={1024} height={364} priority /></Link>
      <p className="brand-subtitle">RECEPÇÃO DO HOTEL</p>
      <SidebarNavigation showSettings={!staff || can(staff, "settings.manage")} />
      <footer className="sidebar-footer"><strong>Valle D&apos;Incanto</strong><span>Gramado, Rio Grande do Sul</span></footer>
    </aside>
    <div className="workspace">
      <header className="portal-header"><div className="header-start"><MobileNavigation showSettings={!staff || can(staff, "settings.manage")} /><span className="header-name">Portal Valle <span>/</span> <strong>{staff ? roleLabels[staff.role] : "Recepção"}</strong></span></div><div className="header-account"><Badge>{staff ? roleLabels[staff.role] : "Em preparação"}</Badge>{staff ? <form action={logout}><Button type="submit" variant="secondary">Sair</Button></form> : <Link href="/login" className={buttonClass("secondary")}>Entrar</Link>}</div></header>
      <main id="main-content" tabIndex={-1} className="main-content">{children}</main>
      <footer className="workspace-footer">Valle D&apos;Incanto · Portal da Recepção</footer>
    </div>
  </div>;
}
