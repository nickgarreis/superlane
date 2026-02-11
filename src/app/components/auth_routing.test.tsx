/** @vitest-environment jsdom */

import React from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { AuthCallbackPage, sanitizeReturnTo } from "./AuthCallbackPage";
import { ensureSafeReturnTo } from "./AuthPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { RootPage } from "./RootPage";
import {
  clearStoredAuthMode,
  clearStoredReturnTo,
  storeAuthMode,
  storeReturnTo,
} from "../lib/authReturnTo";

const { mockUseConvexAuth } = vi.hoisted(() => ({
  mockUseConvexAuth: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useConvexAuth: mockUseConvexAuth,
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</div>
  );
}

describe("auth + protected routing behavior", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockUseConvexAuth.mockReset();
    clearStoredAuthMode();
    clearStoredReturnTo();
    window.sessionStorage.clear();
  });

  test("redirects unauthenticated protected route to login with encoded returnTo", async () => {
    mockUseConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={["/tasks?filter=mine#focus"]}>
        <Routes>
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/login?returnTo=%2Ftasks%3Ffilter%3Dmine%23focus",
      );
    });
  });

  test("renders protected content when authenticated", () => {
    mockUseConvexAuth.mockReturnValue({
      isAuthenticated: true,
      isLoading: false,
    } as any);

    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <Routes>
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Protected content")).toBeInTheDocument();
  });

  test("shows loading state while auth is resolving", () => {
    mockUseConvexAuth.mockReturnValue({
      isAuthenticated: false,
      isLoading: true,
    } as any);

    render(
      <MemoryRouter initialEntries={["/tasks"]}>
        <Routes>
          <Route
            path="/tasks"
            element={
              <ProtectedRoute>
                <div>Protected content</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Checking authentication...")).toBeInTheDocument();
  });

  test("sanitizes invalid returnTo values for auth page and callback", () => {
    expect(ensureSafeReturnTo("/tasks", "/fallback")).toBe("/tasks");
    expect(ensureSafeReturnTo("//evil.test/pwn", "/fallback")).toBe(
      "/fallback",
    );
    expect(ensureSafeReturnTo("https://evil.test/pwn", "/fallback")).toBe(
      "/fallback",
    );
    expect(ensureSafeReturnTo("/tasks\u0000", "/fallback")).toBe("/fallback");

    expect(sanitizeReturnTo("https://evil.test/steal", "/fallback")).toBe(
      "/fallback",
    );
    expect(sanitizeReturnTo("  //evil.test/path  ", "/fallback")).toBe(
      "/fallback",
    );
    expect(
      sanitizeReturnTo(
        `${window.location.origin}/archive?tab=all#top`,
        "/fallback",
      ),
    ).toBe("/archive?tab=all#top");
  });

  test("auth callback without code routes safely using stored returnTo and mode", async () => {
    storeReturnTo("/project/alpha");
    storeAuthMode("signup");

    render(
      <MemoryRouter initialEntries={["/auth/callback?error=access_denied"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/login" element={<LocationProbe />} />
          <Route path="/signup" element={<LocationProbe />} />
          <Route path="/tasks" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/signup?returnTo=%2Fproject%2Falpha&error=access_denied",
      );
    });
  });

  test("auth callback falls back to /tasks when stored returnTo is unsafe", async () => {
    window.sessionStorage.setItem(
      "builddesign.auth.returnTo",
      "https://evil.test/steal",
    );

    render(
      <MemoryRouter initialEntries={["/auth/callback"]}>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route path="/login" element={<LocationProbe />} />
          <Route path="/signup" element={<LocationProbe />} />
          <Route path="/tasks" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/login?returnTo=%2Ftasks",
      );
    });
  });

  test("root route redirects unauthenticated users to login", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<RootPage isAuthenticated={false} />} />
          <Route path="/login" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/login?returnTo=%2Ftasks",
      );
    });
  });

  test("root route redirects authenticated users to tasks", async () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<RootPage isAuthenticated />} />
          <Route path="/tasks" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe("/tasks");
    });
  });

  test("root route forwards callback code to /auth/callback", async () => {
    render(
      <MemoryRouter initialEntries={["/?code=abc&state=123"]}>
        <Routes>
          <Route path="/" element={<RootPage isAuthenticated={false} />} />
          <Route path="/auth/callback" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/auth/callback?code=abc&state=123",
      );
    });
  });

  test("root route sends oauth errors to the attempted auth mode", async () => {
    storeReturnTo("/archive");
    storeAuthMode("signup");

    render(
      <MemoryRouter initialEntries={["/?error=access_denied"]}>
        <Routes>
          <Route path="/" element={<RootPage isAuthenticated={false} />} />
          <Route path="/signup" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("location").textContent).toBe(
        "/signup?returnTo=%2Farchive&error=access_denied",
      );
    });
  });
});
