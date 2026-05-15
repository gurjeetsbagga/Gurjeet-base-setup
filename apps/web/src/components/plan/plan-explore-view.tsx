import { ExploreContextPanel } from "@/components/plan/explore-context-panel";
import { PlanExploreChat } from "@/components/plan/plan-explore-chat";
import type { PlanExplorePageData } from "@/lib/plan/types";

export function PlanExploreView({ data }: { data: PlanExplorePageData }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 pb-8 lg:grid-cols-[minmax(0,1fr)_min(18rem,22rem)] xl:gap-8"
      data-testid="plan-explore-view"
    >
      <PlanExploreChat initialMessages={data.messages} />
      <ExploreContextPanel context={data.context} className="lg:sticky lg:top-0 lg:self-start" />
    </div>
  );
}
