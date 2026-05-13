/**
 * Merge Tailwind class names, resolving conflicts.
 * Replace with `clsx` + `tailwind-merge` when those packages are added.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
