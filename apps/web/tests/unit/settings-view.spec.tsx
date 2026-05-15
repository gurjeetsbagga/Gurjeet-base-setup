import { describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";
import { SettingsView } from "@/components/settings/settings-view";
import { mockSettingsPageData } from "@/lib/settings/mock-data";
import { render, screen } from "../helpers/render";

describe("SettingsView", () => {
  it("renders account and privacy sections", () => {
    render(<SettingsView data={mockSettingsPageData} />);

    expect(screen.getByRole("heading", { name: /^settings$/i })).toBeInTheDocument();
    expect(screen.getByText(/manage your account, privacy, and preferences/i)).toBeInTheDocument();
    expect(screen.getByTestId("account-management-card")).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveValue("Auryn MacMillan");
    expect(screen.getByLabelText(/email address/i)).toHaveValue("auryn@example.com");
    expect(screen.getByTestId("privacy-controls-card")).toBeInTheDocument();
    expect(screen.getByText(/share progress with care team/i)).toBeInTheDocument();
  });

  it("toggles privacy switch", async () => {
    const user = userEvent.setup();
    render(<SettingsView data={mockSettingsPageData} />);

    const careTeamSwitch = screen.getByRole("switch", { name: /share progress with care team/i });
    expect(careTeamSwitch).toHaveAttribute("aria-checked", "true");
    await user.click(careTeamSwitch);
    expect(careTeamSwitch).toHaveAttribute("aria-checked", "false");
  });
});
