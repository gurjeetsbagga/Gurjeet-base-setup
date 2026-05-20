"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AppleIcon,
  ArrowRightIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
} from "@/components/auth/auth-icons";
import { AuthInput } from "@/components/auth/auth-input";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiClientError } from "@/lib/api/client";
import {
  clearReturningUserProfile,
  getReturningUserProfile,
  markWelcomeBackModalShown,
  type ReturningUserProfile,
} from "@/lib/auth/returning-user";
import { cn } from "@/lib/utils";

export type AuthModalView = "welcome-back" | "hub" | "login" | "signup";

export interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  initialView?: AuthModalView;
  redirectTo?: string;
  onAuthenticated?: () => void;
  /** When true, closing the welcome-back view marks it shown for this session. */
  trackWelcomeSession?: boolean;
}

function ModalCloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
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
  );
}

function OrDivider() {
  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-border-subtle" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-surface px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Or
        </span>
      </div>
    </div>
  );
}

function SocialAuthButtons({ onUnavailable }: { onUnavailable: () => void }) {
  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={onUnavailable}
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border-subtle bg-surface text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
      >
        <GoogleIcon className="size-5 shrink-0" />
        Continue with Google
      </button>
      <button
        type="button"
        onClick={onUnavailable}
        className="inline-flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border-subtle bg-surface text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
      >
        <AppleIcon className="size-5 shrink-0" />
        Continue with Apple
      </button>
    </div>
  );
}

function AccountAvatar({ profile }: { profile: ReturningUserProfile }) {
  return (
    <span
      className="flex size-10 shrink-0 items-center justify-center rounded-full bg-auth-brand text-sm font-semibold text-auth-brand-foreground"
      aria-hidden
    >
      {profile.initials}
    </span>
  );
}

/**
 * ChatGPT-style auth modal: Welcome back account picker, hub, login, and signup.
 */
