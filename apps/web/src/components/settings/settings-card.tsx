import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function SettingsCard({
  title,
  description,
  children,
  className,
  "data-testid": testId,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <Card className={cn("p-6 shadow-soft sm:p-8", className)} data-testid={testId}>
      <header className="mb-6 max-w-2xl">
        <h2 className="text-h3 font-semibold text-foreground">{title}</h2>
        {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      </header>
      {children}
    </Card>
  );
}
