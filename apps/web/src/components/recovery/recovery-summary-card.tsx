import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Card } from "@/components/ui/card";
import type { RecoveryProtocolSummary } from "@/lib/recovery/types";
import { cn } from "@/lib/utils";

export function RecoverySummaryCard({
  protocol,
  className,
}: {
  protocol: RecoveryProtocolSummary;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex flex-col gap-6 p-6 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-8",
        className,
      )}
      data-testid="recovery-summary-card"
    >
      <div className="min-w-0 flex-1">
        <h1 className="text-h2 font-semibold text-foreground">{protocol.title}</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">{protocol.subtitle}</p>
      </div>
      <ProgressRing
        progress={protocol.progressPercent}
        status="good"
        label={`Recovery protocol ${protocol.progressPercent}% complete`}
      />
    </Card>
  );
}
