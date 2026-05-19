import type { PhysicianOsRecoveryData } from "./types";

/** Mock PhysicianOS recovery view — replace with PhysicianOS API client */
export const mockPhysicianOsRecoveryData: PhysicianOsRecoveryData = {
  focus: {
    phaseLabel: "Phase 2",
    status: "on_track",
    statusLabel: "On track",
  },
  protocol: {
    title: "Recovery Protocol",
    subtitle: "ACL Reconstruction (Right Knee) — Phase 2 Strength & Mobility",
    progressPercent: 42,
  },
  timeline: {
    title: "Expected Healing Time",
    estimatedDuration: "6–9 Months",
    phases: [
      { id: "p1", label: "Phase 1", status: "completed" },
      { id: "p2", label: "Phase 2", status: "current" },
      { id: "p3", label: "Phase 3", status: "upcoming" },
      { id: "p4", label: "Phase 4", status: "upcoming" },
    ],
  },
  nutrition: {
    title: "Nutrition Overview",
    metrics: [
      { id: "calories", label: "Calories", current: 1820, target: 2000, unit: "", tone: "neutral" },
      { id: "protein", label: "Protein", current: 135, target: 150, unit: "g", tone: "good" },
      { id: "carbs", label: "Carbs", current: 165, target: 200, unit: "g", tone: "warning" },
    ],
  },
  metrics: [
    {
      id: "pain",
      label: "Pain Level",
      value: "2/10",
      statusLabel: "Mild",
      status: "success",
      progress: 20,
    },
    {
      id: "swelling",
      label: "Swelling",
      value: "1/10",
      statusLabel: "Low",
      status: "success",
      progress: 10,
    },
    {
      id: "stiffness",
      label: "Stiffness",
      value: "2/10",
      statusLabel: "Mild",
      status: "good",
      progress: 20,
    },
    {
      id: "hydration",
      label: "Hydration",
      value: "78%",
      statusLabel: "Good",
      status: "info",
      progress: 78,
    },
  ],
  planCta: {
    title: "View Plan",
    subtitle: "5 Essentials active",
    href: "/dashboard",
  },
  essentials: [
    { id: "supplement", label: "Supplement", icon: "supplement" },
    { id: "topicals", label: "Topicals", icon: "topicals" },
    { id: "garments", label: "Garments", icon: "garments" },
    { id: "medication", label: "Medication", icon: "medication" },
    { id: "exercises", label: "Exercises", icon: "exercises" },
  ],
};
