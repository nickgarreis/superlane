/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { AuthPage } from "./AuthPage";

const { mockUseAuth, mockUseAction } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockUseAction: vi.fn(),
}));

vi.mock("@workos-inc/authkit-react", () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

vi.mock("convex/react", () => ({
  useAction: (...args: unknown[]) => mockUseAction(...args),
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

describe("AuthPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("redirects authenticated users away from login", async () => {
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      isLoading: false,
      user: { id: "user-1" },
    });
    mockUseAction.mockReturnValue(vi.fn());

    render(
      <MemoryRouter initialEntries={["/login?returnTo=%2Farchive"]}>
        <Routes>
          <Route path="/login" element={<AuthPage mode="signin" />} />
          <Route path="/archive" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/archive");
    });
  });

  test("redirects authenticated users away from signup", async () => {
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp: vi.fn(),
      isLoading: false,
      user: { id: "user-1" },
    });
    mockUseAction.mockReturnValue(vi.fn());

    render(
      <MemoryRouter initialEntries={["/signup?returnTo=%2Flogin%3Ffoo%3Dbar"]}>
        <Routes>
          <Route path="/signup" element={<AuthPage mode="signup" />} />
          <Route path="/tasks" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/tasks");
    });
  });

  test("submits forgot-password email from login form", async () => {
    const signIn = vi.fn();
    const requestPasswordReset = vi.fn().mockResolvedValue({ accepted: true });
    mockUseAuth.mockReturnValue({
      signIn,
      signUp: vi.fn(),
      isLoading: false,
      user: null,
    });
    mockUseAction.mockReturnValue(requestPasswordReset);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Routes>
          <Route path="/login" element={<AuthPage mode="signin" />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Forgot password?" }));
    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "OWNER@Example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Send password reset link" }),
    );

    await waitFor(() => {
      expect(requestPasswordReset).toHaveBeenCalledWith({
        source: "login",
        email: "owner@example.com",
      });
    });

    expect(
      screen.getByText("If an account exists for this email, a reset link has been sent."),
    ).toBeInTheDocument();
    expect(signIn).not.toHaveBeenCalled();
  });

  test("keeps signup auto-start behavior", async () => {
    const signUp = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      signUp,
      isLoading: false,
      user: null,
    });
    mockUseAction.mockReturnValue(vi.fn());

    render(
      <MemoryRouter initialEntries={["/signup"]}>
        <Routes>
          <Route path="/signup" element={<AuthPage mode="signup" />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith(
        expect.objectContaining({
          state: expect.objectContaining({ returnTo: "/tasks" }),
        }),
      );
    });
  });
});
