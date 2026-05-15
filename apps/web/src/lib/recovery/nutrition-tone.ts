import type { NutritionBarTone } from "./types";

export const nutritionBarToneStyles: Record<NutritionBarTone, { bar: string }> = {
  neutral: { bar: "bg-muted-foreground/40" },
  good: { bar: "bg-dashboard-brand" },
  warning: { bar: "bg-warning" },
};
