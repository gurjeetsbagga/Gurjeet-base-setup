import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import { render, screen } from "../helpers/render";

describe("HomePage", () => {
  it("renders the Auryn brand", () => {
    render(<HomePage />);
    expect(screen.getAllByText(/auryn/i).length).toBeGreaterThan(0);
  });

  it("renders primary CTA to chat", () => {
    render(<HomePage />);
    expect(screen.getByRole("link", { name: /start a conversation/i })).toHaveAttribute(
      "href",
      "/chat",
    );
  });

  it("uses a main landmark", () => {
    render(<HomePage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