export function AuthModal({
  open,
  onClose,
  initialView = "hub",
  redirectTo,
  onAuthenticated,
  trackWelcomeSession = false,
}: AuthModalProps) {
  const router = useRouter();
  const { login, register } = useAuth();

  const [view, setView] = useState<AuthModalView>(initialView);
  const [returningProfile, setReturningProfile] = useState<ReturningUserProfile | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setView(initialView);
      setReturningProfile(getReturningUserProfile());
      if (initialView === "login" || initialView === "welcome-back") {
        const profile = getReturningUserProfile();
        setEmail(profile?.email ?? "");
      }
      setError(null);
      setSocialNotice(null);
    }
  }, [open, initialView]);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleClose = useCallback(() => {
    if (trackWelcomeSession && view === "welcome-back") {
      markWelcomeBackModalShown();
    }
    onClose();
  }, [onClose, trackWelcomeSession, view]);

  const completeAuth = useCallback(async () => {
    onAuthenticated?.();
    handleClose();
    if (redirectTo) {
      router.replace(redirectTo);
    }
  }, [handleClose, onAuthenticated, redirectTo, router]);

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
        if (view === "signup") {
          await register({
            email,
            password,
            displayName: displayName.trim() || undefined,
          });
        } else {
          await login({ email, password });
        }
        await completeAuth();
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
    [completeAuth, displayName, email, login, password, register, view],
  );

  const selectReturningAccount = useCallback(() => {
    if (returningProfile) {
      setEmail(returningProfile.email);
      setView("login");
      setError(null);
    }
  }, [returningProfile]);

  const removeReturningAccount = useCallback(() => {
    clearReturningUserProfile();
    setReturningProfile(null);
    setEmail("");
    setView("hub");
  }, []);

  if (!open) return null;

  const titleId = "auth-modal-title";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6"
    >
      <div
        aria-hidden
        className="absolute inset-0 bg-foreground/45 backdrop-blur-sm"
        onClick={handleClose}
      />
      <div className="relative z-10 w-full max-w-[26rem] rounded-2xl border border-border-subtle bg-surface p-6 shadow-soft sm:p-8">
        <ModalCloseButton onClick={handleClose} />

        {view === "welcome-back" && returningProfile ? (
          <div>
            <h2 id={titleId} className="pr-8 text-2xl font-semibold tracking-tight text-foreground">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">Choose an account to continue.</p>

            <button
              type="button"
              onClick={selectReturningAccount}
              className="mt-6 flex w-full items-center gap-3 rounded-xl border-2 border-foreground/90 bg-surface p-3 text-left transition-colors hover:bg-muted/40"
            >
              <AccountAvatar profile={returningProfile} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-foreground">
                  {returningProfile.displayName}
                </span>
                <span className="block truncate text-sm text-muted-foreground">
                  {returningProfile.email}
                </span>
              </span>
              <span
                role="button"
                tabIndex={0}
                aria-label="Remove saved account"
                className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  removeReturningAccount();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    removeReturningAccount();
                  }
                }}
              >
                <svg className="size-4" viewBox="0 0 20 20" fill="none" aria-hidden>
                  <path
                    d="M5 5l10 10M15 5L5 15"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </button>

            <OrDivider />

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setEmail("");
                  setView("login");
                  setError(null);
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border-subtle bg-surface text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                Log in to another account
              </button>
              <button
                type="button"
                onClick={() => {
                  setView("signup");
                  setError(null);
                }}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-border-subtle bg-surface text-sm font-medium text-foreground transition-colors hover:bg-muted/50"
              >
                Create account
              </button>
            </div>
          </div>
        ) : null}

        {view === "hub" ? (
          <div>
            <h2 id={titleId} className="pr-8 text-2xl font-semibold tracking-tight text-foreground">
              Log in or sign up
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You&apos;ll get personalized recovery guidance, saved conversations, and more.
            </p>

            <div className="mt-6">
              <SocialAuthButtons
                onUnavailable={() =>
                  setSocialNotice("Social sign-in is coming soon. Continue with email below.")
                }
              />
            </div>

            {socialNotice ? (
              <p className="mt-3 text-sm text-muted-foreground" role="status">
                {socialNotice}
              </p>
            ) : null}

            <div className="mt-4">
              <OrDivider />
            </div>

            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                setView("login");
                setError(null);
              }}
            >
              <label htmlFor="auth-hub-email" className="sr-only">
                Email address
              </label>
              <AuthInput
                id="auth-hub-email"
                type="email"
                required
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-90"
              >
                Continue
              </button>
            </form>
          </div>
        ) : null}

        {view === "login" || view === "signup" ? (
          <div>
            <h2 id={titleId} className="pr-8 text-2xl font-semibold tracking-tight text-foreground">
              {view === "signup" ? "Create your account" : "Welcome back"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {view === "signup"
                ? "Join Auryn for calm, personalized wellness and recovery support."
                : "Sign in to continue your journey."}
            </p>

            {view === "login" ? (
              <div className="mt-5">
                <SocialAuthButtons
                  onUnavailable={() =>
                    setSocialNotice("Social sign-in is coming soon. Use email and password below.")
                  }
                />
                <div className="mt-4">
                  <OrDivider />
                </div>
              </div>
            ) : null}

            {socialNotice && view === "login" ? (
              <p className="mt-3 text-sm text-muted-foreground" role="status">
                {socialNotice}
              </p>
            ) : null}

            <form
              onSubmit={handleSubmit}
              className={cn("flex flex-col gap-4", view === "login" ? "mt-4" : "mt-6")}
            >
              {view === "signup" ? (
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="auth-modal-name"
                    className="text-sm font-semibold text-foreground"
                  >
                    Your name
                  </label>
                  <AuthInput
                    id="auth-modal-name"
                    type="text"
                    autoComplete="name"
                    placeholder="How should Auryn address you?"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
              ) : null}

              <div className="flex flex-col gap-2">
                <label htmlFor="auth-modal-email" className="text-sm font-semibold text-foreground">
                  Email address
                </label>
                <AuthInput
                  id="auth-modal-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label
                  htmlFor="auth-modal-password"
                  className="text-sm font-semibold text-foreground"
                >
                  Password
                </label>
                <AuthInput
                  id="auth-modal-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  autoComplete={view === "signup" ? "new-password" : "current-password"}
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
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-auth-brand text-sm font-semibold text-auth-brand-foreground",
                  "transition-opacity hover:opacity-95 disabled:pointer-events-none disabled:opacity-50",
                )}
              >
                {isSubmitting ? (
                  <span
                    className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden
                  />
                ) : (
                  <>
                    {view === "signup" ? "Create account" : "Continue"}
                    <ArrowRightIcon className="size-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 flex flex-col items-center gap-2 text-sm text-muted-foreground">
              {view === "signup" ? (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="font-semibold text-foreground hover:underline"
                    onClick={() => {
                      setView(returningProfile ? "welcome-back" : "hub");
                      setError(null);
                    }}
                  >
                    Log in
                  </button>
                </p>
              ) : (
                <p>
                  New to Auryn?{" "}
                  <button
                    type="button"
                    className="font-semibold text-foreground hover:underline"
                    onClick={() => {
                      setView("signup");
                      setError(null);
                    }}
                  >
                    Create account
                  </button>
                </p>
              )}
              {view === "login" ? (
                <Link
                  href="/forgot-password"
                  className="transition-colors hover:text-foreground"
                  onClick={handleClose}
                >
                  Forgot password?
                </Link>
              ) : null}
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setView(returningProfile ? "welcome-back" : "hub");
                  setError(null);
                }}
              >
                ← Back
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
