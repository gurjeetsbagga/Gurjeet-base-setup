import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Text } from "./text";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface/60 px-6 py-12 text-center",
        className,
      )}
    >
      <Text variant="h3" as="h2" className="mb-2">
        {title}
      </Text>
      {description ? (
        <Text variant="body-lg" className="max-w-sm">
          {description}
        </Text>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
