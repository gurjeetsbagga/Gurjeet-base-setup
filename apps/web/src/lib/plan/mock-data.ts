import type { PlanExplorePageData } from "./types";

export const mockPlanExploreData: PlanExplorePageData = {
  messages: [
    { id: "m1", role: "user", content: "Can diet help?" },
    {
      id: "m2",
      role: "assistant",
      content:
        "Absolutely. What you eat and when you eat can have a huge impact on your sleep quality.",
    },
  ],
  context: {
    title: "Diet & Sleep Connection",
    items: [
      {
        id: "foods-sleep",
        title: "Best foods for sleep",
        subtitle: "Magnesium, tryptophan, complex carbs",
        tone: "blue",
      },
      {
        id: "timing",
        title: "Meal timing matters",
        subtitle: "Finish dinner 2–3 hours before bed",
        tone: "coral",
      },
      {
        id: "hydration",
        title: "Hydration balance",
        subtitle: "Earlier fluids, lighter evenings",
        tone: "green",
      },
      {
        id: "routine",
        title: "Evening wind-down",
        subtitle: "Gentle snacks, calm rituals",
        tone: "teal",
      },
    ],
    prompt: "Want meal ideas or examples?",
    quickActions: [
      { id: "meals", label: "Meal ideas", variant: "muted" },
      { id: "snacks", label: "Evening snacks", variant: "muted" },
      { id: "7day", label: "7-day", variant: "primary" },
    ],
  },
};
