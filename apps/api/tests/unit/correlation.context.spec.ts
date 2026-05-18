import { describe, expect, it } from "vitest";
import {
  createRequestCorrelation,
  patchCorrelationContext,
  runWithCorrelationContext,
  withCorrelationFields,
} from "@/common/logger/correlation.context";

describe("correlation.context", () => {
  it("propagates IDs within async local storage", () => {
    const ctx = createRequestCorrelation("req-1", "corr-1");

    runWithCorrelationContext(ctx, () => {
      patchCorrelationContext({
        orchestrationId: "orch-1",
        conversationId: "conv-1",
        userId: "user-1",
      });

      const merged = withCorrelationFields({ event: "test" });
      expect(merged).toMatchObject({
        requestId: "req-1",
        correlationId: "corr-1",
        orchestrationId: "orch-1",
        conversationId: "conv-1",
        userId: "user-1",
        event: "test",
      });
    });
  });

  it("returns fields unchanged outside request scope", () => {
    expect(withCorrelationFields({ a: 1 })).toEqual({ a: 1 });
  });
});
