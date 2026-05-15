"use client";

import { useRouter } from "next/navigation";
import { AuthForm } from "@/components/auth/auth-form";
import { useAuth } from "@/lib/auth/auth-provider";
import { ApiClientError } from "@/lib/api/client";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  return (
    <AuthForm
      mode="login"
      onSubmit={async (data) => {
        try {
          await login(data);
          router.push("/chat");
        } catch (err) {
          if (err instanceof ApiClientError) throw err;
          throw new Error("Unable to sign in. Please check your credentials.");
        }
      }}
    />
  );
}
