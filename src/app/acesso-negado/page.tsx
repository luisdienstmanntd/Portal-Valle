import Link from "next/link";
import { Button } from "@/components/ui/primitives";
import { logout } from "../login/actions";
export default function AccessDeniedPage() {
  return <main className="login-page"><section className="login-card"><h1>Acesso restrito</h1>
    <p>Sua conta não tem permissão para acessar esta área.</p><Link href="/hoje">Voltar ao início</Link>
    <form action={logout}><Button type="submit" variant="secondary">Sair</Button></form>
  </section></main>;
}
