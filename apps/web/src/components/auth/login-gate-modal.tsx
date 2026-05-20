"use client";

import { AuthModal, type AuthModalProps } from "@/components/auth/auth-modal";

export type LoginGateModalProps = Omit<AuthModalProps, "initialView" | "trackWelcomeSession"> & {
  /** Defaults to signup when the preview message limit is hit. */
  initialView?: AuthModalProps["initialView"];
};

/**
 * Login / sign-up modal after the anonymous preview quota is exhausted.
 */
export function LoginGateModal({ initialView = "signup", ...props }: LoginGateModalProps) {
  return <AuthModal initialView={initialView} trackWelcomeSession={false} {...props} />;
}
