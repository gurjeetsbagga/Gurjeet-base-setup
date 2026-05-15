import type { MetricStatus } from "./types";

export const metricStatusStyles: Record<
  MetricStatus,
  { ring: string; label: string; track: string }
> = {
  success: {
    ring: "stroke-success",
    label: "text-success",
    track: "stroke-success/15",
  },
  good: {
    ring: "stroke-dashboard-brand",
    label: "text-dashboard-brand",
    track: "stroke-dashboard-brand/15",
  },
  warning: {
    ring: "stroke-warning",
    label: "text-warning",
    track: "stroke-warning/20",
  },
  alert: {
    ring: "stroke-error",
    label: "text-error",
    track: "stroke-error/15",
  },
  info: {
    ring: "stroke-secondary",
    label: "text-secondary",
    track: "stroke-secondary/20",
  },
};
