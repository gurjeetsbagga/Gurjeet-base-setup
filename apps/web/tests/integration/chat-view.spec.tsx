import { describe, expect, it, vi } from "vitest";
import { ChatView } from "@/components/chat/chat-view";
import { render, screen } from "../helpers/render";

vi.mock("next/navigation", () => ({
  usePathname: () => "/chat/conv-1",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/hooks/use-chat", () => ({
  useChat: () => ({
    messages: [
      { id: "1", role: "ASSISTANT", content: "Welcome to Auryn." },
      { id: "2", role: "USER", content: "I walked today." },
    ],
    input: "",
    setInput: vi.fn(),
    sendMessage: vi.fn(),
    isSending: false,
    showTyping: true,
    isLoadingHistory: false,
    showWelcomeOnly: false,
    error: null,
    scrollRef: { current: null },
    activeConversationId: "conv-1",
  }),
}));

describe("ChatView (integration)", () => {
  it("renders message log and typing indicator", () => {
    render(<ChatView conversationId="conv-1" />);
    expect(screen.getByRole("log")).toBeInTheDocument();
    expect(screen.getByText("I walked today.")).toBeInTheDocument();
    expect(screen.getByRole("status", { name: /auryn is typing/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ask auryn anything/i)).toBeInTheDocument();
    expect(screen.getByTestId("explore-context-panel")).toBeInTheDocument();
  });
});
