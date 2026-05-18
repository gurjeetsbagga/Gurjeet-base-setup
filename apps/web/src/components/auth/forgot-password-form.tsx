"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthInput } from "@/components/auth/auth-input";
import { requestPasswordReset } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);
      setMessage(result.message);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-elevated sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          Reset your password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label htmlFor="forgot-email" className="text-sm font-semibold text-foreground">
            Email address
          </label>
          <AuthInput
            id="forgot-email"
            type="email"
            required
            autoComplete="email"
            placeholder="auryn@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error ? (
          <p className="text-sm text-error" role="alert">
            {error}
          </p>
        ) : null}
        {message ? (
          <p className="text-sm text-foreground" role="status">
            {message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isLoading || !!message}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center rounded-full bg-auth-brand text-sm font-semibold text-auth-brand-foreground",
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
            "Send reset link"
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
