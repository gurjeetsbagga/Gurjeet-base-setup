import { cn } from "@/lib/utils";

export type StatusBadgeTone = "success" | "neutral";

const toneStyles: Record<StatusBadgeTone, string> = {
  success: "bg-dashboard-brand-muted text-dashboard-brand",
  neutral: "bg-muted text-muted-foreground",
};

export function StatusBadge({
  label,
  tone = "success",
  className,
}: {
  label: string;
  tone?: StatusBadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-caption font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
