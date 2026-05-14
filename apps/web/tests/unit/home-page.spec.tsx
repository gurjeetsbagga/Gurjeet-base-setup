import { describe, expect, it } from "vitest";
import HomePage from "@/app/page";
import { render, screen } from "../helpers/render";

describe("HomePage", () => {
  it("renders the Auryn heading", () => {
    render(<HomePage />);
    expect(screen.getByRole("heading", { level: 1, name: /auryn/i })).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    render(<HomePage />);
    expect(screen.getByText(/ai wellness companion/i)).toBeInTheDocument();
  });

  it("uses a main landmark", () => {
    render(<HomePage />);
    expect(screen.getByRole("main")).toBeInTheDocument();
  });
});
