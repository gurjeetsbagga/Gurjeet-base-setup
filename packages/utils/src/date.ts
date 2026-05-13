/**
 * Format a Date to a locale-friendly display string.
 * Defaults to "Jan 1, 2025" style.
 */
export function formatDate(
  date: Date | string,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Normalise any date-like value to an ISO-8601 string.
 */
export function toISOString(date: Date | string | number): string {
  return new Date(date).toISOString();
}
