import "server-only";
import type { FacilitiesReader } from "../application/read-day";

export function facilitiesReader(): FacilitiesReader | null {
  // Audit found no restricted read access. No environment flag or broad key may enable this.
  // Replace only after the external read contract and permissions have been independently verified.
  return null;
}
