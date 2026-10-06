"use server";
import { redirect, unstable_rethrow } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createPortalServerClient } from "@/lib/supabase/server";
import { authConfigured, getStaff } from "@/modules/auth/infrastructure/session";
import { loginSchema, type LoginState } from "@/modules/auth/domain/login";
import { withAccessDeadline } from "@/modules/auth/application/deadline";

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!authConfigured()) return { error: "O acesso da equipe ainda não está disponível." };
  const input = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!input.success) return { error: "Informe um e-mail válido e sua senha." };
  let accepted;
  try {
    accepted = await withAccessDeadline(async signal => {
      const client = await createPortalServerClient(true, signal);
      const { error } = await client.auth.signInWithPassword(input.data);
      if (error) {
        if (!error.status || error.status >= 500) throw error;
        return false;
      }
      const staff = await getStaff(signal);
      if (!staff?.active) { await client.auth.signOut({ scope: "local" }); return false; }
      return true;
    });
  } catch (error) { unstable_rethrow(error); return { error: "O acesso da equipe está temporariamente indisponível. Tente novamente." }; }
  if (!accepted) return { error: "Não foi possível entrar. Confira seus dados e tente novamente." };
  revalidatePath("/", "layout");
  redirect("/hoje");
}

export async function logout() {
  if (authConfigured()) {
    await withAccessDeadline(async signal => {
      const client = await createPortalServerClient(true, signal);
      const { error } = await client.auth.signOut({ scope: "local" });
      if (error) throw error;
    });
  }
  revalidatePath("/", "layout");
  redirect("/login");
}
