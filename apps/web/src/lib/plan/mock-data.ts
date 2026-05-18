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
        id: "foods-limit",
        title: "Foods to limit",
        subtitle: "Caffeine, alcohol, sugar, spicy foods",
        tone: "coral",
      },
      {
        id: "timing",
        title: "Best time to eat",
        subtitle: "Timing your meals for better rest",
        tone: "green",
      },
      {
        id: "hydration",
        title: "Hydration",
        subtitle: "How much and when",
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
