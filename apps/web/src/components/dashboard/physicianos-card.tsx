import { Card } from "@/components/ui/card";
import { PlusIcon } from "@/components/dashboard/dashboard-icons";
import type { PhysicianConnection } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function PhysicianOsCard({
  physician,
  className,
}: {
  physician: PhysicianConnection;
  className?: string;
}) {
  const connected = physician.status === "connected";

  return (
    <Card
      className={cn(
        "flex flex-col gap-4 p-5 shadow-soft sm:flex-row sm:items-center sm:justify-between sm:p-6",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-4">
        <div
          className="flex size-12 shrink-0 items-center justify-center rounded-full bg-dashboard-brand-muted text-dashboard-brand"
          aria-hidden
        >
          <PlusIcon className="size-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-h3 font-semibold text-foreground">{physician.name}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {physician.credentials} — {physician.specialty}
            {connected ? " — Connected" : ""}
          </p>
        </div>
      </div>
      <div
        className="flex size-11 shrink-0 items-center justify-center rounded-full border border-border-subtle bg-muted text-sm font-semibold text-dashboard-brand"
        aria-label="Provider credentials"
      >
        MD
      </div>
    </Card>
  );
}
