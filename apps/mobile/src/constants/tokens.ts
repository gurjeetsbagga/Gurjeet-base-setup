/**
 * Auryn design tokens for React Native.
 *
 * Mirrors the semantic color system defined in the web app's
 * globals.css @theme block. Keep in sync when tokens change.
 */
export const colors = {
  primary: "#4F6D7A",
  primaryForeground: "#FFFFFF",
  secondary: "#7BA7BC",
  secondaryForeground: "#1A2B33",
  accent: "#A8D5BA",
  accentForeground: "#1A2B33",

  background: "#FAFBFC",
  foreground: "#1A2B33",
  surface: "#FFFFFF",
  surfaceForeground: "#1A2B33",
  muted: "#F1F5F9",
  mutedForeground: "#64748B",

  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",

  border: "#E2E8F0",
  ring: "#4F6D7A",
  input: "#E2E8F0",
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const radii = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

export const typography = {
  heading: {
    fontWeight: "600" as const,
    letterSpacing: -0.5,
  },
  body: {
    fontWeight: "400" as const,
    letterSpacing: 0,
  },
} as const;
