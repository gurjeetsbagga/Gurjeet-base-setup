"use client";

import { AuthModalPage } from "@/components/auth/auth-modal-page";

export interface LoginScreenProps {
  redirectTo?: string;
}

/** Login route — ChatGPT-style modal over a calm backdrop. */
export function LoginScreen({ redirectTo = "/chat" }: LoginScreenProps) {
  return <AuthModalPage defaultView="login" redirectTo={redirectTo} />;
}
