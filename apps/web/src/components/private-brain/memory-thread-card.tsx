import { Card } from "@/components/ui/card";
import { formatMemoryMeta, MEMORY_CATEGORY_STYLES } from "@/lib/private-brain/categories";
import type { MemoryThread } from "@/lib/private-brain/types";
import { cn } from "@/lib/utils";

export function MemoryThreadCard({
  thread,
  className,
  onSelect,
}: {
  thread: MemoryThread;
  className?: string;
  onSelect?: (thread: MemoryThread) => void;
}) {
  const category = MEMORY_CATEGORY_STYLES[thread.category];
  const meta = formatMemoryMeta(thread);

  const content = (
    <>
      <span className={cn("size-10 shrink-0 rounded-xl", category.indicatorClass)} aria-hidden />
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-base font-semibold text-foreground">{thread.title}</h3>
        <p className="mt-1 line-clamp-2 text-caption text-muted-foreground">{meta}</p>
      </div>
    </>
  );

  if (onSelect) {
    return (
      <button
        type="button"
        onClick={() => onSelect(thread)}
        className={cn("w-full text-left transition-opacity hover:opacity-95", className)}
      >
        <Card className="flex items-start gap-4 p-4">{content}</Card>
      </button>
    );
  }

  return (
    <Card className={cn("flex items-start gap-4 p-4", className)} data-testid="memory-thread-card">
      {content}
    </Card>
  );
}
