import { describe, expect, it } from "vitest";
import { TypingIndicator } from "@/components/chat/typing-indicator";
import { render, screen } from "../helpers/render";

describe("TypingIndicator", () => {
  it("exposes accessible typing status", () => {
    render(<TypingIndicator />);
    expect(screen.getByRole("status", { name: /auryn is typing/i })).toBeInTheDocument();
  });
});
