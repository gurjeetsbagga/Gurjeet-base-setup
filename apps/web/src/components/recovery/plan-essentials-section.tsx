import { Card } from "@/components/ui/card";
import { EssentialIcon } from "@/components/recovery/recovery-icons";
import type { PlanEssential } from "@/lib/recovery/types";
import { cn } from "@/lib/utils";

export function PlanEssentialsSection({
  essentials,
  title = "Your Plan Essentials",
  className,
}: {
  essentials: PlanEssential[];
  title?: string;
  className?: string;
}) {
  return (
    <Card className={cn("p-6 shadow-soft sm:p-8", className)} data-testid="plan-essentials-section">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <ul className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5" role="list">
        {essentials.map((item) => (
          <li key={item.id} className="flex flex-col items-center gap-3 text-center">
            <span className="flex size-14 items-center justify-center rounded-full border border-border-subtle bg-muted/50 text-dashboard-brand">
              <EssentialIcon name={item.icon} className="size-6" />
            </span>
            <span className="text-caption font-semibold uppercase tracking-widest text-muted-foreground">
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
