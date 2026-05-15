"use client";

import { useEffect, useState } from "react";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/layout/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { loadProfile, saveProfile } from "@/lib/profile/storage";
import type { UserProfile } from "@/lib/api/types";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    setProfile(loadProfile());
  }, []);

  if (!profile) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-4 w-full max-w-md" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8">
      <PageHeader
        title="Your profile"
        description="Help Auryn understand your wellness journey for more thoughtful, personalized guidance."
      />
      <ProfileForm initial={profile} onSave={saveProfile} />
    </div>
  );
}
