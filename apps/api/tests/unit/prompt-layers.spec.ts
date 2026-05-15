import { describe, expect, it } from "vitest";
import { COMPANY_GUARDRAILS_PROMPT } from "@/modules/ai/prompts/company-guardrails.prompt";
import { PROTOCOL_RULES_PROMPT } from "@/modules/ai/prompts/protocol-rules.prompt";
import { ESCALATION_RULES_PROMPT } from "@/modules/ai/prompts/escalation-rules.prompt";
import { DISCLAIMER_PROMPT } from "@/modules/ai/prompts/disclaimer.prompt";
import { EMERGENCY_ESCALATION_MESSAGE } from "@/modules/ai/guardrails/escalation-messages";

describe("Prompt layers", () => {
  it("includes company guardrails", () => {
    expect(COMPANY_GUARDRAILS_PROMPT).toMatch(/must never/i);
    expect(COMPANY_GUARDRAILS_PROMPT).toMatch(/Diagnose/i);
  });

  it("includes protocol and escalation rules", () => {
    expect(PROTOCOL_RULES_PROMPT).toMatch(/wellness/i);
    expect(ESCALATION_RULES_PROMPT).toMatch(/emergency/i);
  });

  it("includes disclaimer tone", () => {
    expect(DISCLAIMER_PROMPT).toMatch(/not medical advice|wellness/i);
  });

  it("defines emergency escalation copy", () => {
    expect(EMERGENCY_ESCALATION_MESSAGE).toMatch(/emergency|911|988/i);
  });
});
