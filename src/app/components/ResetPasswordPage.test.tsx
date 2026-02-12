/** @vitest-environment jsdom */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ResetPasswordPage } from "./ResetPasswordPage";

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock("@workos-inc/authkit-react", () => ({
  useAuth: (...args: unknown[]) => mockUseAuth(...args),
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}`}</div>
  );
}

describe("ResetPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("auto-starts WorkOS password reset handoff when token exists", async () => {
    const signIn = vi.fn().mockResolvedValue(undefined);
    mockUseAuth.mockReturnValue({
      signIn,
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter
        initialEntries={[
          "/reset-password?token=reset-token-123&returnTo=%2Fsettings%3Ftab%3DAccount",
        ]}
      >
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith(
        expect.objectContaining({
          passwordResetToken: "reset-token-123",
          state: expect.objectContaining({
            returnTo: "/settings?tab=Account",
          }),
        }),
      );
    });
  });

  test("shows invalid-link state when token is missing", () => {
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      isLoading: false,
      user: null,
    });

    render(
      <MemoryRouter initialEntries={["/reset-password?returnTo=%2Ftasks"]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Invalid password reset link" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to sign in" })).toHaveAttribute(
      "href",
      "/login?returnTo=%2Ftasks",
    );
  });

  test("redirects authenticated users to returnTo", async () => {
    mockUseAuth.mockReturnValue({
      signIn: vi.fn(),
      isLoading: false,
      user: { id: "user-1" },
    });

    render(
      <MemoryRouter
        initialEntries={[
          "/reset-password?token=reset-token-123&returnTo=%2Farchive",
        ]}
      >
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/archive" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/archive");
    });
  });
});
