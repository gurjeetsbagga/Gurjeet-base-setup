import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../helpers/render";

vi.mock("@/components/chat/chat-explore-layout", () => ({
  ChatExploreLayout: () => <div data-testid="chat-home">Chat home</div>,
}));

vi.mock("@/lib/auth/auth-provider", () => ({
  useAuth: () => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  }),
}));

import HomePage from "@/app/page";

describe("HomePage", () => {
  it("renders chat as the home experience", () => {
    render(<HomePage />);
    expect(screen.getByTestId("chat-home")).toBeInTheDocument();
  });
});
