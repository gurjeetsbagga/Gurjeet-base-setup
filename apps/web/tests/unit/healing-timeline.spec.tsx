import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { HealingTimeline } from "@/components/recovery/healing-timeline";
import { mockPhysicianOsRecoveryData } from "@/lib/recovery/mock-data";

describe("HealingTimeline", () => {
  it("renders phases and estimated duration", () => {
    render(<HealingTimeline timeline={mockPhysicianOsRecoveryData.timeline} />);

    expect(screen.getByText(/expected healing time/i)).toBeInTheDocument();
    expect(screen.getByText(/6–9 months/i)).toBeInTheDocument();
    expect(screen.getByText("Phase 1")).toBeInTheDocument();
    expect(screen.getByText("Phase 4")).toBeInTheDocument();
  });
});
