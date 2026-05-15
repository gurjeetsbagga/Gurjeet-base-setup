import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

describe("AuthSplitLayout", () => {
  it("renders PhysicianOS branding and testimonial panel", () => {
    render(
      <AuthSplitLayout>
        <p>Form slot</p>
      </AuthSplitLayout>,
    );

    expect(screen.getByText("PhysicianOS")).toBeInTheDocument();
    expect(screen.getByText(/personalized recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/marcus a/i)).toBeInTheDocument();
    expect(screen.getByText("Form slot")).toBeInTheDocument();
  });
});
