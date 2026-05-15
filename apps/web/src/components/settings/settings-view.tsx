import { AccountManagementCard } from "@/components/settings/account-management-card";
import { PrivacyControlsCard } from "@/components/settings/privacy-controls-card";
import { DashboardSectionHeader } from "@/components/dashboard/dashboard-section-header";
import type { SettingsPageData } from "@/lib/settings/types";

export function SettingsView({
  data,
  onSaveAccount,
  onPrivacyChange,
}: {
  data: SettingsPageData;
  onSaveAccount?: (account: SettingsPageData["account"]) => Promise<void> | void;
  onPrivacyChange?: (privacy: SettingsPageData["privacy"]) => Promise<void> | void;
}) {
  return (
    <div className="flex flex-col gap-8 pb-28 lg:gap-10" data-testid="settings-view">
      <DashboardSectionHeader
        title="Settings"
        subtitle="Manage your account, privacy, and preferences."
      />

      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 lg:gap-8">
        <AccountManagementCard account={data.account} onSave={onSaveAccount} />
        <PrivacyControlsCard settings={data.privacy} onChange={onPrivacyChange} />
      </div>
    </div>
  );
}
