/** @vitest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import App from "./App";

const { useConvexAuthMock } = vi.hoisted(() => ({
  useConvexAuthMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: (...args: unknown[]) => useConvexAuthMock(...args),
}));

vi.mock("./components/RootPage", () => ({
  RootPage: ({ isAuthenticated }: { isAuthenticated: boolean }) => (
    <div>root:{String(isAuthenticated)}</div>
  ),
}));

vi.mock("./components/AuthPage", () => ({
  AuthPage: ({ mode }: { mode: string }) => <div>auth:{mode}</div>,
}));

vi.mock("./components/AuthCallbackPage", () => ({
  AuthCallbackPage: () => <div>callback-page</div>,
}));

vi.mock("./components/ProtectedRoute", () => ({
  ProtectedRoute: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("./DashboardApp", () => ({
  default: () => <div>dashboard-app</div>,
}));

describe("App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useConvexAuthMock.mockReturnValue({ isAuthenticated: true });
  });

  test("renders root route with auth state", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("root:true")).toBeInTheDocument();
  });

  test("renders login route", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByText("auth:signin")).toBeInTheDocument();
  });
});
