import { describe, expect, it, vi, beforeEach } from "vitest";
import { LoginScreen } from "@/components/auth/login-screen";
import { saveReturningUserProfile } from "@/lib/auth/returning-user";
import { render, screen, waitFor } from "../helpers/render";

describe("LoginScreen", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows log in heading for new visitors", async () => {
    render(<LoginScreen onSubmit={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /log in to your account/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole("heading", { name: /^welcome back$/i })).not.toBeInTheDocument();
  });

  it("shows welcome back heading and saved name for returning users", async () => {
    saveReturningUserProfile({ email: "marcus@auryn.test", displayName: "Marcus A." });
    render(<LoginScreen onSubmit={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /^welcome back$/i })).toBeInTheDocument();
    });
    expect(screen.getByText("Marcus A.")).toBeInTheDocument();
    expect(screen.getByDisplayValue("marcus@auryn.test")).toBeInTheDocument();
  });
});
