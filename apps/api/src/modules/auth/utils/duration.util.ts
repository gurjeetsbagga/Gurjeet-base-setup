/** Parse strings like `15m`, `7d` into seconds. */
export function parseDurationToSeconds(value: string, fallbackSeconds = 900): number {
  const match = /^(\d+)([smhd])$/i.exec(value.trim());
  if (!match) return fallbackSeconds;

  const amount = Number.parseInt(match[1]!, 10);
  const unit = match[2]!.toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * (multipliers[unit] ?? 60);
}
