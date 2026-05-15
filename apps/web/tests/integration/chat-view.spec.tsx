import { describe, expect, it, vi } from "vitest";
import { ChatView } from "@/components/chat/chat-view";
import { render, screen } from "../helpers/render";

vi.mock("@/lib/hooks/use-chat", () => ({
  useChat: () => ({
    messages: [
      { id: "1", role: "ASSISTANT", content: "Welcome back." },
      { id: "2", role: "USER", content: "I walked today." },
    ],
    input: "",
    setInput: vi.fn(),
    sendMessage: vi.fn(),
    isSending: false,
    showTyping: true,
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
    expect(screen.getByLabelText(/message to auryn/i)).toBeInTheDocument();
  });
});
