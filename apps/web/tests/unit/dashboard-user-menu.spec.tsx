import { describe, expect, it, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { render, screen } from "../helpers/render";

const logout = vi.fn().mockResolvedValue(undefined);
const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/dashboard",
}));

vi.mock("@/lib/auth/auth-provider", () => ({
  useAuth: () => ({
    user: { id: "1", email: "marcus@auryn.test", displayName: "Marcus A." },
    logout,
  }),
}));

import { DashboardUserMenu } from "@/components/dashboard/dashboard-user-menu";

describe("DashboardUserMenu", () => {
  beforeEach(() => {
    logout.mockClear();
    replace.mockClear();
  });

  it("opens menu with profile and log out", async () => {
    const user = userEvent.setup();
    render(<DashboardUserMenu />);

    await user.click(screen.getByRole("button", { name: /open account menu/i }));

    expect(screen.getByRole("menu", { name: /account/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /profile/i })).toHaveAttribute("href", "/profile");
    expect(screen.getByRole("menuitem", { name: /log out/i })).toBeInTheDocument();
  });

  it("logs out and redirects to login", async () => {
    const user = userEvent.setup();
    render(<DashboardUserMenu />);

    await user.click(screen.getByRole("button", { name: /open account menu/i }));
    await user.click(screen.getByRole("menuitem", { name: /log out/i }));

    expect(logout).toHaveBeenCalled();
    expect(replace).toHaveBeenCalledWith("/login");
  });
});
