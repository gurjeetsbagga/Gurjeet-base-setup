"use client";

import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiClientError } from "@/lib/api/client";

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();

  return (
    <AuthSplitLayout>
      <AuthForm
        mode="signup"
        onSubmit={async (data) => {
          try {
            await register(data);
            router.push("/onboarding");
          } catch (err) {
            if (err instanceof ApiClientError) throw err;
            if (err instanceof Error && err.message) throw err;
            throw new Error("Unable to create account. Please try again.");
          }
        }}
      />
    </AuthSplitLayout>
  );
}
