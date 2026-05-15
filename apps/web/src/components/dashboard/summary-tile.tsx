import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { SummaryTile } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function SummaryTile({ tile, className }: { tile: SummaryTile; className?: string }) {
  const body = (
    <Card
      className={cn(
        "flex h-full flex-col p-6 shadow-soft transition-shadow hover:shadow-card",
        className,
      )}
    >
      <h3 className="text-h3 font-semibold text-foreground">{tile.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{tile.subtitle}</p>
      <p className="mt-6 text-lg font-semibold text-foreground">{tile.highlight}</p>
    </Card>
  );

  if (tile.href) {
    return (
      <Link
        href={tile.href}
        className="block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-dashboard-brand/40"
      >
        {body}
      </Link>
    );
  }

  return body;
}
