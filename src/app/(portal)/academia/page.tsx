import { FacilityPage } from "@/modules/facilities/ui/facility-page";
export const dynamic = "force-dynamic";
export default async function GymPage({ searchParams }: { searchParams: Promise<{ dia?: string | string[] }> }) {
  return <FacilityPage facility="gym" searchParams={searchParams} />;
}
