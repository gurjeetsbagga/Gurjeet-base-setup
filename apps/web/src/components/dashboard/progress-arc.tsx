import { cn } from "@/lib/utils";
import { metricStatusStyles } from "@/lib/dashboard/metric-status";
import type { MetricStatus } from "@/lib/dashboard/types";

export function ProgressArc({
  progress,
  status,
  className,
}: {
  progress: number;
  status: MetricStatus;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  const styles = metricStatusStyles[status];
  const radius = 28;
  const circumference = Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg viewBox="0 0 72 44" className={cn("h-11 w-[4.5rem] shrink-0", className)} aria-hidden>
      <path
        d={`M 8 40 A ${radius} ${radius} 0 0 1 64 40`}
        fill="none"
        className={styles.track}
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d={`M 8 40 A ${radius} ${radius} 0 0 1 64 40`}
        fill="none"
        className={styles.ring}
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
