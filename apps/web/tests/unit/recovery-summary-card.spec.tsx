import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { RecoverySummaryCard } from "@/components/recovery/recovery-summary-card";
import { mockPhysicianOsRecoveryData } from "@/lib/recovery/mock-data";

describe("RecoverySummaryCard", () => {
  it("renders protocol title, subtitle, and progress", () => {
    render(<RecoverySummaryCard protocol={mockPhysicianOsRecoveryData.protocol} />);

    expect(screen.getByText("PhysicianOS")).toBeInTheDocument();
    expect(screen.getByText(/acl reconstruction/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/42% complete/i)).toBeInTheDocument();
  });
});
