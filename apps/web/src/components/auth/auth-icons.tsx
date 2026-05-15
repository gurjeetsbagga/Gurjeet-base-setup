import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/** Pulse line mark in header (Figma split login) */
export function PhysicianOsLogoIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <path
        d="M4 16h4l2-7 4 14 2-7h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** EKG-style mark in circle (legacy / compact) */
export function PhysicianOsMarkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 36 36" fill="none" aria-hidden {...props}>
      <circle cx="18" cy="18" r="18" className="fill-auth-brand-muted" />
      <path
        d="M8 18h3l1.5-5.5 3 11 1.5-5.5h3"
        className="stroke-auth-brand"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StarBadgeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden {...props}>
      <path
        d="M8 1.5 9.55 5.45 13.5 5.45 10.25 8.1 11.55 12.5 8 10.2 4.45 12.5 5.75 8.1 2.5 5.45 6.45 5.45 8 1.5Z"
        className="fill-auth-brand"
      />
    </svg>
  );
}

export function AurynMarkIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden {...props}>
      <circle cx="20" cy="20" r="20" className="fill-auth-brand" />
      <path
        d="M10 20h4l2-6 4 12 2-6h4"
        className="stroke-auth-brand-foreground"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M2.5 5.833 10 10.833l7.5-5M3.333 15h13.334c.92 0 1.666-.746 1.666-1.667V5.667c0-.92-.746-1.667-1.666-1.667H3.333c-.92 0-1.666.746-1.666 1.667v7.666c0 .921.746 1.667 1.666 1.667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M5.833 8.333V6.667a4.167 4.167 0 1 1 8.334 0v1.666M4.167 8.333h11.666c.92 0 1.667.746 1.667 1.667v6.667c0 .92-.746 1.666-1.667 1.666H4.167c-.92 0-1.667-.746-1.667-1.666v-6.667c0-.921.746-1.667 1.667-1.667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function EyeIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M1.667 10s3.333-5.833 8.333-5.833 8.333 5.833 8.333 5.833-3.333 5.833-8.333 5.833S1.667 10 1.667 10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function EyeOffIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M2.5 2.5 17.5 17.5M8.158 8.158A2.5 2.5 0 0 0 10 12.5c1.38 0 2.5-1.12 2.5-2.5 0-.392-.09-.762-.25-1.092M5.117 5.117C3.283 6.35 1.992 8.008 1.667 10c0 0 3.333 5.833 8.333 5.833 1.55 0 2.967-.458 4.183-1.242M12.725 12.725C11.55 13.45 10.05 13.833 8.333 13.833 3.333 13.833 0 8 0 8c.458-.8 1.2-1.55 2.117-2.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M4.167 10h11.666M11.667 5.833 16.667 10l-5 4.167"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function GoogleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" aria-hidden {...props}>
      <path
        fill="#4285F4"
        d="M18.8 10.2c0-.6-.1-1.2-.2-1.8H10v3.4h4.9c-.2 1.1-.9 2-1.9 2.6v2.1h3.1c1.8-1.7 2.8-4.1 2.8-7.3Z"
      />
      <path
        fill="#34A853"
        d="M10 18.3c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.7-1.7-5.5-4H1.3v2.5C2.9 16.4 6.2 18.3 10 18.3Z"
      />
      <path
        fill="#FBBC05"
        d="M4.5 11.4c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V5.1H1.3C.5 6.7 0 8.3 0 10s.5 3.3 1.3 4.9l3.2-2.5Z"
      />
      <path
        fill="#EA4335"
        d="M10 3.9c1.4 0 2.6.5 3.6 1.4l2.7-2.7C14.8 1 12.6 0 10 0 6.2 0 2.9 1.9 1.3 5.1l3.2 2.5C5.3 5.6 7.5 3.9 10 3.9Z"
      />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden {...props}>
      <path d="M14.94 10.63c.02 2.14 1.88 2.86 1.9 2.87-.02.06-.3 1.02-.98 2.02-.59.87-1.2 1.74-2.16 1.76-.94.02-1.24-.55-2.32-.55-1.08 0-1.42.53-2.32.57-.93.04-1.64-.92-2.23-1.79-1.2-1.74-2.12-4.9-1.32-7.05.39-1.05 1.1-1.72 1.97-1.74.92-.02 1.78.6 2.34.6.55 0 1.6-.75 2.7-.64.46.02 1.76.19 2.59 1.42-.07.04-1.55.9-1.53 2.69ZM12.28 3.17c.5-.6.84-1.44.75-2.27-.72.03-1.6.48-2.12 1.08-.46.53-.87 1.39-.76 2.21.8.06 1.62-.41 2.13-1.02Z" />
    </svg>
  );
}
