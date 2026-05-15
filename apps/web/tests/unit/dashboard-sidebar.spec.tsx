import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));
import { render, screen } from "../helpers/render";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";

describe("DashboardSidebar", () => {
  it("renders workspace navigation and active focus", () => {
    render(<DashboardSidebar activeFocus={mockDashboardHomeData.sidebarFocus} />);

    expect(screen.getByText(/hey auryn/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /health/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /private brain/i })).toHaveAttribute(
      "href",
      "/private-brain",
    );
    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByText(/recovery journey/i)).toBeInTheDocument();
  });
});
