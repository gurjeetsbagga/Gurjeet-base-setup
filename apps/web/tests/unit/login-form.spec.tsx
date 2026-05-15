import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { render, screen } from "../helpers/render";

describe("LoginForm", () => {
  it("renders Figma-aligned login UI", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /log in to your account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /log in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sign up here/i })).toHaveAttribute("href", "/signup");
  });

  it("submits with valid credentials", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@auryn.dev");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "password123");
    await user.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@auryn.dev",
      password: "password123",
    });
  });

  it("validates short password", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/enter your email/i), "user@auryn.dev");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "short");
    await user.click(screen.getByRole("button", { name: /^log in$/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/8 characters/i);
  });
});
