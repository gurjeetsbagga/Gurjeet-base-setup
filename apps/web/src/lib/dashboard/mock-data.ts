import type { DashboardHealthViewData, DashboardHomeData } from "./types";

/** Mock home dashboard — replace with API hook when backend is ready */
export const mockDashboardHomeData: DashboardHomeData = {
  breadcrumb: "WEB VIEW 01 / AURYN HOME",
  hero: {
    title: "Your intelligent wellness companion",
    subtitle: "I remember. I learn. I support. So you can focus on you.",
  },
  welcome: {
    brandName: "Hey Auryn",
    tagline: "Your intelligent wellness companion",
  },
  activeFocus: {
    title: "Active Focus",
    journeyTitle: "Recovery Journey",
    statusLabel: "On Track",
    phaseLabel: "Phase 2 — Day 18 of 30",
    message: "You are making great progress. Shall we review your plan for today?",
  },
  sidebarFocus: {
    title: "Recovery Journey",
    subtitle: "Phase 2 — On track",
  },
  tiles: [
    {
      id: "apps",
      title: "Apps",
      subtitle: "Nutrition, sleep, activity, and recovery.",
      highlight: "12 connected",
      href: "/dashboard",
    },
    {
      id: "private-brain",
      title: "Private Brain",
      subtitle: "Your evolving context in one place.",
      highlight: "23 memory threads",
      href: "/private-brain",
    },
    {
      id: "physicianos",
      title: "PhysicianOS",
      subtitle: "ACL recovery · Phase 2",
      highlight: "Recovery protocol",
      href: "/recovery",
    },
  ],
};

/** Metrics-focused view data — for future health sub-route */
export const mockDashboardHealthViewData: DashboardHealthViewData = {
  breadcrumb: "WEB VIEW 01 / HEALTH DASHBOARD",
  physician: {
    id: "physicianos-1",
    name: "PhysicianOS",
    credentials: "Dr. Michael Anderson, MD",
    specialty: "Functional & Longevity Medicine",
    status: "connected",
  },
  metrics: [
    {
      id: "nutrition",
      label: "Nutrition Goal",
      value: "95%",
      statusLabel: "Good",
      status: "good",
      progress: 95,
    },
    {
      id: "workouts",
      label: "Workouts",
      value: "6/7",
      statusLabel: "Missed 1",
      status: "warning",
      progress: 86,
    },
    {
      id: "sleep",
      label: "Sleep Score",
      value: "68",
      statusLabel: "Below Normal",
      status: "alert",
      progress: 68,
    },
    {
      id: "recovery",
      label: "Recovery",
      value: "82%",
      statusLabel: "On Track",
      status: "success",
      progress: 82,
    },
  ],
  appCenter: [
    { id: "a1", label: "Nutrition", active: true },
    { id: "a2", label: "Movement", active: true },
    { id: "a3", label: "Sleep", active: false },
    { id: "a4", label: "Mind", active: true },
    { id: "a5", label: "Labs", active: false },
  ],
  cta: {
    id: "food-cta",
    title: "Auryn helps you buy the right food",
    subtitle: "Personalized. Researched. Proven.",
    actionLabel: "Shop food",
    href: "/dashboard",
  },
  sidebarFocus: {
    title: "Recovery Journey",
    subtitle: "Phase 2 — On track",
  },
};

/** @deprecated Use mockDashboardHomeData */
export const mockHealthDashboardData = mockDashboardHealthViewData;
