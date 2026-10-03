"use client";
import { useActionState } from "react";
import { Button, Input, Label } from "@/components/ui/primitives";
import { login } from "./actions";

export function LoginForm({ available }: { available: boolean }) {
  const [state, action, pending] = useActionState(login, { error: null });
  return <form action={action} className="login-form">
    <div><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="username" required maxLength={254} disabled={!available || pending} /></div>
    <div><Label htmlFor="password">Senha</Label><Input id="password" name="password" type="password" autoComplete="current-password" required maxLength={256} disabled={!available || pending} /></div>
    {state.error && <p role="alert" aria-label="Erro ao entrar" className="login-error">{state.error}</p>}
    <Button type="submit" disabled={!available || pending}>{pending ? "Entrando…" : "Entrar"}</Button>
  </form>;
}
