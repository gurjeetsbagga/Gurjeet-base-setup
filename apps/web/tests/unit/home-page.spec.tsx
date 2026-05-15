import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

import { redirect } from "next/navigation";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("redirects root to login", () => {
    HomePage();
    expect(redirect).toHaveBeenCalledWith("/login");
  });
});
