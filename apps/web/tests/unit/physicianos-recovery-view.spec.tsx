import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/recovery",
}));

import { render, screen } from "../helpers/render";
import { PhysicianOsRecoveryView } from "@/components/recovery/physicianos-recovery-view";
import { mockPhysicianOsRecoveryData } from "@/lib/recovery/mock-data";

describe("PhysicianOsRecoveryView", () => {
  it("renders recovery dashboard sections", () => {
    render(<PhysicianOsRecoveryView data={mockPhysicianOsRecoveryData} />);

    expect(screen.getByTestId("recovery-focus-badge")).toHaveTextContent(/phase 2/i);
    expect(screen.getByTestId("recovery-summary-card")).toBeInTheDocument();
    expect(screen.getByTestId("healing-timeline")).toBeInTheDocument();
    expect(screen.getByTestId("nutrition-overview-card")).toBeInTheDocument();
    expect(screen.getByText(/pain level/i)).toBeInTheDocument();
    expect(screen.getByText(/hydration/i)).toBeInTheDocument();
    expect(screen.getByTestId("recovery-plan-cta-card")).toBeInTheDocument();
    expect(screen.getByTestId("plan-essentials-section")).toBeInTheDocument();
    expect(screen.getByText(/supplement/i)).toBeInTheDocument();
  });
});
