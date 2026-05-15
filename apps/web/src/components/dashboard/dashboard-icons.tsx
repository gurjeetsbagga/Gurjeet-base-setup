import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

export function AurynLogoMark(props: IconProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-hidden {...props}>
      <circle cx="16" cy="16" r="16" className="fill-dashboard-brand" />
      <path
        d="M8 16h3l1.5-5 3 10 1.5-5h3"
        className="stroke-white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M9.167 15.833a6.667 6.667 0 1 0 0-13.333 6.667 6.667 0 0 0 0 13.333ZM17.5 17.5l-3.333-3.333"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M10 4.167v11.666M4.167 10h11.666"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ArrowUpIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d="M10 15.833V4.167M5.833 8.333 10 4.167l4.167 4.166"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavIcon({ name, ...props }: IconProps & { name: string }) {
  const paths: Record<string, string> = {
    overview: "M3 10.833 10 4.167 17 10.833V16.667H3V10.833Z",
    health: "M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z M10 7.5v5l3.333 2",
    brain:
      "M10 3.333c-3.333 0-5 2.5-5 5.833 0 2.5 1.667 4.167 3.333 4.167-.833 1.667-1.666 3.333-1.666 5 2.5 0 4.167-1.25 5.834-3.334",
    recovery: "M4.167 14.167 10 8.333l3.333 3.334L15.833 9.167 17.5 10.833",
    plan: "M5 4.167h10v11.666H5V4.167ZM7.5 8.333h5",
    shop: "M4.167 6.667h11.666l1.667 8.333H2.5l1.667-8.333ZM7.5 15a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333Zm5 0a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333Z",
    settings:
      "M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3.824 12.5h1.01l.223.89a7.49 7.49 0 0 0 1.54 2.67l-.64.64 1.768 1.768.64-.64a7.49 7.49 0 0 0 2.67 1.54l.89.223v1.01h2.5v-1.01l.89-.223a7.49 7.49 0 0 0 2.67-1.54l.64.64 1.768-1.768-.64-.64a7.49 7.49 0 0 0 1.54-2.67l.223-.89h1.01v-2.5h-1.01l-.223-.89a7.49 7.49 0 0 0-1.54-2.67l.64-.64L15.32 4.32l-.64.64a7.49 7.49 0 0 0-2.67-1.54l-.89-.223V2.5h-2.5v1.01l-.89.223a7.49 7.49 0 0 0-2.67 1.54l-.64-.64L4.32 6.32l.64.64a7.49 7.49 0 0 0-1.54 2.67l-.223.89H3.824v2.5Z",
  };
  const d = paths[name] ?? paths.overview;
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden {...props}>
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
