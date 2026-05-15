import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export function SettingsField({
  id,
  label,
  className,
  inputClassName,
  ...inputProps
}: {
  id: string;
  label: string;
  className?: string;
  inputClassName?: string;
} & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Label htmlFor={id} className="text-label font-semibold text-foreground">
        {label}
      </Label>
      <Input
        id={id}
        className={cn("border-border-subtle bg-muted/50", inputClassName)}
        {...inputProps}
      />
    </div>
  );
}
