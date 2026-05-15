import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/private-brain",
}));

import { render, screen, waitFor } from "../helpers/render";
import { PrivateBrainView } from "@/components/private-brain/private-brain-view";
import { mockPrivateBrainData } from "@/lib/private-brain/mock-data";

describe("PrivateBrainView", () => {
  it("renders page header, threads, insight, and tools", () => {
    render(<PrivateBrainView data={mockPrivateBrainData} />);

    expect(screen.getByRole("heading", { name: /private brain/i })).toBeInTheDocument();
    expect(screen.getByText(/your memory\. your truth/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/search your memories/i)).toBeInTheDocument();
    expect(screen.getByText(/your memory threads/i)).toBeInTheDocument();
    expect(screen.getByText(/your brain is always learning/i)).toBeInTheDocument();
    expect(screen.getByText(/memory tools/i)).toBeInTheDocument();
    expect(screen.getAllByTestId("memory-thread-card").length).toBeGreaterThan(0);
  });

  it("filters memory threads when searching", async () => {
    const user = userEvent.setup();
    render(<PrivateBrainView data={mockPrivateBrainData} />);

    await user.type(screen.getByLabelText(/search your memories/i), "Theresa");

    await waitFor(() => {
      expect(screen.getByText("Theresa")).toBeInTheDocument();
      expect(screen.queryByText("15lbs by July 15th")).not.toBeInTheDocument();
    });
  });
});
