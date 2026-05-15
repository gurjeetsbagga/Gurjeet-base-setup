import { metricStatusStyles } from "@/lib/dashboard/metric-status";
import type { MetricStatus } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function ProgressRing({
  progress,
  status = "good",
  size = 88,
  strokeWidth = 8,
  label,
  className,
}: {
  progress: number;
  status?: MetricStatus;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}) {
  const clamped = Math.min(100, Math.max(0, progress));
  const styles = metricStatusStyles[status];
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const center = size / 2;

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      role="img"
      aria-label={label ?? `${clamped}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={styles.track}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={styles.ring}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute text-lg font-semibold text-foreground">{clamped}%</span>
    </div>
  );
}
