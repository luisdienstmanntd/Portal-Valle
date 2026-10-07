import { describe, expect, it } from "vitest";
import { can, permissions, roles } from "./permissions";
import { loginSchema } from "./login";
describe("RBAC central", () => {
  for (const role of roles) {
    for (const permission of permissions) {
      it(`${role}: ${permission}`, () => {
        const expected = role === "admin" || (permission !== "settings.manage" && (role === "gerencia" || !["reports.read"].includes(permission)));
        expect(can({ id: "synthetic", role, active: true }, permission)).toBe(expected);
        expect(can({ id: "synthetic", role, active: false }, permission)).toBe(false);
        expect(can(null, permission)).toBe(false);
      });
    }
  }
  it("valida credenciais sem transformar a senha", () => {
    expect(loginSchema.parse({ email: "Equipe@portal.test", password: " synthetic " })).toEqual({ email: "equipe@portal.test", password: " synthetic " });
    expect(loginSchema.safeParse({ email: "invalid", password: "" }).success).toBe(false);
  });
});
