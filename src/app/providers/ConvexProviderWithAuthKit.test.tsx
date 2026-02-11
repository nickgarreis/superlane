/** @vitest-environment jsdom */

import { render } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ConvexProviderWithAuthKit } from "./ConvexProviderWithAuthKit";

const { useAuthMock, getAccessTokenMock } = vi.hoisted(() => ({
  useAuthMock: vi.fn(),
  getAccessTokenMock: vi.fn(),
}));

let capturedAuth: {
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchAccessToken: (args?: {
    forceRefreshToken: boolean;
  }) => Promise<string | null>;
} | null = null;

vi.mock("@workos-inc/authkit-react", () => ({
  useAuth: (...args: unknown[]) => useAuthMock(...args),
}));

vi.mock("convex/react", () => ({
  ConvexProviderWithAuth: ({
    children,
    useAuth,
  }: {
    children: ReactNode;
    useAuth: () => {
      isLoading: boolean;
      isAuthenticated: boolean;
      fetchAccessToken: (args?: {
        forceRefreshToken: boolean;
      }) => Promise<string | null>;
    };
  }) => {
    capturedAuth = useAuth();
    return <div data-testid="convex-provider">{children}</div>;
  },
}));

describe("ConvexProviderWithAuthKit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedAuth = null;
    useAuthMock.mockReturnValue({
      isLoading: false,
      user: { id: "user-1" },
      getAccessToken: getAccessTokenMock,
    });
  });

  test("maps WorkOS auth state and fetches access token", async () => {
    getAccessTokenMock.mockResolvedValueOnce("token-123");

    render(
      <ConvexProviderWithAuthKit client={{} as any}>
        <div>child</div>
      </ConvexProviderWithAuthKit>,
    );

    expect(capturedAuth).not.toBeNull();
    expect(capturedAuth?.isLoading).toBe(false);
    expect(capturedAuth?.isAuthenticated).toBe(true);

    const token = await capturedAuth?.fetchAccessToken({
      forceRefreshToken: true,
    });
    expect(getAccessTokenMock).toHaveBeenCalledWith({ forceRefresh: true });
    expect(token).toBe("token-123");
  });

  test("returns null when token retrieval fails", async () => {
    getAccessTokenMock.mockRejectedValueOnce(new Error("token failed"));

    render(
      <ConvexProviderWithAuthKit client={{} as any}>
        <div>child</div>
      </ConvexProviderWithAuthKit>,
    );

    const token = await capturedAuth?.fetchAccessToken({
      forceRefreshToken: false,
    });
    expect(getAccessTokenMock).toHaveBeenCalledWith({ forceRefresh: false });
    expect(token).toBeNull();
  });
});
