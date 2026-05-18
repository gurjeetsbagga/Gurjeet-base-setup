import { describe, expect, it, vi } from "vitest";
import { ChatView } from "@/components/chat/chat-view";
import { render, screen } from "../helpers/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/chat/conv-1",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/hooks/use-chat", () => ({
  useChat: () => ({
    messages: [{ id: "1", role: "ASSISTANT", content: "Hi" }],
    input: "",
    setInput: vi.fn(),
    sendMessage: vi.fn(),
    isSending: false,
    showTyping: false,
    isLoadingHistory: false,
    showWelcomeOnly: false,
    error: null,
    scrollRef: { current: null },
    activeConversationId: null,
  }),
}));

describe("Responsive layout", () => {
  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 800 },
  ] as const;

  for (const vp of viewports) {
    it(`renders chat shell at ${vp.name} width`, () => {
      Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: vp.width,
      });
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: vp.height,
      });
      window.dispatchEvent(new Event("resize"));

      render(<ChatView />);
      expect(screen.getByRole("log")).toBeVisible();
      expect(screen.getByLabelText(/ask auryn anything/i)).toBeVisible();
    });
  }
});
