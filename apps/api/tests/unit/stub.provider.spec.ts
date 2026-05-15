import { describe, expect, it } from "vitest";
import { StubAiProvider } from "@/modules/ai/providers/stub.provider";

describe("StubAiProvider", () => {
  const provider = new StubAiProvider();

  it("returns deterministic completion", async () => {
    const response = await provider.complete({
      messages: [{ role: "user", content: "Tell me about recovery plans" }],
      model: "gpt-4o",
      maxTokens: 100,
      temperature: 0.7,
      requestId: "req-1",
    });

    expect(response.content).toMatch(/recovery|stub/i);
    expect(response.model).toContain("stub/");
  });

  it("streams word-by-word deltas", async () => {
    const deltas: string[] = [];
    for await (const chunk of provider.stream({
      messages: [{ role: "user", content: "Hello wellness" }],
      model: "gpt-4o",
      maxTokens: 100,
      temperature: 0.7,
      requestId: "req-2",
    })) {
      if (!chunk.done) deltas.push(chunk.delta);
    }

    expect(deltas.join("")).toMatch(/wellness|health/i);
  });
});
