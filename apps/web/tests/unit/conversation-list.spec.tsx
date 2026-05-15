import { describe, expect, it, vi } from "vitest";
import { ConversationList } from "@/components/chat/conversation-list";
import { render, screen } from "../helpers/render";

describe("ConversationList", () => {
  it("renders empty state", () => {
    render(<ConversationList conversations={[]} activeId={null} onNewChat={vi.fn()} />);
    expect(screen.getByText(/no conversations yet/i)).toBeInTheDocument();
  });

  it("highlights active conversation and shows relative time", () => {
    render(
      <ConversationList
        conversations={[
          {
            id: "c1",
            title: "Recovery check-in",
            lastMessageAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]}
        activeId="c1"
        onNewChat={vi.fn()}
      />,
    );

    expect(screen.getByRole("link", { name: /recovery check-in/i })).toHaveAttribute(
      "href",
      "/chat/c1",
    );
    expect(screen.getByText(/just now/i)).toBeInTheDocument();
  });

  it("calls onNewChat when button clicked", async () => {
    const onNewChat = vi.fn();
    const { user } = render(
      <ConversationList conversations={[]} activeId={null} onNewChat={onNewChat} />,
    );

    await user.click(screen.getByRole("button", { name: /new conversation/i }));
    expect(onNewChat).toHaveBeenCalled();
  });
});
