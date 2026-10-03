import type { ReactNode } from "react";
import { PortalShell } from "@/components/shell/portal-shell";
import { authConfigured, requirePermission } from "@/modules/auth/infrastructure/session";

export default async function PortalLayout({ children }: { children: ReactNode }) {
  const staff = authConfigured() ? await requirePermission("portal.read") : null;
  return <PortalShell staff={staff}>{children}</PortalShell>;
}
