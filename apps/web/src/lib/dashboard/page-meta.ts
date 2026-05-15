import { mockDashboardHomeData } from "./mock-data";

export interface DashboardPageMeta {
  breadcrumb: string;
}

const PAGE_META: Record<string, DashboardPageMeta> = {
  "/dashboard": { breadcrumb: mockDashboardHomeData.breadcrumb },
  "/private-brain": { breadcrumb: "WEB VIEW 01 / PRIVATE BRAIN" },
  "/recovery": { breadcrumb: "WEB VIEW 04 / PHYSICIANOS RECOVERY" },
  "/plan": { breadcrumb: "WEB VIEW 07 / EXPLORE AND PERSONALIZE" },
  "/settings": { breadcrumb: "WEB VIEW 08 / PROFILE & SETTINGS" },
};

export function getDashboardPageMeta(pathname: string): DashboardPageMeta {
  if (PAGE_META[pathname]) return PAGE_META[pathname]!;
  if (pathname.startsWith("/dashboard/health")) {
    return { breadcrumb: "WEB VIEW 01 / HEALTH DASHBOARD" };
  }
  return PAGE_META["/dashboard"]!;
}
