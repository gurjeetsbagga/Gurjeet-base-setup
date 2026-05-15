import { cn } from "@/lib/utils";

export function Avatar({
  label = "A",
  size = "md",
  className,
}: {
  label?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizeClass =
    size === "sm" ? "size-7 text-[10px]" : size === "lg" ? "size-11 text-sm" : "size-9 text-xs";

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-primary ring-2 ring-surface",
        sizeClass,
        className,
      )}
      aria-hidden={label.length <= 2}
    >
      {label}
    </div>
  );
}
