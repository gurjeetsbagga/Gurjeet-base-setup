import type { DashboardNavItem, DashboardTab } from "./types";

export const DASHBOARD_WORKSPACE_NAV: DashboardNavItem[] = [
  { id: "overview", label: "Overview", href: "/dashboard", icon: "overview" },
  { id: "health", label: "Health", href: "/dashboard/health", icon: "health" },
  { id: "private-brain", label: "Private Brain", href: "/private-brain", icon: "brain" },
  { id: "recovery", label: "Recovery", href: "/recovery", icon: "recovery" },
  { id: "plan", label: "Plan", href: "/plan", icon: "plan" },
  { id: "shop", label: "Shop", href: "/dashboard", icon: "shop" },
  { id: "settings", label: "Settings", href: "/settings", icon: "settings" },
];

export const DASHBOARD_TOP_TABS: DashboardTab[] = [
  { id: "dashboard", label: "Dashboard", href: "/dashboard" },
  { id: "private-brain", label: "Private Brain", href: "/private-brain" },
  { id: "plans", label: "Plans", href: "/plan" },
  { id: "messages", label: "Messages", href: "/chat" },
];

export const SIDEBAR_WIDTH = "var(--width-dashboard-sidebar)";
export const CONTEXT_PANEL_WIDTH = "var(--width-dashboard-context-panel)";
