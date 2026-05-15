import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { NutritionOverviewCard } from "@/components/recovery/nutrition-overview-card";
import { mockPhysicianOsRecoveryData } from "@/lib/recovery/mock-data";

describe("NutritionOverviewCard", () => {
  it("renders nutrition metrics with progress bars", () => {
    render(<NutritionOverviewCard nutrition={mockPhysicianOsRecoveryData.nutrition} />);

    expect(screen.getByText(/nutrition overview/i)).toBeInTheDocument();
    expect(screen.getByText(/calories/i)).toBeInTheDocument();
    expect(screen.getByText(/protein/i)).toBeInTheDocument();
    expect(screen.getByRole("progressbar", { name: /protein progress/i })).toBeInTheDocument();
  });
});
