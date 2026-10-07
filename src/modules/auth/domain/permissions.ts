export const roles = ["recepcao", "gerencia", "admin"] as const;
export type Role = typeof roles[number];
export type Staff = { id: string; role: Role; active: boolean };
export const permissions = ["portal.read", "experiences.read", "experiences.manage", "bookings.manage", "weekly_program.manage", "facilities.read", "osteria.read", "reports.read", "settings.manage"] as const;
export type Permission = typeof permissions[number];
const grants: Record<Role, readonly Permission[]> = {
  recepcao: ["portal.read", "experiences.read", "experiences.manage", "weekly_program.manage", "bookings.manage", "facilities.read", "osteria.read"],
  gerencia: ["portal.read", "experiences.read", "experiences.manage", "bookings.manage", "weekly_program.manage", "facilities.read", "osteria.read", "reports.read"],
  admin: permissions,
};
export function can(staff: Staff | null, permission: Permission): boolean {
  return Boolean(staff?.active && grants[staff.role]?.includes(permission));
}
export const roleLabels: Record<Role, string> = { recepcao: "Recepção", gerencia: "Gerência", admin: "Administração" };
