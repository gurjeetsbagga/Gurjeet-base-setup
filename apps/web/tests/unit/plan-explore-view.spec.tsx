import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/plan",
}));

import { render, screen } from "../helpers/render";
import userEvent from "@testing-library/user-event";
import { PlanExploreView } from "@/components/plan/plan-explore-view";
import { mockPlanExploreData } from "@/lib/plan/mock-data";

describe("PlanExploreView", () => {
  it("renders chat, context panel, and quick actions", () => {
    render(<PlanExploreView data={mockPlanExploreData} />);

    expect(screen.getByTestId("plan-explore-chat")).toBeInTheDocument();
    expect(screen.getByText("Can diet help?")).toBeInTheDocument();
    expect(screen.getByText(/huge impact on your sleep quality/i)).toBeInTheDocument();
    expect(screen.getByText(/diet & sleep connection/i)).toBeInTheDocument();
    expect(screen.getByText(/best foods for sleep/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /7-day/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ask auryn anything/i)).toBeInTheDocument();
  });

  it("appends a user message when sending from inline composer", async () => {
    const user = userEvent.setup();
    render(<PlanExploreView data={mockPlanExploreData} />);

    await user.type(screen.getByLabelText(/ask auryn anything/i), "What about magnesium?");
    await user.click(screen.getByRole("button", { name: /send to auryn/i }));

    expect(screen.getByText("What about magnesium?")).toBeInTheDocument();
  });
});
