import { mockDashboardHomeData } from "./mock-data";

export interface DashboardPageMeta {
  breadcrumb: string;
}

const PAGE_META: Record<string, DashboardPageMeta> = {
  "/dashboard": { breadcrumb: mockDashboardHomeData.breadcrumb },
  "/private-brain": { breadcrumb: "" },
  "/recovery": { breadcrumb: "" },
  "/plan": { breadcrumb: "" },
  "/chat": { breadcrumb: "" },
  "/settings": { breadcrumb: "" },
};

export function getDashboardPageMeta(pathname: string): DashboardPageMeta {
  if (pathname.startsWith("/chat/")) {
    return PAGE_META["/chat"]!;
  }
  if (PAGE_META[pathname]) return PAGE_META[pathname]!;
  if (pathname.startsWith("/dashboard/health")) {
    return { breadcrumb: "" };
  }
  return PAGE_META["/dashboard"]!;
}
