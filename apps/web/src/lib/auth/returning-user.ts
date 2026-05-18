/**
 * Returning-user snapshot — stored in localStorage (survives logout).
 * Used to prefill email and show the personalized testimonial panel on login.
 */

const RETURNING_USER_KEY = "auryn_has_logged_in_before";
const PROFILE_KEY = "auryn_returning_profile";

export interface ReturningUserProfile {
  email: string;
  displayName: string;
  initials: string;
}

export function initialsFromIdentity(email?: string | null, displayName?: string | null): string {
  if (displayName?.trim()) {
    const parts = displayName.trim().split(/\s+/);
    return parts
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("");
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "AU";
}

function formatDisplayName(displayName: string | null | undefined, email: string): string {
  if (displayName?.trim()) return displayName.trim();
  const local = email.split("@")[0]?.trim();
  if (!local) return "Member";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export function isReturningUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(RETURNING_USER_KEY) === "1";
}

export function getReturningUserProfile(): ReturningUserProfile | null {
  if (typeof window === "undefined") return null;
  if (!isReturningUser()) return null;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReturningUserProfile;
    if (!parsed.email || !parsed.displayName) return null;
    return {
      email: parsed.email,
      displayName: parsed.displayName,
      initials: parsed.initials || initialsFromIdentity(parsed.email, parsed.displayName),
    };
  } catch {
    return null;
  }
}

export function getLastLoginEmail(): string | null {
  return getReturningUserProfile()?.email ?? null;
}

export function saveReturningUserProfile(user: {
  email: string;
  displayName?: string | null;
}): void {
  if (typeof window === "undefined") return;
  const email = user.email.trim();
  const displayName = formatDisplayName(user.displayName, email);
  const profile: ReturningUserProfile = {
    email,
    displayName,
    initials: initialsFromIdentity(email, displayName),
  };
  localStorage.setItem(RETURNING_USER_KEY, "1");
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
