/** @vitest-environment jsdom */

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardNavigation } from "./useDashboardNavigation";
import { dashboardStorageKeys } from "./storage";

const buildWrapper = (initialEntry: string) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
    );
  };
};

const baseArgs = () => ({
  preloadSearchPopup: vi.fn(),
  preloadCreateProjectPopup: vi.fn(),
  preloadCreateWorkspacePopup: vi.fn(),
  preloadSettingsPopup: vi.fn(),
});

const storageState = new Map<string, string>();

const localStorageMock = {
  getItem: (key: string) =>
    storageState.has(key) ? storageState.get(key)! : null,
  setItem: (key: string, value: string) => {
    storageState.set(key, value);
  },
  removeItem: (key: string) => {
    storageState.delete(key);
  },
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  configurable: true,
});

describe("useDashboardNavigation", () => {
  beforeEach(() => {
    storageState.clear();
  });

  test("initializes active workspace slug from query param before localStorage", () => {
    window.localStorage.setItem(
      dashboardStorageKeys.current,
      JSON.stringify({ version: 1, activeWorkspaceSlug: "stored-workspace" }),
    );
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks?workspace=query-workspace"),
    });

    expect(result.current.activeWorkspaceSlug).toBe("query-workspace");
  });

  test("initializes active workspace slug from localStorage when query param is absent", () => {
    window.localStorage.setItem(
      dashboardStorageKeys.current,
      JSON.stringify({ version: 1, activeWorkspaceSlug: "stored-workspace" }),
    );
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks"),
    });

    expect(result.current.activeWorkspaceSlug).toBe("stored-workspace");
  });

  test("migrates legacy workspace storage value into versioned storage", () => {
    window.localStorage.setItem(
      dashboardStorageKeys.legacy,
      "legacy-workspace",
    );
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks"),
    });

    expect(result.current.activeWorkspaceSlug).toBe("legacy-workspace");
    expect(window.localStorage.getItem(dashboardStorageKeys.legacy)).toBeNull();
    expect(window.localStorage.getItem(dashboardStorageKeys.current)).toBe(
      JSON.stringify({ version: 1, activeWorkspaceSlug: "legacy-workspace" }),
    );
  });

  test("derives currentView/settingsTab from settings route with from param", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/settings?tab=Notifications&from=/archive"),
    });

    expect(result.current.isSettingsOpen).toBe(true);
    expect(result.current.settingsTab).toBe("Notifications");
    expect(result.current.currentView).toBe("archive");
  });

  test("parses /activities as activities current view", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/activities"),
    });

    expect(result.current.currentView).toBe("activities");
    expect(result.current.isSettingsOpen).toBe(false);
  });

  test("opens search and create dialogs while preloading modules", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks"),
    });

    act(() => {
      result.current.openSearch();
      result.current.openCreateProject();
      result.current.openCreateWorkspace();
    });

    expect(args.preloadSearchPopup).toHaveBeenCalledTimes(1);
    expect(args.preloadCreateProjectPopup).toHaveBeenCalledTimes(1);
    expect(args.preloadCreateWorkspacePopup).toHaveBeenCalledTimes(1);
    expect(result.current.isSearchOpen).toBe(true);
    expect(result.current.isCreateProjectOpen).toBe(true);
    expect(result.current.isCreateWorkspaceOpen).toBe(true);
  });

  test("opens inbox and closes it when navigating views", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks"),
    });

    act(() => {
      result.current.openInbox();
    });

    expect(result.current.isInboxOpen).toBe(true);

    act(() => {
      result.current.navigateView("archive");
    });

    await waitFor(() => {
      expect(result.current.currentView).toBe("archive");
      expect(result.current.isInboxOpen).toBe(false);
    });
  });

  test("preserves inbox state when navigating views via navigateViewPreservingInbox", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks"),
    });

    act(() => {
      result.current.openInbox();
    });

    expect(result.current.isInboxOpen).toBe(true);

    act(() => {
      result.current.navigateViewPreservingInbox("archive");
    });

    await waitFor(() => {
      expect(result.current.currentView).toBe("archive");
      expect(result.current.isInboxOpen).toBe(true);
    });
  });

  test("navigates to settings and back to protected route", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks"),
    });

    act(() => {
      result.current.handleOpenSettings("Company");
    });

    await waitFor(() => {
      expect(result.current.isSettingsOpen).toBe(true);
    });

    expect(args.preloadSettingsPopup).toHaveBeenCalledTimes(1);
    expect(result.current.settingsTab).toBe("Company");
    expect(result.current.searchParams.get("from")).toBe("/tasks");

    act(() => {
      result.current.handleCloseSettings();
    });

    await waitFor(() => {
      expect(result.current.isSettingsOpen).toBe(false);
      expect(result.current.currentView).toBe("tasks");
    });
  });

  test("parses settings focus target query params", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper(
        "/settings?tab=Company&from=/tasks&focusKind=member&focusUserId=user-2&focusEmail=member%40example.com",
      ),
    });

    expect(result.current.settingsFocusTarget).toEqual({
      kind: "member",
      userId: "user-2",
      email: "member@example.com",
    });
  });

  test("writes settings focus target params when opening settings with focus", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/tasks"),
    });

    act(() => {
      result.current.handleOpenSettingsWithFocus({
        tab: "Company",
        focus: { kind: "brandAsset", assetName: "Logo Kit.zip" },
      });
    });

    await waitFor(() => {
      expect(result.current.isSettingsOpen).toBe(true);
    });

    expect(result.current.settingsTab).toBe("Company");
    expect(result.current.searchParams.get("from")).toBe("/tasks");
    expect(result.current.searchParams.get("focusKind")).toBe("brandAsset");
    expect(result.current.searchParams.get("focusAssetName")).toBe(
      "Logo Kit.zip",
    );
  });

  test("keeps key navigation callbacks stable across rerenders", () => {
    const args = baseArgs();

    const { result, rerender } = renderHook(
      () => useDashboardNavigation(args),
      {
        wrapper: buildWrapper("/tasks"),
      },
    );

    const initialNavigateView = result.current.navigateView;
    const initialOpenSearch = result.current.openSearch;
    const initialHandleOpenSettings = result.current.handleOpenSettings;

    rerender();

    expect(result.current.navigateView).toBe(initialNavigateView);
    expect(result.current.openSearch).toBe(initialOpenSearch);
    expect(result.current.handleOpenSettings).toBe(initialHandleOpenSettings);
  });
});
