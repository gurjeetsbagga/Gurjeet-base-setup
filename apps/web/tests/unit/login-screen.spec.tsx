import { describe, expect, it, vi, beforeEach } from "vitest";
import { LoginScreen } from "@/components/auth/login-screen";
import { saveReturningUserProfile } from "@/lib/auth/returning-user";
import { render, screen } from "../helpers/render";

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

describe("LoginScreen", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("shows log in or sign up hub for new visitors", () => {
    render(<LoginScreen />);
    expect(screen.getByRole("heading", { name: /log in or sign up/i })).toBeInTheDocument();
  });

  it("shows welcome back account picker for returning users", () => {
    saveReturningUserProfile({ email: "marcus@auryn.test", displayName: "Marcus A." });
    render(<LoginScreen />);
    expect(screen.getByRole("heading", { name: /^welcome back$/i })).toBeInTheDocument();
    expect(screen.getByText("Marcus A.")).toBeInTheDocument();
    expect(screen.getByText("marcus@auryn.test")).toBeInTheDocument();
  });
});
