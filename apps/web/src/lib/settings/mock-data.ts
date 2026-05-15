import type { SettingsPageData } from "./types";

export const mockSettingsPageData: SettingsPageData = {
  account: {
    fullName: "Auryn MacMillan",
    email: "auryn@example.com",
    avatarUrl: null,
  },
  privacy: [
    {
      id: "care-team",
      title: "Share progress with Care Team",
      description: "Allow your doctor and physical therapist to view your daily logs.",
      enabled: true,
    },
    {
      id: "community",
      title: "Anonymous Community Data",
      description: "Contribute your recovery timeline to anonymous community statistics.",
      enabled: true,
    },
  ],
};
