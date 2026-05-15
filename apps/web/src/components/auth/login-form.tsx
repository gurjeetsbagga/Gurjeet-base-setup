"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "@/components/auth/auth-icons";
import { AuthInput } from "@/components/auth/auth-input";
import { cn } from "@/lib/utils";

export interface LoginFormProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
  error?: string | null;
}

export function LoginForm({ onSubmit, error }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const displayError = error ?? localError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setNotice(null);
    if (password.length < 8) {
      setLocalError("Password must be at least 8 characters.");
      return;
    }
    setIsLoading(true);
    try {
      await onSubmit({ email, password });
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-8 md:mb-10">
        <h1 className="text-[2rem] font-semibold leading-tight tracking-tight text-foreground md:text-display">
          Welcome back
        </h1>
        <p className="mt-3 text-base text-muted-foreground md:text-body-lg">
          Sign in to continue your recovery journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 md:gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-sm font-semibold text-foreground">
            Email address
          </label>
          <AuthInput
            id="email"
            type="email"
            required
            autoComplete="email"
            placeholder="auryn@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label htmlFor="password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <button
              type="button"
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setNotice("Password reset is coming soon.")}
            >
              Forgot password?
            </button>
          </div>
          <AuthInput
            id="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            trailing={
              <button
                type="button"
                className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-5" /> : <EyeIcon className="size-5" />}
              </button>
            }
          />
        </div>

        {displayError ? (
          <p className="text-sm text-error" role="alert">
            {displayError}
          </p>
        ) : null}
        {notice ? (
          <p className="text-sm text-muted-foreground" role="status">
            {notice}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-auth-brand text-sm font-semibold text-auth-brand-foreground",
            "transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-brand/40 focus-visible:ring-offset-2",
            "disabled:pointer-events-none disabled:opacity-50",
          )}
        >
          {isLoading ? (
            <span
              className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden
            />
          ) : (
            <>
              Sign In
              <ArrowRightIcon className="size-5" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground md:mt-10 md:text-left">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-foreground hover:underline">
          Request access
        </Link>
      </p>
    </>
  );
}
