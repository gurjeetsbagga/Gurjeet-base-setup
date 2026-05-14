import { test, expect } from "./helpers/fixtures";

test.describe("API health check", () => {
  test("liveness endpoint returns healthy", async ({ request, apiURL }) => {
    const res = await request.get(`${apiURL}/health`);
    expect(res.ok()).toBe(true);

    const body = await res.json();
    expect(body.status).toBe("healthy");
    expect(body.service).toBe("auryn-api");
  });

  test("readiness endpoint returns checks array", async ({ request, apiURL }) => {
    const res = await request.get(`${apiURL}/health/ready`);

    const body = await res.json();
    expect(body.checks).toBeDefined();
    expect(Array.isArray(body.checks)).toBe(true);
  });
});
