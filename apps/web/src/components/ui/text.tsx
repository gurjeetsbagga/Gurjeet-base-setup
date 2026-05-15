import { cn } from "@/lib/utils";
import type { ElementType, HTMLAttributes } from "react";

type TextVariant = "display" | "h1" | "h2" | "h3" | "body" | "body-lg" | "caption" | "label";

const variantStyles: Record<TextVariant, string> = {
  display: "text-display font-semibold tracking-tight text-foreground",
  h1: "text-h1 font-semibold tracking-tight text-foreground",
  h2: "text-h2 font-semibold text-foreground",
  h3: "text-h3 font-medium text-foreground",
  body: "text-body text-foreground",
  "body-lg": "text-body-lg leading-relaxed text-muted-foreground",
  caption: "text-caption text-muted-foreground",
  label: "text-label font-medium text-foreground",
};

const defaultElement: Record<TextVariant, ElementType> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  body: "p",
  "body-lg": "p",
  caption: "p",
  label: "span",
};

export function Text({
  variant = "body",
  as,
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { variant?: TextVariant; as?: ElementType }) {
  const Component = as ?? defaultElement[variant];
  return <Component className={cn(variantStyles[variant], className)} {...props} />;
}
