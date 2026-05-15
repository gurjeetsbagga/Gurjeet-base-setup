"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { loadProfile, saveProfile } from "@/lib/profile/storage";
import type { UserProfile } from "@/lib/api/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  if (!profile) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <header className="mx-auto mb-8 max-w-2xl">
        <h1 className="text-2xl font-semibold text-foreground">Your profile</h1>
        <p className="mt-2 text-muted-foreground">
          Help Auryn understand your wellness journey for more thoughtful, personalized guidance.
        </p>
      </header>
      <ProfileForm initial={profile} onSave={saveProfile} />
    </div>
  );
}
