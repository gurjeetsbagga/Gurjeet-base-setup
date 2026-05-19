"use client";

import { useRouter } from "next/navigation";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { OnboardingForm } from "@/components/profile/onboarding-form";
import { loadProfile, saveProfile } from "@/lib/profile/storage";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <AuthSplitLayout>
      <OnboardingForm
        initial={loadProfile()}
        onComplete={(profile) => {
          saveProfile(profile);
          router.push("/chat");
        }}
      />
    </AuthSplitLayout>
  );
}
