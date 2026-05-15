import type { ReactNode } from "react";
import { Text } from "@/components/ui/text";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mx-auto mb-8 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <Text variant="h1" as="h1">
          {title}
        </Text>
        {description ? (
          <Text variant="body-lg" className="mt-2">
            {description}
          </Text>
        ) : null}
      </div>
      {action}
    </header>
  );
}
