"use client";
import { Button } from "@/components/ui/primitives";

export default function PortalError({ retry }: { retry: () => void }) {
  return <main className="login-page"><section className="login-card"><h1>Não foi possível carregar esta área</h1>
    <p>Tente novamente em alguns instantes. A falha não confirma ausência de atividades ou reservas.</p>
    <Button type="button" variant="secondary" onClick={() => retry()}>Tentar novamente</Button>
    <p><a href="/hoje">Voltar ao início</a></p>
  </section></main>;
}
