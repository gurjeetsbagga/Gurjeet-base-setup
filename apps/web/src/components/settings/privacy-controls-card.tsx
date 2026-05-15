"use client";

import { useState } from "react";
import { PrivacyToggleRow } from "@/components/settings/privacy-toggle-row";
import { SettingsCard } from "@/components/settings/settings-card";
import type { PrivacySetting } from "@/lib/settings/types";

export function PrivacyControlsCard({
  settings: initial,
  onChange,
}: {
  settings: PrivacySetting[];
  onChange?: (settings: PrivacySetting[]) => Promise<void> | void;
}) {
  const [settings, setSettings] = useState(initial);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const updateSetting = async (id: string, enabled: boolean) => {
    const next = settings.map((s) => (s.id === id ? { ...s, enabled } : s));
    setSettings(next);
    setLoadingId(id);
    try {
      await onChange?.(next);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <SettingsCard
      title="Privacy Controls"
      description="Manage what information is shared with your care team and the community."
      data-testid="privacy-controls-card"
    >
      <div role="list">
        {settings.map((setting) => (
          <PrivacyToggleRow
            key={setting.id}
            setting={setting}
            loading={loadingId === setting.id}
            onChange={(enabled) => updateSetting(setting.id, enabled)}
          />
        ))}
      </div>
    </SettingsCard>
  );
}
