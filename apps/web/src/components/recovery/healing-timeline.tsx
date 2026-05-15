import { Card } from "@/components/ui/card";
import type { HealingTimelineData } from "@/lib/recovery/types";
import { cn } from "@/lib/utils";

function phaseDotClass(status: HealingTimelineData["phases"][number]["status"]): string {
  switch (status) {
    case "completed":
      return "bg-dashboard-brand ring-4 ring-dashboard-brand/20";
    case "current":
      return "bg-dashboard-brand ring-4 ring-dashboard-brand-muted";
    default:
      return "bg-border";
  }
}

export function HealingTimeline({
  timeline,
  className,
}: {
  timeline: HealingTimelineData;
  className?: string;
}) {
  const currentIndex = timeline.phases.findIndex((p) => p.status === "current");
  const progressIndex =
    currentIndex >= 0
      ? currentIndex
      : timeline.phases.filter((p) => p.status === "completed").length - 1;
  const progressPercent =
    timeline.phases.length > 1
      ? (Math.max(0, progressIndex) / (timeline.phases.length - 1)) * 100
      : 0;

  return (
    <Card className={cn("p-6 shadow-soft sm:p-8", className)} data-testid="healing-timeline">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-foreground">{timeline.title}</h2>
        <span className="text-sm text-muted-foreground">{timeline.estimatedDuration}</span>
      </div>

      <div className="relative mt-8">
        <div
          className="absolute left-0 right-0 top-[0.4375rem] h-1 rounded-full bg-border"
          aria-hidden
        />
        <div
          className="absolute left-0 top-[0.4375rem] h-1 rounded-full bg-dashboard-brand transition-all"
          style={{ width: `${progressPercent}%` }}
          aria-hidden
        />
        <ol className="relative flex justify-between" role="list">
          {timeline.phases.map((phase) => (
            <li key={phase.id} className="flex flex-col items-center gap-3">
              <span
                className={cn("size-3.5 rounded-full", phaseDotClass(phase.status))}
                aria-hidden
              />
              <span
                className={cn(
                  "text-caption font-medium",
                  phase.status === "upcoming" ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {phase.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  );
}
