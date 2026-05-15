import { Card } from "@/components/ui/card";
import { ProgressArc } from "@/components/dashboard/progress-arc";
import { metricStatusStyles } from "@/lib/dashboard/metric-status";
import type { HealthMetric } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function MetricCard({ metric, className }: { metric: HealthMetric; className?: string }) {
  const styles = metricStatusStyles[metric.status];

  return (
    <Card className={cn("flex items-center justify-between gap-3 p-5 shadow-soft", className)}>
      <div className="min-w-0 flex-1">
        <p className="text-caption font-medium uppercase tracking-wide text-muted-foreground">
          {metric.label}
        </p>
        <p className="mt-1 text-h2 font-semibold text-foreground">{metric.value}</p>
        <p className={cn("mt-1 text-sm font-medium", styles.label)}>{metric.statusLabel}</p>
      </div>
      <ProgressArc progress={metric.progress} status={metric.status} />
    </Card>
  );
}
