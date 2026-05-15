"use client";

import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiClientError } from "@/lib/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <LoginForm
      onSubmit={async (data) => {
        try {
          await login(data);
          router.push("/dashboard");
        } catch (err) {
          if (err instanceof ApiClientError) throw err;
          throw new Error("Unable to sign in. Please check your credentials.");
        }
      }}
    />
  );
}
