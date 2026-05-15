import { test, expect } from "@playwright/test";

const apiURL = process.env.API_URL ?? "http://localhost:4000";

test.describe("API health (E2E)", () => {
  test("GET /health returns healthy", async ({ request }) => {
    const res = await request.get(`${apiURL}/health`);
    expect(res.ok()).toBeTruthy();
    const body = (await res.json()) as { status: string; service: string };
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("auryn-api");
  });

  test("GET /health/ready returns checks array", async ({ request }) => {
    const res = await request.get(`${apiURL}/health/ready`);
    const body = (await res.json()) as { checks: unknown[] };
    expect(Array.isArray(body.checks)).toBe(true);
  });
});
