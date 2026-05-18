"use client";

import { useEffect, useState } from "react";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";
import {
  getLastLoginEmail,
  getReturningUserProfile,
  isReturningUser,
  type ReturningUserProfile,
} from "@/lib/auth/returning-user";

export interface LoginScreenProps {
  onSubmit: (data: { email: string; password: string }) => Promise<void>;
}

/** Single split-screen login for all users (returning users get email + testimonial name). */
export function LoginScreen({ onSubmit }: LoginScreenProps) {
  const [returningProfile, setReturningProfile] = useState<ReturningUserProfile | null>(null);
  const [initialEmail, setInitialEmail] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  useEffect(() => {
    const returning = isReturningUser();
    setIsReturning(returning);
    setReturningProfile(getReturningUserProfile());
    setInitialEmail(getLastLoginEmail() ?? "");
  }, []);

  return (
    <AuthSplitLayout returningProfile={returningProfile}>
      <LoginForm onSubmit={onSubmit} initialEmail={initialEmail} isReturning={isReturning} />
    </AuthSplitLayout>
  );
}
