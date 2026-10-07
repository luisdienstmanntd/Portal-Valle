"use client";
import { useState } from "react";
import { Button, Card, buttonClass } from "@/components/ui/primitives";

export function ExternalWorkspace({ name, url }: { name: string; url: string | null }) {
  const [opened, setOpened] = useState(false);
  return <Card className="operation-panel external-workspace">
    <div className="week-toolbar"><div><h2>{name}</h2><p>Consulte e faça reservas no sistema que a equipe já utiliza.</p></div>
      {url && <a className={buttonClass("secondary")} href={url} target="_blank" rel="noopener noreferrer">Abrir em nova aba ↗</a>}
    </div>
    {!url ? <p role="status">Aguardando o endereço atual do sistema de Piscina e Academia.</p> : <>
      <p className="operation-help">Use seu acesso habitual. Se a tela ou o login não abrir aqui, escolha “Abrir em nova aba”.</p>
      {!opened ? <Button type="button" onClick={() => setOpened(true)}>Abrir {name} no Portal</Button> : <>
        <Button type="button" variant="secondary" onClick={() => setOpened(false)}>Fechar sistema</Button>
        <iframe className="external-system-frame" src={url} title={`Sistema de ${name}`} referrerPolicy="no-referrer" />
      </>}
    </>}
  </Card>;
}
