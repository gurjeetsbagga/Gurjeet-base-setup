import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { AurynHomeDashboard } from "@/components/dashboard/auryn-home-dashboard";
import { mockDashboardHomeData } from "@/lib/dashboard/mock-data";

describe("AurynHomeDashboard", () => {
  it("renders hero, welcome card, active focus, and summary tiles", () => {
    render(<AurynHomeDashboard data={mockDashboardHomeData} />);

    expect(
      screen.getByRole("heading", { name: /your intelligent wellness companion/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/i remember\. i learn/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /^hey auryn$/i })).toBeInTheDocument();
    expect(screen.getByText(/recovery journey/i)).toBeInTheDocument();
    expect(screen.getByText(/on track/i)).toBeInTheDocument();
    expect(screen.getByText(/12 connected/i)).toBeInTheDocument();
    expect(screen.getByText(/23 memory threads/i)).toBeInTheDocument();
    expect(screen.getByText(/recovery protocol/i)).toBeInTheDocument();
  });
});
