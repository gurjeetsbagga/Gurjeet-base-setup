import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { MemoryToolAction } from "@/lib/private-brain/types";
import { cn } from "@/lib/utils";

export function MemoryToolsPanel({
  tools,
  className,
  onAction,
}: {
  tools: MemoryToolAction[];
  className?: string;
  onAction?: (action: MemoryToolAction) => void;
}) {
  return (
    <Card className={cn("flex flex-col", className)} data-testid="memory-tools-panel">
      <CardContent className="flex flex-col gap-1 p-6">
        <CardTitle className="text-base">Memory Tools</CardTitle>
        <ul className="mt-4 flex flex-col divide-y divide-border-subtle" role="list">
          {tools.map((tool) => (
            <li key={tool.id}>
              <button
                type="button"
                onClick={() => onAction?.(tool)}
                className={cn(
                  "flex w-full flex-col gap-0.5 py-3 text-left text-sm transition-colors hover:text-foreground",
                  tool.variant === "destructive" ? "text-error" : "text-muted-foreground",
                )}
              >
                <span className="font-medium">{tool.label}</span>
                {tool.description ? (
                  <span className="text-caption text-muted-foreground">{tool.description}</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
