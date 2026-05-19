"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "@/components/auth/auth-icons";
import { AuthInput } from "@/components/auth/auth-input";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export interface LoginGateModalProps {
  open: boolean;
  onClose: () => void;
  /**
   * Path to send the user to after a successful sign-in or sign-up. Defaults
   * to keeping them on the current chat so they can continue the preview
   * conversation with a real account.
   */
  redirectTo?: string;
  /**
   * Optional callback fired after the user successfully authenticates. Useful
   * for hooking up the future "claim anonymous conversation" flow.
   */
  onAuthenticated?: () => void;
}

type Mode = "signup" | "login";

/**
 * Login / sign-up modal that fires after the anonymous preview quota is
 * exhausted. Keeps the user in the chat surface — no full-page navigation —
 * so the conversation context stays visible behind the gate.
 */
export function LoginGateModal({
  open,
  onClose,
  redirectTo,
  onAuthenticated,
}: LoginGateModalProps) {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        return;
      }
      setIsSubmitting(true);
      try {
        if (mode === "signup") {
          await register({
            email,
            password,
            displayName: displayName.trim() || undefined,
          });
        } else {
          await login({ email, password });
        }
        onAuthenticated?.();
        onClose();
        if (redirectTo) {
          router.replace(redirectTo);
        }
      } catch (err) {
        setError(
          err instanceof ApiClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "Something went wrong. Please try again.",
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      displayName,
      email,
      login,
      mode,
      onAuthenticated,
      onClose,
      password,
      redirectTo,
      register,
      router,
    ],
  );

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-gate-title"
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft sm:p-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <svg className="size-5" viewBox="0 0 20 20" fill="none" aria-hidden>
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2 id="login-gate-title" className="text-xl font-semibold text-foreground sm:text-2xl">
            {mode === "signup" ? "Save your conversation" : "Welcome back"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "signup"
              ? "You've used your preview messages. Create an account to continue with Auryn and unlock personalized recovery guidance."
              : "Sign in to pick up where you left off."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === "signup" ? (
            <div className="flex flex-col gap-2">
              <label htmlFor="login-gate-name" className="text-sm font-semibold text-foreground">
                Your name
              </label>
              <AuthInput
                id="login-gate-name"
                type="text"
                autoComplete="name"
                placeholder="How should Auryn address you?"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label htmlFor="login-gate-email" className="text-sm font-semibold text-foreground">
              Email address
            </label>
            <AuthInput
              id="login-gate-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="login-gate-password" className="text-sm font-semibold text-foreground">
              Password
            </label>
            <AuthInput
              id="login-gate-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              trailing={
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              }
            />
          </div>

          {error ? (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "inline-flex h-12 items-center justify-center gap-2 rounded-full bg-auth-brand text-sm font-semibold text-auth-brand-foreground",
              "transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-brand/40 focus-visible:ring-offset-2",
              "disabled:pointer-events-none disabled:opacity-50",
            )}
          >
            {isSubmitting ? (
              <span
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                aria-hidden
              />
            ) : (
              <>
                {mode === "signup" ? "Create account" : "Sign in"}
                <ArrowRightIcon className="size-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 flex flex-col items-center gap-2 text-sm text-muted-foreground">
          {mode === "signup" ? (
            <p>
              Already have an account?{" "}
              <button
                type="button"
                className="font-semibold text-foreground hover:underline"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              New to Auryn?{" "}
              <button
                type="button"
                className="font-semibold text-foreground hover:underline"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
              >
                Create an account
              </button>
            </p>
          )}
          {mode === "login" ? (
            <Link
              href="/forgot-password"
              className="transition-colors hover:text-foreground"
              onClick={onClose}
            >
              Forgot password?
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
