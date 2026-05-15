"use client";

import { useRouter } from "next/navigation";
import { OnboardingForm } from "@/components/profile/onboarding-form";
import { loadProfile, saveProfile } from "@/lib/profile/storage";

export default function OnboardingPage() {
  const router = useRouter();

  return (
    <OnboardingForm
      initial={loadProfile()}
      onComplete={(profile) => {
        saveProfile(profile);
        router.push("/chat");
      }}
    />
  );
}
