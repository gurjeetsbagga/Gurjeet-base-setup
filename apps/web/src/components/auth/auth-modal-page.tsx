"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { AuthModal, type AuthModalView } from "@/components/auth/auth-modal";
import { getReturningUserProfile, isReturningUser } from "@/lib/auth/returning-user";

export interface AuthModalPageProps {
  /** Preferred view when the user is not a returning visitor. */
  defaultView: AuthModalView;
  redirectTo?: string;
}

/**
 * Full-page auth entry (`/login`, `/signup`) using the same modal as chat.
 */
export function AuthModalPage({ defaultView, redirectTo = "/chat" }: AuthModalPageProps) {
  const router = useRouter();

  const initialView = useMemo((): AuthModalView => {
    if (defaultView === "login" && isReturningUser() && getReturningUserProfile()) {
      return "welcome-back";
    }
    return defaultView === "signup" ? "signup" : "hub";
  }, [defaultView]);

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <AuthModal
        open
        initialView={initialView}
        redirectTo={redirectTo}
        onClose={() => router.push("/chat")}
      />
    </div>
  );
}
