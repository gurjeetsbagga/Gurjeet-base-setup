import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { DashboardCta } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function CtaCard({ cta, className }: { cta: DashboardCta; className?: string }) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-6 shadow-soft sm:flex sm:items-center sm:justify-between sm:gap-6",
        className,
      )}
    >
      <div className="relative z-10 max-w-md">
        <h3 className="text-h3 font-semibold text-foreground">{cta.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{cta.subtitle}</p>
        <Link href={cta.href} className="mt-5 inline-block">
          <Button className="rounded-full bg-dashboard-brand px-6 text-auth-brand-foreground hover:opacity-95">
            {cta.actionLabel}
          </Button>
        </Link>
      </div>
      <div className="pointer-events-none relative mt-6 flex shrink-0 gap-2 sm:mt-0" aria-hidden>
        <span className="size-16 rounded-full bg-dashboard-brand/80" />
        <span className="-ml-6 mt-4 size-14 rounded-full bg-warning/80" />
        <span className="-ml-6 mt-8 size-12 rounded-full bg-error/70" />
      </div>
    </Card>
  );
}
