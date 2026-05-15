import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function DashboardSectionHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}
    >
      <div className="min-w-0">
        <h1 className="text-display font-semibold tracking-tight text-foreground">{title}</h1>
        {subtitle ? <p className="mt-2 text-body-lg text-muted-foreground">{subtitle}</p> : null}
      </div>
      {action ? <div className="w-full shrink-0 sm:w-auto">{action}</div> : null}
    </header>
  );
}
