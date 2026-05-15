import { Card } from "@/components/ui/card";
import { NutritionProgressBar } from "@/components/recovery/nutrition-progress-bar";
import type { NutritionOverviewData } from "@/lib/recovery/types";
import { cn } from "@/lib/utils";

export function NutritionOverviewCard({
  nutrition,
  className,
}: {
  nutrition: NutritionOverviewData;
  className?: string;
}) {
  return (
    <Card
      className={cn("flex flex-col gap-6 p-6 shadow-soft sm:p-8", className)}
      data-testid="nutrition-overview-card"
    >
      <h2 className="text-base font-semibold text-foreground">{nutrition.title}</h2>
      <div className="flex flex-col gap-6">
        {nutrition.metrics.map((metric) => (
          <NutritionProgressBar key={metric.id} metric={metric} />
        ))}
      </div>
    </Card>
  );
}
