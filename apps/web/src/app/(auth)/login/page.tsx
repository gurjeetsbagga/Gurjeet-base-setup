"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LoginScreen } from "@/components/auth/login-screen";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiClientError } from "@/lib/api/client";
import { getSafeRedirectPath } from "@/lib/auth/redirect";

function LoginPageContent() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirectPath(searchParams.get("redirect"));

  return (
    <LoginScreen
      onSubmit={async (data) => {
        try {
          await login(data);
          router.push(redirectTo);
        } catch (err) {
          if (err instanceof ApiClientError) throw err;
          throw new Error("Unable to sign in. Please check your credentials.");
        }
      }}
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  );
}
