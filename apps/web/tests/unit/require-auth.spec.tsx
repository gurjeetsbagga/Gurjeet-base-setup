import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, waitFor } from "../helpers/render";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
  usePathname: () => "/dashboard",
}));

const useAuthMock = vi.fn();

vi.mock("@/lib/auth/auth-provider", () => ({
  useAuth: () => useAuthMock(),
}));

import { RouteGuard } from "@/components/auth/route-guard";

describe("RouteGuard", () => {
  beforeEach(() => {
    replace.mockClear();
  });

  it("redirects to login when unauthenticated", async () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    });

    render(
      <RouteGuard>
        <p>Protected</p>
      </RouteGuard>,
    );

    await waitFor(() => {
      expect(replace).toHaveBeenCalledWith("/login?redirect=%2Fdashboard");
    });
  });

  it("renders children when authenticated", () => {
    useAuthMock.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    });

    const { getByText } = render(
      <RouteGuard>
        <p>Protected</p>
      </RouteGuard>,
    );

    expect(getByText("Protected")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });
});
