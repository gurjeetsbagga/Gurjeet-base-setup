import type { RecoveryFocusStatus } from "./types";

export const recoveryFocusStatusStyles: Record<
  RecoveryFocusStatus,
  { badge: string; label: string }
> = {
  on_track: {
    badge: "bg-dashboard-brand-muted text-dashboard-brand",
    label: "On track",
  },
  caution: {
    badge: "bg-warning/15 text-warning",
    label: "Needs attention",
  },
  delayed: {
    badge: "bg-error/10 text-error",
    label: "Behind schedule",
  },
  completed: {
    badge: "bg-muted text-muted-foreground",
    label: "Completed",
  },
};
