import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface AuthInputProps extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
  trailing?: ReactNode;
  error?: boolean;
}

export const AuthInput = forwardRef<HTMLInputElement, AuthInputProps>(
  ({ className, leadingIcon, trailing, error, ...props }, ref) => (
    <div className="relative">
      {leadingIcon ? (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground [&_svg]:size-5">
          {leadingIcon}
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl border border-transparent bg-auth-input text-sm text-foreground placeholder:text-muted-foreground",
          "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-brand/30 focus-visible:border-auth-brand/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          leadingIcon && "pl-11",
          trailing && "pr-11",
          error && "ring-2 ring-error/30",
          className,
        )}
        {...props}
      />
      {trailing ? (
        <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
          {trailing}
        </span>
      ) : null}
    </div>
  ),
);
AuthInput.displayName = "AuthInput";
