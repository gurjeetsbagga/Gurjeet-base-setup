import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => "/plan",
}));

vi.mock("@/lib/api/conversations");

import { render, screen } from "../helpers/render";
import userEvent from "@testing-library/user-event";
import { PlanExploreView } from "@/components/plan/plan-explore-view";
import { mockPlanExploreData } from "@/lib/plan/mock-data";
import * as conversationsApi from "@/lib/api/conversations";
import {
  mockAuthenticated,
  mockUnauthenticated,
  restoreSessionMocks,
} from "../helpers/mock-session";

describe("PlanExploreView", () => {
  it("renders chat, context panel, and quick actions", () => {
    mockUnauthenticated();
    render(<PlanExploreView data={mockPlanExploreData} />);

    expect(screen.getByTestId("plan-explore-chat")).toBeInTheDocument();
    expect(screen.getByText(/ask me anything about your wellness/i)).toBeInTheDocument();
    expect(screen.getByText(/diet & sleep connection/i)).toBeInTheDocument();
    expect(screen.getByText(/best foods for sleep/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /7-day/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/ask auryn anything/i)).toBeInTheDocument();
  });

  it("appends a user message when sending from inline composer", async () => {
    mockAuthenticated();
    vi.mocked(conversationsApi.createConversation).mockResolvedValue({
      id: "conv-plan-1",
      title: null,
      status: "ACTIVE",
      lastMessageAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    vi.mocked(conversationsApi.streamMessage).mockImplementation(async function* () {
      yield { type: "chunk" as const, delta: "Magnesium can help." };
      yield {
        type: "done" as const,
        message: {
          id: "msg-1",
          role: "ASSISTANT",
          status: "COMPLETED",
          content: "Magnesium can help.",
          tokenCount: 5,
          metadata: {},
          feedbackRating: null,
          createdAt: new Date().toISOString(),
        },
      };
    });

    const user = userEvent.setup();
    render(<PlanExploreView data={mockPlanExploreData} />);

    await user.type(screen.getByLabelText(/ask auryn anything/i), "What about magnesium?");
    await user.click(screen.getByRole("button", { name: /send to auryn/i }));

    expect(screen.getByText("What about magnesium?")).toBeInTheDocument();
    expect(conversationsApi.streamMessage).toHaveBeenCalledWith(
      "conv-plan-1",
      "What about magnesium?",
    );
    restoreSessionMocks();
  });
});
