import type { UserRole, OnboardingStatus } from "@prisma/client";

/**
 * Application-layer user profile returned to clients.
 *
 * Intentionally separate from the Prisma `User` model so we control
 * which fields are exposed and can reshape without touching the DB schema.
 */
export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  displayName: string | null;
  avatarUrl: string | null;
  onboardingStatus: OnboardingStatus;
  preferences: UserPreferences;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Typed structure for the `preferences` JSON column.
 *
 * All fields are optional — preferences accumulate over time
 * as the user interacts with onboarding and settings.
 */
export interface UserPreferences {
  theme?: "light" | "dark" | "system";
  notifications?: {
    email?: boolean;
    push?: boolean;
    sms?: boolean;
  };
  language?: string;
  timezone?: string;
  units?: "metric" | "imperial";
}
