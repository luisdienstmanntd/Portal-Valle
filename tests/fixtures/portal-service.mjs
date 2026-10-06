import { createServer } from "node:http";
import { createHmac } from "node:crypto";

// Synthetic loopback service only. Never imported by the Portal or connected to a database.
export const userId = "11111111-1111-4111-8111-111111111111";
export function syntheticSession(expired = false) {
  const exp = Math.floor(Date.now() / 1000) + (expired ? -60 : 3600);
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(JSON.stringify({ sub: userId, aud: "authenticated", role: "authenticated", exp, iat: exp - 3600 })).toString("base64url");
  const signature = createHmac("sha256", "synthetic-test-only").update(`${header}.${payload}`).digest("base64url");
  return { access_token: `${header}.${payload}.${signature}`, refresh_token: "synthetic-test-only", token_type: "bearer", expires_at: exp, expires_in: 3600,
    user: { id: userId, aud: "authenticated", role: "authenticated", email: "synthetic@portal.test" } };
}

export async function startPortalService(port) {
  let mode = "normal", counts = {};
  const modes = ["normal", "auth-offline", "auth-timeout", "profile-offline", "profile-timeout", "profile-schema", "portal-offline", "portal-timeout", "token-offline"];
  const server = createServer(async (request, response) => {
    const path = new URL(request.url, "http://127.0.0.1").pathname;
    const json = (status, data) => { response.writeHead(status, { "content-type": "application/json" }); response.end(JSON.stringify(data)); };
    if (path === "/__scenario") {
      if (request.method === "POST") {
        let body = ""; for await (const chunk of request) body += chunk;
        const input = JSON.parse(body);
        if (!modes.includes(input.mode)) return json(400, {});
        mode = input.mode; counts = {};
      }
      return json(200, { mode, counts });
    }
    counts[path] = (counts[path] || 0) + 1;
    if (path === "/auth/v1/user") {
      if (mode === "auth-timeout") return; // Remains pending until the application's deadline aborts.
      if (mode === "auth-offline") return json(503, { message: "PRIVATE-AUTH-MARKER" });
      return json(200, syntheticSession().user);
    }
    if (path === "/auth/v1/token") {
      if (mode === "auth-offline" || mode === "token-offline") return json(503, { message: "PRIVATE-TOKEN-MARKER" });
      return json(200, syntheticSession());
    }
    if (path === "/auth/v1/logout") return json(200, {});
    if (path === "/rest/v1/portal_profiles") {
      if (mode === "profile-timeout") return;
      if (mode === "profile-offline") return json(503, { message: "PRIVATE-SQL-MARKER", code: "synthetic" });
      return json(200, [{ id: userId, role: mode === "profile-schema" ? "unrecognized" : "recepcao", active: true }]);
    }
    if (path.startsWith("/rest/v1/")) {
      if (mode === "portal-timeout") return;
      if (mode === "portal-offline") return json(503, { message: "PRIVATE-DATA-MARKER", code: "synthetic" });
      if (path === "/rest/v1/experiences") {
        const experience = { id: "22222222-2222-4222-8222-222222222222", slug: "cine-toscana", name: "Cine Toscana", description: null,
          category: "cinema", booking_mode: "group", capacity_mode: "persons", default_capacity: 20, person_limit: null,
          persons_per_unit: null, active: true, guest_bookable: false, created_at: "2026-01-01T00:00:00Z", updated_at: "2026-01-01T00:00:00Z" };
        return json(200, request.headers.accept?.includes("vnd.pgrst.object") ? experience : []);
      }
      return json(200, []);
    }
    return json(404, { message: "Synthetic endpoint not implemented" });
  });
  await new Promise(resolve => server.listen(port, "127.0.0.1", resolve));
  return server;
}
