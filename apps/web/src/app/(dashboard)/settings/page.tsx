import { SettingsView } from "@/components/settings/settings-view";
import { mockSettingsPageData } from "@/lib/settings/mock-data";

export const metadata = {
  title: "Settings | Hey Auryn",
  description: "Manage your account, privacy, and preferences.",
};

export default function SettingsPage() {
  return <SettingsView data={mockSettingsPageData} />;
}
