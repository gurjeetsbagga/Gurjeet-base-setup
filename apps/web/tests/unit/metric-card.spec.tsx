import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { MetricCard } from "@/components/dashboard/metric-card";

describe("MetricCard", () => {
  it("renders metric value and status", () => {
    render(
      <MetricCard
        metric={{
          id: "recovery",
          label: "Recovery",
          value: "82%",
          statusLabel: "On Track",
          status: "success",
          progress: 82,
        }}
      />,
    );

    expect(screen.getByText("Recovery")).toBeInTheDocument();
    expect(screen.getByText("82%")).toBeInTheDocument();
    expect(screen.getByText("On Track")).toBeInTheDocument();
  });
});
