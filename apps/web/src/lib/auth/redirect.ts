/** Only allow same-origin relative paths (prevents open redirects). */
export function getSafeRedirectPath(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }
  return value;
}
