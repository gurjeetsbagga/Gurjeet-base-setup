import { describe, expect, it } from "vitest";
import { render, screen } from "../helpers/render";
import { MemoryThreadCard } from "@/components/private-brain/memory-thread-card";
import { mockPrivateBrainData } from "@/lib/private-brain/mock-data";

describe("MemoryThreadCard", () => {
  it("renders thread title and category metadata", () => {
    const thread = mockPrivateBrainData.threads[0]!;
    render(<MemoryThreadCard thread={thread} />);

    expect(screen.getByText(thread.title)).toBeInTheDocument();
    expect(screen.getByText(/goal/i)).toBeInTheDocument();
    expect(screen.getByText(/insights/i)).toBeInTheDocument();
  });
});
