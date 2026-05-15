import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { RecoveryPlanCta } from "@/lib/recovery/types";
import { cn } from "@/lib/utils";

export function RecoveryPlanCtaCard({
  cta,
  className,
}: {
  cta: RecoveryPlanCta;
  className?: string;
}) {
  return (
    <Link href={cta.href} className={cn("block h-full", className)}>
      <Card
        className="flex h-full flex-col justify-center gap-1 p-5 shadow-soft transition-opacity hover:opacity-95"
        data-testid="recovery-plan-cta-card"
      >
        <p className="text-h3 font-semibold text-foreground">{cta.title}</p>
        <p className="text-sm text-muted-foreground">{cta.subtitle}</p>
      </Card>
    </Link>
  );
}
