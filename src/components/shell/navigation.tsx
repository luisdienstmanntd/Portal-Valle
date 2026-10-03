"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef } from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { Button } from "@/components/ui/primitives";
import { keepDialogFocus } from "@/components/ui/dialog-focus";

const items: { href: string; label: string; icon: IconName; group: string }[] = [
  { href: "/hoje", label: "Hoje", icon: "sun", group: "Dia a dia" },
  { href: "/agenda", label: "Agenda", icon: "calendar", group: "Dia a dia" },
  { href: "/programacao", label: "Programação", icon: "week", group: "Dia a dia" },
  { href: "/experiencias", label: "Experiências", icon: "sparkles", group: "No hotel" },
  { href: "/piscina", label: "Piscina", icon: "pool", group: "No hotel" },
  { href: "/academia", label: "Academia", icon: "gym", group: "No hotel" },
  { href: "/osteria", label: "Osteria", icon: "dining", group: "No hotel" },
  { href: "/configuracoes", label: "Configurações", icon: "settings", group: "Portal" },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav aria-label="Navegação principal">
    {["Dia a dia", "No hotel", "Portal"].map(group => <div className="nav-group" key={group}>
      <p className="nav-label">{group}</p>
      <ul>{items.filter(item => item.group === group).map(item => <li key={item.href}><Link href={item.href} className="nav-link" aria-current={pathname === item.href ? "page" : undefined} onClick={onNavigate}><Icon name={item.icon} /><span>{item.label}</span></Link></li>)}</ul>
    </div>)}
  </nav>;
}

export function SidebarNavigation() { return <Navigation />; }

export function MobileNavigation() {
  const dialog = useRef<HTMLDialogElement>(null);
  return <div className="mobile-navigation">
    <Button variant="secondary" aria-label="Abrir menu de navegação" aria-haspopup="dialog" onClick={() => dialog.current?.showModal()}><Icon name="menu" /></Button>
    <dialog ref={dialog} className="navigation-dialog" aria-labelledby="navigation-title" onKeyDown={keepDialogFocus}>
      <div className="mobile-menu-header"><h2 id="navigation-title">Portal Valle</h2><Button variant="secondary" aria-label="Fechar menu de navegação" autoFocus onClick={() => dialog.current?.close()}><Icon name="close" /></Button></div>
      <Navigation onNavigate={() => dialog.current?.close()} />
    </dialog>
  </div>;
}
