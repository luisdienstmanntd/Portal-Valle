import { Button } from "@/components/ui/primitives";

export default function UnavailablePage() {
  return <main className="login-page"><section className="login-card" aria-labelledby="unavailable-title">
    <p className="eyebrow">PORTAL VALLE</p><h1 id="unavailable-title">Acesso temporariamente indisponível</h1>
    <p>Não foi possível verificar o acesso da equipe agora. Nenhum dado operacional será exibido até a conexão ser restabelecida.</p>
    <form action="/hoje"><Button type="submit" variant="secondary">Tentar novamente</Button></form>
    <p>Enquanto isso, continue utilizando os sistemas responsáveis pelas reservas.</p>
    <p><a href="https://valle-piscina-academia.vercel.app" target="_blank" rel="noopener noreferrer">Abrir Piscina e Academia ↗</a></p>
    <p><a href="https://osteriadilucca.web.app/" target="_blank" rel="noopener noreferrer">Abrir Gestão da Osteria ↗</a></p>
  </section></main>;
}
