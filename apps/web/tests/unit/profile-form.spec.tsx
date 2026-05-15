import { describe, expect, it, vi } from "vitest";
import { ProfileForm } from "@/components/profile/profile-form";
import { render, screen } from "../helpers/render";
import type { UserProfile } from "@/lib/api/types";

const baseProfile: UserProfile = {
  firstName: "Alex",
  lastName: "River",
  phone: "",
  wellnessGoal: "Walk daily",
  recoveryCategory: "WELLNESS",
  activeProtocol: "",
  restrictionsAllergies: "",
  productPreferences: "",
  importantNotes: "Prefers morning check-ins",
};

describe("ProfileForm", () => {
  it("renders profile and memory fields", () => {
    render(<ProfileForm initial={baseProfile} onSave={vi.fn()} />);
    expect(screen.getByLabelText(/first name/i)).toHaveValue("Alex");
    expect(screen.getByLabelText(/important notes/i)).toHaveValue("Prefers morning check-ins");
    expect(screen.getByLabelText(/wellness goal/i)).toHaveValue("Walk daily");
  });

  it("submits updated profile", async () => {
    const onSave = vi.fn();
    const { user } = render(<ProfileForm initial={baseProfile} onSave={onSave} />);

    await user.clear(screen.getByLabelText(/wellness goal/i));
    await user.type(screen.getByLabelText(/wellness goal/i), "Gentle stretching");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ wellnessGoal: "Gentle stretching" }),
    );
    expect(screen.getByText(/saved/i)).toBeInTheDocument();
  });
});
