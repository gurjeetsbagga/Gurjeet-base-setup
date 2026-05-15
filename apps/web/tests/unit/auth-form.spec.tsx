import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { AuthForm } from "@/components/auth/auth-form";
import { render, screen } from "../helpers/render";

describe("AuthForm", () => {
  it("renders login fields", () => {
    render(<AuthForm mode="login" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("renders signup name field", () => {
    render(<AuthForm mode="signup" onSubmit={vi.fn()} />);
    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
  });

  it("submits login with valid password", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<AuthForm mode="login" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "user@auryn.dev");
    await user.type(screen.getByLabelText(/password/i), "securepass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@auryn.dev",
      password: "securepass",
    });
  });

  it("validates short password on signup", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<AuthForm mode="signup" onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), "test@auryn.dev");
    await user.type(screen.getByLabelText(/^password$/i), "short");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(screen.getByRole("alert")).toHaveTextContent(/8 characters/i);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
