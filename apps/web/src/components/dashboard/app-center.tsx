import { Card } from "@/components/ui/card";
import type { AppCenterItem } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function AppCenter({
  title = "App Center",
  items,
  className,
}: {
  title?: string;
  items: AppCenterItem[];
  className?: string;
}) {
  return (
    <Card className={cn("p-6 shadow-soft", className)}>
      <h3 className="text-h3 font-semibold text-foreground">{title}</h3>
      <ul className="mt-5 grid grid-cols-5 gap-3 sm:gap-4" role="list">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={cn(
                "flex w-full flex-col items-center gap-2 rounded-xl p-2 transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/40",
                item.active ? "text-dashboard-brand" : "text-muted-foreground hover:bg-muted",
              )}
              aria-label={item.label}
              title={item.label}
            >
              <span
                className={cn(
                  "flex size-11 items-center justify-center rounded-full border text-xs font-semibold",
                  item.active
                    ? "border-dashboard-brand/20 bg-dashboard-brand text-auth-brand-foreground"
                    : "border-border-subtle bg-muted",
                )}
              >
                {item.label.slice(0, 1)}
              </span>
              <span className="sr-only">{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}
