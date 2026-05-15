export interface AccountProfile {
  fullName: string;
  email: string;
  avatarUrl?: string | null;
}

export interface PrivacySetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  locked?: boolean;
}

export interface SettingsPageData {
  account: AccountProfile;
  privacy: PrivacySetting[];
}
