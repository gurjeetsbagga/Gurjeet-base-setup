import type { HealthMetric, MetricStatus } from "@/lib/dashboard/types";

export type RecoveryFocusStatus = "on_track" | "caution" | "delayed" | "completed";

export type HealingPhaseStatus = "completed" | "current" | "upcoming";

export type NutritionBarTone = "neutral" | "good" | "warning";

export interface RecoveryProtocolSummary {
  title: string;
  subtitle: string;
  progressPercent: number;
}

export interface RecoveryFocusState {
  phaseLabel: string;
  status: RecoveryFocusStatus;
  statusLabel: string;
}

export interface HealingPhase {
  id: string;
  label: string;
  status: HealingPhaseStatus;
}

export interface HealingTimelineData {
  title: string;
  estimatedDuration: string;
  phases: HealingPhase[];
}

export interface NutritionMetric {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: string;
  tone: NutritionBarTone;
}

export interface NutritionOverviewData {
  title: string;
  metrics: NutritionMetric[];
}

export interface RecoveryPlanCta {
  title: string;
  subtitle: string;
  href: string;
}

export interface PlanEssential {
  id: string;
  label: string;
  icon: string;
}

export interface PhysicianOsRecoveryData {
  focus: RecoveryFocusState;
  protocol: RecoveryProtocolSummary;
  timeline: HealingTimelineData;
  nutrition: NutritionOverviewData;
  metrics: HealthMetric[];
  planCta: RecoveryPlanCta;
  essentials: PlanEssential[];
}

export type { HealthMetric, MetricStatus };
