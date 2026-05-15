/** Semantic health metric status — drives progress ring + label colors */
export type MetricStatus = "success" | "good" | "warning" | "alert" | "info";

export interface DashboardNavItem {
  id: string;
  label: string;
  href: string;
  icon: string;
}

export interface DashboardTab {
  id: string;
  label: string;
  href: string;
}

export interface DashboardHero {
  title: string;
  subtitle: string;
}

export interface WelcomeCardContent {
  brandName: string;
  tagline: string;
}

export interface ActiveFocusSummary {
  title: string;
  subtitle: string;
}

export interface ActiveFocusDetail {
  title: string;
  journeyTitle: string;
  statusLabel: string;
  phaseLabel: string;
  message: string;
}

export interface SummaryTile {
  id: string;
  title: string;
  subtitle: string;
  highlight: string;
  href?: string;
}

/** Primary /dashboard home view (Figma: Auryn Home) */
export interface DashboardHomeData {
  breadcrumb: string;
  hero: DashboardHero;
  welcome: WelcomeCardContent;
  activeFocus: ActiveFocusDetail;
  sidebarFocus: ActiveFocusSummary;
  tiles: SummaryTile[];
}

export interface PhysicianConnection {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  status: "connected" | "pending" | "disconnected";
}

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  statusLabel: string;
  status: MetricStatus;
  progress: number;
}

export interface AppCenterItem {
  id: string;
  label: string;
  active: boolean;
}

export interface DashboardCta {
  id: string;
  title: string;
  subtitle: string;
  actionLabel: string;
  href: string;
}

/** Optional health metrics view — for future /dashboard/health */
export interface DashboardHealthViewData {
  breadcrumb: string;
  physician: PhysicianConnection;
  metrics: HealthMetric[];
  appCenter: AppCenterItem[];
  cta: DashboardCta;
  sidebarFocus: ActiveFocusSummary;
}
