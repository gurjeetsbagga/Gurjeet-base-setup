"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

  return <LoginScreen redirectTo={redirectTo} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
