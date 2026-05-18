import { PlanExploreLayout } from "@/components/plan/plan-explore-layout";
import type { PlanExplorePageData } from "@/lib/plan/types";

export function PlanExploreView({ data }: { data: PlanExplorePageData }) {
  return <PlanExploreLayout data={data} />;
}
