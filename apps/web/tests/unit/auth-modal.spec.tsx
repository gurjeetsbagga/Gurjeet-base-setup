import { describe, expect, it, vi } from "vitest";
import { render, screen } from "../helpers/render";
import { AuthModal } from "@/components/auth/auth-modal";
import { saveReturningUserProfile } from "@/lib/auth/returning-user";

vi.mock("@/lib/auth/auth-provider", () => ({
  useAuth: () => ({
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    user: null,
    isAuthenticated: false,
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

describe("AuthModal", () => {
  it("renders welcome back with saved account", () => {
    saveReturningUserProfile({ email: "gurjeet@example.com", displayName: "Gurjeet Singh" });

    render(<AuthModal open initialView="welcome-back" onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/choose an account to continue/i)).toBeInTheDocument();
    expect(screen.getByText("Gurjeet Singh")).toBeInTheDocument();
    expect(screen.getByText("gurjeet@example.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in to another account/i })).toBeInTheDocument();
  });

  it("renders log in or sign up hub", () => {
    render(<AuthModal open initialView="hub" onClose={vi.fn()} />);

    expect(screen.getByRole("heading", { name: /log in or sign up/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^continue$/i })).toBeInTheDocument();
  });
});
