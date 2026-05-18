"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, EyeIcon, EyeOffIcon } from "@/components/auth/auth-icons";
import { AuthInput } from "@/components/auth/auth-input";
import { resetPassword } from "@/lib/api/auth";
import { ApiClientError } from "@/lib/api/client";
import { cn } from "@/lib/utils";

function readRecoveryAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;
  return new URLSearchParams(hash).get("access_token");
}

function readQueryToken(): string | null {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("token");
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setToken(readQueryToken());
    setAccessToken(readRecoveryAccessToken());
    setReady(true);
  }, []);

  const hasCredential = Boolean(token || accessToken);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!token && !accessToken) {
      setError("This reset link is invalid or has expired. Request a new one.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await resetPassword({
        password,
        ...(token ? { token } : {}),
        ...(accessToken ? { accessToken } : {}),
      });
      setSuccess(result.message);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      if (err instanceof ApiClientError) {
        setError(err.message);
      } else {
        setError("Unable to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!ready) {
    return (
      <div className="flex justify-center py-12">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-auth-brand"
          role="status"
          aria-label="Loading"
        />
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-elevated sm:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
          Choose a new password
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Enter a new password for your account.
        </p>
      </div>

      {!hasCredential ? (
        <div className="space-y-4 text-center">
          <p className="text-sm text-error" role="alert">
            This reset link is invalid or has expired.
          </p>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-foreground hover:underline"
          >
            Request a new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="new-password" className="text-sm font-semibold text-foreground">
              New password
            </label>
            <AuthInput
              id="new-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
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
                  {showPassword ? (
                    <EyeOffIcon className="size-5" />
                  ) : (
                    <EyeIcon className="size-5" />
                  )}
                </button>
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirm-password" className="text-sm font-semibold text-foreground">
              Confirm password
            </label>
            <AuthInput
              id="confirm-password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error ? (
            <p className="text-sm text-error" role="alert">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="text-sm text-foreground" role="status">
              {success}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || !!success}
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
                Update password
                <ArrowRightIcon className="size-5" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-semibold text-foreground hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
