import { render, type RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";

interface WrapperProps {
  children: ReactNode;
}

/**
 * Extend this wrapper as providers are added (theme, auth, query client, etc.).
 */
function AllProviders({ children }: WrapperProps) {
  return <>{children}</>;
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

export { customRender as render };
export { screen, within, waitFor } from "@testing-library/react";
export { userEvent };
