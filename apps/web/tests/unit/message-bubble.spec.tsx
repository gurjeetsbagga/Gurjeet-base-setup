import { describe, expect, it } from "vitest";
import { MessageBubble } from "@/components/chat/message-bubble";
import { render, screen } from "../helpers/render";

describe("MessageBubble", () => {
  it("renders user message content", () => {
    render(<MessageBubble message={{ id: "1", role: "USER", content: "Hello Auryn" }} />);
    expect(screen.getByText("Hello Auryn")).toBeInTheDocument();
  });

  it("renders system disclaimer style", () => {
    render(
      <MessageBubble
        message={{
          id: "2",
          role: "SYSTEM",
          content: "Wellness guidance only.",
        }}
      />,
    );
    expect(screen.getByRole("note")).toHaveTextContent("Wellness guidance only.");
  });

  it("renders assistant message", () => {
    render(
      <MessageBubble message={{ id: "3", role: "ASSISTANT", content: "I am here to listen." }} />,
    );
    expect(screen.getByText(/here to listen/i)).toBeInTheDocument();
  });
});
