"use client";

import { AuthModalPage } from "@/components/auth/auth-modal-page";

export default function SignupPage() {
  return <AuthModalPage defaultView="signup" redirectTo="/onboarding" />;
}
