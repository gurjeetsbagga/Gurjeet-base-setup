import { MetricCard } from "@/components/dashboard/metric-card";
import { HealingTimeline } from "@/components/recovery/healing-timeline";
import { NutritionOverviewCard } from "@/components/recovery/nutrition-overview-card";
import { PlanEssentialsSection } from "@/components/recovery/plan-essentials-section";
import { RecoveryFocusBadge } from "@/components/recovery/recovery-focus-badge";
import { RecoveryPlanCtaCard } from "@/components/recovery/recovery-plan-cta-card";
import { RecoverySummaryCard } from "@/components/recovery/recovery-summary-card";
import type { PhysicianOsRecoveryData } from "@/lib/recovery/types";

export function PhysicianOsRecoveryView({ data }: { data: PhysicianOsRecoveryData }) {
  return (
    <div className="flex flex-col gap-6 pb-28 lg:gap-8">
      <div className="flex justify-end">
        <RecoveryFocusBadge focus={data.focus} />
      </div>

      <section
        className="grid grid-cols-1 gap-4 lg:grid-cols-3 lg:gap-5"
        aria-label="Recovery protocol and nutrition"
      >
        <div className="flex flex-col gap-4 lg:col-span-2 lg:gap-5">
          <RecoverySummaryCard protocol={data.protocol} />
          <HealingTimeline timeline={data.timeline} />
        </div>
        <NutritionOverviewCard nutrition={data.nutrition} className="lg:row-span-1" />
      </section>

      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        aria-label="Recovery metrics"
      >
        {data.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
        <RecoveryPlanCtaCard cta={data.planCta} />
      </section>

      <PlanEssentialsSection essentials={data.essentials} />
    </div>
  );
}
