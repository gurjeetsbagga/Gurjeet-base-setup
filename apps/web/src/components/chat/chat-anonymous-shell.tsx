"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { AurynLogoMark } from "@/components/dashboard/dashboard-icons";
import { AnonymousCounter } from "./anonymous-counter";

export interface ChatAnonymousShellProps {
  remainingMessages: number;
  totalMessages: number;
  /** The chat conversation panel (input + messages). */
  children: ReactNode;
  onSignInClick?: () => void;
  onSignUpClick?: () => void;
}

/**
 * Minimal chrome for unauthenticated visitors: brand mark on the left,
 * preview-message counter and Sign in / Sign up CTAs on the right.
 *
 * Deliberately strips the full dashboard shell (no sidebar, no top nav)
 * because anonymous users do not have access to any other menu item.
 */
export function ChatAnonymousShell({
  remainingMessages,
  totalMessages,
  children,
  onSignInClick,
  onSignUpClick,
}: ChatAnonymousShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="border-b border-border-subtle bg-surface/80 backdrop-blur supports-[backdrop-filter]:bg-surface/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-2" aria-label="Hey Auryn home">
            <AurynLogoMark className="size-7" />
            <span className="text-base font-semibold text-foreground">Hey Auryn</span>
          </Link>

          <div className="flex items-center gap-3">
            <AnonymousCounter
              remaining={remainingMessages}
              total={totalMessages}
              className="hidden sm:inline-flex"
            />
            <Link
              href="/login"
              onClick={(e) => {
                if (onSignInClick) {
                  e.preventDefault();
                  onSignInClick();
                }
              }}
              className="rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              onClick={(e) => {
                if (onSignUpClick ?? onSignInClick) {
                  e.preventDefault();
                  (onSignUpClick ?? onSignInClick)!();
                }
              }}
              className="inline-flex h-9 items-center justify-center rounded-full bg-auth-brand px-4 text-sm font-semibold text-auth-brand-foreground transition-opacity hover:opacity-95"
            >
              Sign up
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3 sm:hidden">
          <AnonymousCounter remaining={remainingMessages} total={totalMessages} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col px-4 py-6 sm:px-6">
        {children}
      </main>
    </div>
  );
}
