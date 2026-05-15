"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AppleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LockIcon,
  MailIcon,
} from "@/components/auth/auth-icons";
import { AuthInput } from "@/components/auth/auth-input";
import { Button } from "@/components/ui/button";
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
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const displayError = error ?? localError;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setSocialNotice(null);
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
      <div className="rounded-2xl border border-border-subtle bg-surface px-6 py-8 shadow-card sm:px-8 sm:py-10">
        <div className="mb-8 text-center">
          <h1 className="text-h2 font-semibold text-foreground">Log in to your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your details to access your recovery plan.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-label font-semibold text-foreground">
              Email
            </label>
            <AuthInput
              id="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leadingIcon={<MailIcon />}
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-label font-semibold text-foreground">
                Password
              </label>
              <button
                type="button"
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => setSocialNotice("Password reset is coming soon.")}
              >
                Forgot?
              </button>
            </div>
            <AuthInput
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leadingIcon={<LockIcon />}
              trailing={
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
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

          {displayError ? (
            <p className="text-sm text-error" role="alert">
              {displayError}
            </p>
          ) : null}
          {socialNotice ? (
            <p className="text-sm text-muted-foreground" role="status">
              {socialNotice}
            </p>
          ) : null}

          <Button
            type="submit"
            isLoading={isLoading}
            className="h-12 w-full rounded-xl bg-auth-brand text-auth-brand-foreground hover:opacity-95"
          >
            Log In
            <ArrowRightIcon className="size-5" />
          </Button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-border-subtle" aria-hidden />
            <span className="relative bg-surface px-3 text-caption font-medium uppercase tracking-widest text-muted-foreground">
              Or continue with
            </span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SocialButton
              label="Google"
              icon={<GoogleIcon className="size-5" />}
              onClick={() => setSocialNotice("Google sign-in is coming soon.")}
            />
            <SocialButton
              label="Apple"
              icon={<AppleIcon className="size-5" />}
              onClick={() => setSocialNotice("Apple sign-in is coming soon.")}
            />
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-medium text-auth-brand hover:underline">
          Sign up here
        </Link>
      </p>
    </>
  );
}

function SocialButton({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface text-sm font-medium text-foreground",
        "transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-brand/30",
      )}
    >
      {icon}
      {label}
    </button>
  );
}
