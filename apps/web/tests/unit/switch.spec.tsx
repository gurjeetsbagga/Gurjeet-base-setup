import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { Switch } from "@/components/ui/switch";
import { render, screen } from "../helpers/render";

describe("Switch", () => {
  it("toggles via keyboard and click", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Switch checked={false} onCheckedChange={onChange} aria-label="Test toggle" />);

    const control = screen.getByRole("switch", { name: /test toggle/i });
    await user.click(control);
    expect(onChange).toHaveBeenCalledWith(true);
  });
});
