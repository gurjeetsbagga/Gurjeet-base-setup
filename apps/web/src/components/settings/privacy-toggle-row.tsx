import { Switch } from "@/components/ui/switch";
import type { PrivacySetting } from "@/lib/settings/types";
import { cn } from "@/lib/utils";

export function PrivacyToggleRow({
  setting,
  onChange,
  loading,
  className,
}: {
  setting: PrivacySetting;
  onChange: (enabled: boolean) => void;
  loading?: boolean;
  className?: string;
}) {
  const switchId = `privacy-${setting.id}`;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border-subtle py-5 last:border-0",
        className,
      )}
      data-testid={`privacy-row-${setting.id}`}
    >
      <label htmlFor={switchId} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-semibold text-foreground">{setting.title}</span>
        <span className="mt-1 block text-sm text-muted-foreground">{setting.description}</span>
      </label>
      <Switch
        id={switchId}
        checked={setting.enabled}
        onCheckedChange={onChange}
        disabled={setting.locked}
        loading={loading}
        aria-label={setting.title}
      />
    </div>
  );
}
