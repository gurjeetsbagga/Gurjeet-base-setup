"use client";

import { useState, type FormEvent } from "react";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { SettingsCard } from "@/components/settings/settings-card";
import { SettingsField } from "@/components/settings/settings-field";
import { Button } from "@/components/ui/button";
import type { AccountProfile } from "@/lib/settings/types";

export function AccountManagementCard({
  account,
  onSave,
}: {
  account: AccountProfile;
  onSave?: (account: AccountProfile) => Promise<void> | void;
}) {
  const [fullName, setFullName] = useState(account.fullName);
  const [email, setEmail] = useState(account.email);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaved(false);
    try {
      await onSave?.({ ...account, fullName, email });
      setSaved(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsCard
      title="Account Management"
      description="Update your profile information and email address."
      data-testid="account-management-card"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        <AvatarUpload previewUrl={account.avatarUrl} />

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SettingsField
            id="fullName"
            label="Full Name"
            value={fullName}
            onChange={(e) => {
              setFullName(e.target.value);
              setSaved(false);
            }}
            autoComplete="name"
            required
          />
          <SettingsField
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setSaved(false);
            }}
            autoComplete="email"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Button
            type="submit"
            isLoading={isSaving}
            className="rounded-xl bg-dashboard-brand px-8 text-auth-brand-foreground hover:opacity-95"
          >
            Save Changes
          </Button>
          {saved ? (
            <span className="text-sm text-dashboard-brand" role="status">
              Changes saved
            </span>
          ) : null}
        </div>
      </form>
    </SettingsCard>
  );
}
