import { Card } from "@/components/ui/card";
import { AurynLogoMark } from "@/components/dashboard/dashboard-icons";
import type { WelcomeCardContent } from "@/lib/dashboard/types";
import { cn } from "@/lib/utils";

export function WelcomeCard({
  content,
  className,
}: {
  content: WelcomeCardContent;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "flex min-h-[280px] flex-col items-center justify-center p-8 text-center shadow-soft sm:min-h-[320px]",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <span
          className="absolute size-32 rounded-full border-[3px] border-dashboard-brand/25 sm:size-40"
          aria-hidden
        />
        <span
          className="absolute size-24 rounded-full border-2 border-dashboard-brand/40 sm:size-28"
          aria-hidden
        />
        <AurynLogoMark className="relative size-16 sm:size-20" />
      </div>
      <h2 className="mt-8 text-h2 font-semibold text-foreground">{content.brandName}</h2>
      <p className="mt-2 text-caption font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        {content.tagline}
      </p>
    </Card>
  );
}
