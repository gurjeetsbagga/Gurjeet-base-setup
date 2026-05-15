import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import type { ActiveFocusDetail } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function ActiveFocusPanel({
  focus,
  className,
}: {
  focus: ActiveFocusDetail;
  className?: string;
}) {
  return (
    <Card className={cn("flex h-full flex-col p-6 shadow-soft sm:p-8", className)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-caption font-semibold uppercase tracking-widest text-muted-foreground">
            {focus.title}
          </p>
          <h2 className="mt-2 text-h3 font-semibold text-foreground">{focus.journeyTitle}</h2>
        </div>
        <StatusBadge label={focus.statusLabel} />
      </div>
      <p className="mt-4 text-sm font-medium text-dashboard-brand">{focus.phaseLabel}</p>
      <p className="mt-6 flex-1 text-sm leading-relaxed text-muted-foreground">{focus.message}</p>
    </Card>
  );
}
