import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/auth/auth-form";
import { render, screen } from "../helpers/render";

describe("Auth flows (integration)", () => {
  it("completes login submission with valid credentials", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "user@auryn.dev");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@auryn.dev",
      password: "password123",
    });
  });

  it("shows server error from parent", () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} error="Invalid credentials" />);
    expect(screen.getByRole("alert")).toHaveTextContent(/invalid credentials/i);
  });

  it("blocks login when password too short", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "user@auryn.dev");
    await user.type(screen.getByLabelText(/password/i), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
