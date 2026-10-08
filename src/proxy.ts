import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readPortalSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

export async function proxy(request: NextRequest) {
  const config = readPortalSupabaseConfig(process.env);
  if (!config) return NextResponse.next();
  let response = NextResponse.next({ request });
  const client = createServerClient<Database>(config.url, config.publishableKey, {
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(cacheHeaders).forEach(([name, value]) => response.headers.set(name, value));
      },
    },
  });
  const { data, error } = await client.auth.getClaims();
  if ((!data?.claims || error) && request.method === "GET"
      && !request.headers.has("next-router-prefetch") && request.headers.get("purpose") !== "prefetch"
      && !["/acesso-indisponivel", "/acesso-negado"].includes(request.nextUrl.pathname)) {
    const { data: publicAccess } = await client.rpc("portal_public_access_enabled");
    if (publicAccess === true) await client.auth.signInAnonymously();
  }
  // Applies to every configured page/action response, not only token refresh responses.
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|fonts/).*)"],
};
