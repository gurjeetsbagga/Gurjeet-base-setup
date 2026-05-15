import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const essentialPaths: Record<string, string> = {
  supplement: "M10 4.167v11.666M6.667 7.5h6.666M13.333 12.5H6.667",
  topicals: "M7.5 6.667h5v8.333h-5V6.667ZM10 4.167V6.667",
  garments: "M6.667 8.333 10 4.167l3.333 4.166V15H6.667V8.333Z",
  medication: "M12.5 7.5a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0ZM7.5 12.5h5v3.333h-5V12.5Z",
  exercises: "M4.167 14.167 7.5 10.833 10 13.333l2.5-2.5L15.833 14.167",
};

export function EssentialIcon({ name, ...props }: IconProps & { name: string }) {
  const d = essentialPaths[name] ?? essentialPaths.supplement;
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
