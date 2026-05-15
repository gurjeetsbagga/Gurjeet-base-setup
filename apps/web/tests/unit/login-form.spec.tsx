import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "@/components/auth/login-form";
import { render, screen } from "../helpers/render";

describe("LoginForm", () => {
  it("renders split-screen Figma-aligned login UI", () => {
    render(<LoginForm onSubmit={vi.fn()} />);
    expect(screen.getByRole("heading", { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByText(/sign in to continue your recovery journey/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/auryn@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /request access/i })).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  it("submits with valid credentials", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/auryn@example.com/i), "user@auryn.dev");
    await user.type(screen.getByPlaceholderText(/••••••••/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      email: "user@auryn.dev",
      password: "password123",
    });
  });

  it("validates short password", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByPlaceholderText(/auryn@example.com/i), "user@auryn.dev");
    await user.type(screen.getByPlaceholderText(/••••••••/i), "short");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(/8 characters/i);
  });
});
