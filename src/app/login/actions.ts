"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPortalServerClient } from "@/lib/supabase/server";
import { authConfigured, getStaff } from "@/modules/auth/infrastructure/session";
import { loginSchema, type LoginState } from "@/modules/auth/domain/login";

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "O acesso da equipe ainda não está disponível." };
  const input = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!input.success) return { error: "Informe um e-mail válido e sua senha." };
  const client = await createPortalServerClient(true);
  const { error } = await client.auth.signInWithPassword(input.data);
  if (error) return { error: "Não foi possível entrar. Confira seus dados e tente novamente." };
  const staff = await getStaff();
  if (!staff?.active) {
    await client.auth.signOut({ scope: "local" });
    return { error: "Não foi possível entrar. Confira seus dados e tente novamente." };
  }
  revalidatePath("/", "layout");
  redirect("/hoje");
}

export async function logout() {
  if (authConfigured()) {
    const client = await createPortalServerClient(true);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error) throw new Error("Não foi possível encerrar sua sessão. Tente novamente.");
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
