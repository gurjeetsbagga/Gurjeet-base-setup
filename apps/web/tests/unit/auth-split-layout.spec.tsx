import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

describe("AuthSplitLayout", () => {
  it("renders branding without user footer by default", () => {
    render(
      <AuthSplitLayout>
        <p>Form slot</p>
      </AuthSplitLayout>,
    );

    expect(screen.getByText("Auryn")).toBeInTheDocument();
    expect(screen.getByText(/personalized recovery/i)).toBeInTheDocument();
    expect(screen.queryByText(/marcus a/i)).not.toBeInTheDocument();
    expect(screen.getByText("Form slot")).toBeInTheDocument();
  });

  it("shows returning user footer when profile is provided", () => {
    render(
      <AuthSplitLayout
        returningProfile={{
          email: "marcus@auryn.test",
          displayName: "Marcus A.",
          initials: "MA",
        }}
      >
        <p>Form slot</p>
      </AuthSplitLayout>,
    );

    expect(screen.getByText("Marcus A.")).toBeInTheDocument();
    expect(screen.getByText("MA")).toBeInTheDocument();
  });
});
