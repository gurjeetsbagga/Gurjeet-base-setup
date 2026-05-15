export type ExploreTopicTone = "blue" | "coral" | "green" | "teal";

export type QuickActionVariant = "muted" | "primary";

export interface PlanChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface ExploreContextItem {
  id: string;
  title: string;
  subtitle: string;
  tone: ExploreTopicTone;
  href?: string;
}

export interface ExploreQuickAction {
  id: string;
  label: string;
  variant: QuickActionVariant;
}

export interface ExploreContextPanelData {
  title: string;
  items: ExploreContextItem[];
  prompt: string;
  quickActions: ExploreQuickAction[];
}

export interface PlanExplorePageData {
  messages: PlanChatMessage[];
  context: ExploreContextPanelData;
}
