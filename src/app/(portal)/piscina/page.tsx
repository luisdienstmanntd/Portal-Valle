import { FacilityPage } from "@/modules/facilities/ui/facility-page";
export const dynamic = "force-dynamic";
export default async function PoolPage({ searchParams }: { searchParams: Promise<{ dia?: string | string[] }> }) {
  return <FacilityPage facility="pool" searchParams={searchParams} />;
}
