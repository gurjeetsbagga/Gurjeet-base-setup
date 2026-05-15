import { AppCenter } from "@/components/dashboard/app-center";
import { CtaCard } from "@/components/dashboard/cta-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { PhysicianOsCard } from "@/components/dashboard/physicianos-card";
import type { DashboardHealthViewData } from "@/lib/dashboard/types";

/** Metrics + modules layout — for future dedicated health route */
export function HealthMetricsDashboard({ data }: { data: DashboardHealthViewData }) {
  return (
    <div className="flex flex-col gap-5 pb-28 lg:gap-6">
      <PhysicianOsCard physician={data.physician} />
      <section
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Health metrics"
      >
        {data.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </section>
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2" aria-label="Wellness modules">
        <AppCenter items={data.appCenter} />
        <CtaCard cta={data.cta} />
      </section>
    </div>
  );
}
