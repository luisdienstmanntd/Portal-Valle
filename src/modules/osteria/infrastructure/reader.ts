import "server-only";
import type { OsteriaReader } from "../application/read-day";
export function osteriaReader(): OsteriaReader | null {
  // No verified SELECT-only interface. Do not reuse legacy Auth, service role or broad views.
  // No environment flag can enable this until access and the source contract are verified.
  return null;
}
