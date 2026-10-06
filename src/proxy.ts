import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { readPortalSupabaseConfig } from "@/lib/supabase/config";
import { AccessUnavailable, withAccessDeadline } from "@/modules/auth/application/deadline";

function privateResponse(response: NextResponse) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function proxy(request: NextRequest) {
  // This public recovery page never reads Auth or operational data, even with invalid ENV.
  if (request.nextUrl.pathname === "/indisponivel") return privateResponse(NextResponse.next());
  let config;
  try { config = readPortalSupabaseConfig(process.env); }
  catch { return privateResponse(NextResponse.redirect(new URL("/indisponivel", request.url), 303)); }
  if (!config) return NextResponse.next();
  let response = NextResponse.next({ request });
  try { await withAccessDeadline(async signal => {
  const client = createServerClient(config.url, config.publishableKey, {
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store",
      signal: init?.signal ? AbortSignal.any([signal, init.signal]) : signal }) },
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
  const { error } = await client.auth.getClaims();
  if (error && (!error.status || error.status >= 500)) throw new AccessUnavailable();
  }); } catch {
    const unavailable = NextResponse.redirect(new URL("/indisponivel", request.url), 303);
    // Preserve any cookies already refreshed by setAll, including deletion cookies.
    response.cookies.getAll().forEach(cookie => unavailable.cookies.set(cookie));
    return privateResponse(unavailable);
  }
  // Applies to every configured page/action response, not only token refresh responses.
  return privateResponse(response);
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|fonts/).*)"],
};
