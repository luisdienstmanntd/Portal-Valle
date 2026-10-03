import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authConfigured, getStaff } from "@/modules/auth/infrastructure/session";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const available = authConfigured();
  if (available && await getStaff()) redirect("/hoje");
  return <main className="login-page"><section className="login-card" aria-labelledby="login-title">
    <Image src="/brand/logo-valle-dincanto.jpg" alt="Valle D'Incanto" width={1024} height={364} className="login-brand" priority />
    <p className="eyebrow">PORTAL DE EXPERIÊNCIAS</p><h1 id="login-title">Bem-vindo ao Valle.</h1>
    <p>Entre com sua conta da equipe para acompanhar o dia do hotel.</p>
    {!available && <p className="login-notice">O acesso da equipe está sendo preparado. Por enquanto, você pode conhecer as áreas do Portal.</p>}
    <LoginForm available={available} />
    {!available && <Link href="/hoje" className="login-back">Conhecer o Portal</Link>}
    <p className="login-help">Seu acesso é individual. Se precisar de ajuda, fale com a administração do hotel.</p>
  </section><footer>Valle D&apos;Incanto · Gramado, Rio Grande do Sul</footer></main>;
}
