import { describe, expect, it, vi } from "vitest";
import { ChatInput } from "@/components/chat/chat-input";
import { render, screen } from "../helpers/render";

describe("ChatInput", () => {
  it("submits on button click", async () => {
    const onSend = vi.fn();
    const onChange = vi.fn();
    const { user } = render(<ChatInput value="Hello" onChange={onChange} onSend={onSend} />);

    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(onSend).toHaveBeenCalled();
  });

  it("does not send when disabled", async () => {
    const onSend = vi.fn();
    const { user } = render(
      <ChatInput value="Hello" onChange={vi.fn()} onSend={onSend} disabled />,
    );

    await user.click(screen.getByRole("button", { name: /send message/i }));
    expect(onSend).not.toHaveBeenCalled();
  });
});
