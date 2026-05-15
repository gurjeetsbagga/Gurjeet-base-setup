import { PlanExploreView } from "@/components/plan/plan-explore-view";
import { mockPlanExploreData } from "@/lib/plan/mock-data";

export const metadata = {
  title: "Explore & Personalize | Hey Auryn",
  description: "Guided exploration for your recovery and wellness plan.",
};

export default function PlanPage() {
  return <PlanExploreView data={mockPlanExploreData} />;
}
