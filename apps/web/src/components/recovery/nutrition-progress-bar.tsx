import { nutritionBarToneStyles } from "@/lib/recovery/nutrition-tone";
import type { NutritionMetric } from "@/lib/recovery/types";
import { cn } from "@/lib/utils";

export function NutritionProgressBar({
  metric,
  className,
}: {
  metric: NutritionMetric;
  className?: string;
}) {
  const percent = Math.min(100, Math.round((metric.current / metric.target) * 100));
  const barStyle = nutritionBarToneStyles[metric.tone];
  const displayValue = metric.unit
    ? `${metric.current} / ${metric.target}${metric.unit}`
    : `${metric.current.toLocaleString()} / ${metric.target.toLocaleString()}`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{metric.label}</span>
        <span className="text-sm text-muted-foreground">{displayValue}</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={metric.current}
        aria-valuemin={0}
        aria-valuemax={metric.target}
        aria-label={`${metric.label} progress`}
      >
        <div
          className={cn("h-full rounded-full transition-all", barStyle.bar)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
