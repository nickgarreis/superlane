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

  test("falls back to tasks current view for unknown paths", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/activities"),
    });

    expect(result.current.currentView).toBe("tasks");
    expect(result.current.isSettingsOpen).toBe(false);
  });

  test("falls back to tasks current view for non-dashboard paths", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/foo"),
    });

    expect(result.current.currentView).toBe("tasks");
    expect(result.current.isSettingsOpen).toBe(false);
  });

  test("derives drafts list state from /drafts route and keeps background current view from query", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/drafts?from=/archive"),
    });

    expect(result.current.currentView).toBe("archive");
    expect(result.current.isDraftPendingProjectsOpen).toBe(true);
    expect(result.current.draftPendingProjectDetailId).toBeNull();
    expect(result.current.draftPendingProjectDetailKind).toBe("draft");
  });

  test("derives pending detail state from /pending/:id route while preserving background", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/pending/review-1?from=/tasks"),
    });

    expect(result.current.currentView).toBe("tasks");
    expect(result.current.isDraftPendingProjectsOpen).toBe(true);
    expect(result.current.draftPendingProjectDetailId).toBe("review-1");
    expect(result.current.draftPendingProjectDetailKind).toBe("pending");
  });

  test("falls back to tasks as background for invalid draft/pending from query", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/drafts?from=/completed/completed-1"),
    });

    expect(result.current.currentView).toBe("tasks");
    expect(result.current.isDraftPendingProjectsOpen).toBe(true);
  });

  test("falls back to tasks as background for same-project draft/pending from query", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/drafts/draft-1?from=/project/draft-1"),
    });

    expect(result.current.currentView).toBe("tasks");
    expect(result.current.isDraftPendingProjectsOpen).toBe(true);
    expect(result.current.draftPendingProjectDetailId).toBe("draft-1");
  });

  test("derives completed list state and keeps background current view from query", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/completed?from=/archive"),
    });

    expect(result.current.isCompletedProjectsOpen).toBe(true);
    expect(result.current.completedProjectDetailId).toBeNull();
    expect(result.current.currentView).toBe("archive");
  });

  test("derives completed detail state and keeps project background from query", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/completed/completed-1?from=/project/active-1"),
    });

    expect(result.current.isCompletedProjectsOpen).toBe(true);
    expect(result.current.completedProjectDetailId).toBe("completed-1");
    expect(result.current.currentView).toBe("project:active-1");
  });

  test("falls back to tasks as background for invalid completed from query", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/completed/completed-1?from=/completed"),
    });

    expect(result.current.currentView).toBe("tasks");
    expect(result.current.isCompletedProjectsOpen).toBe(true);
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

  test("opens draft/pending list with preserved from path", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/project/active-1"),
    });

    act(() => {
      result.current.openDraftPendingProjectsPopup();
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/drafts");
      expect(result.current.searchParams.get("from")).toBe("/project/active-1");
      expect(result.current.currentView).toBe("project:active-1");
    });
  });

  test("no-ops when opening draft/pending list on same canonical route", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/drafts?from=%2Farchive"),
    });
    const initialLocationKey = result.current.location.key;

    act(() => {
      result.current.openDraftPendingProjectsPopup();
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/drafts");
      expect(result.current.searchParams.get("from")).toBe("/archive");
      expect(result.current.currentView).toBe("archive");
      expect(result.current.location.key).toBe(initialLocationKey);
    });
  });

  test("opens completed list route with preserved from path", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/project/active-1"),
    });

    act(() => {
      result.current.openCompletedProjectsPopup();
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/completed");
      expect(result.current.searchParams.get("from")).toBe("/project/active-1");
      expect(result.current.isCompletedProjectsOpen).toBe(true);
      expect(result.current.currentView).toBe("project:active-1");
    });
  });

  test("opens completed detail route with preserved from path", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/archive"),
    });

    act(() => {
      result.current.openCompletedProjectDetail("completed-1");
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/completed/completed-1");
      expect(result.current.searchParams.get("from")).toBe("/archive");
      expect(result.current.completedProjectDetailId).toBe("completed-1");
      expect(result.current.currentView).toBe("archive");
    });
  });

  test("backs from completed detail to completed list while preserving from query", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/completed/release-1?from=/archive"),
    });

    act(() => {
      result.current.backToCompletedProjectsList();
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/completed");
      expect(result.current.searchParams.get("from")).toBe("/archive");
      expect(result.current.completedProjectDetailId).toBeNull();
      expect(result.current.currentView).toBe("archive");
    });
  });

  test("closes completed routes back to from path and falls back to /tasks for invalid from", async () => {
    const args = baseArgs();

    const completedHook = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/completed?from=/archive"),
    });
    act(() => {
      completedHook.result.current.closeCompletedProjectsPopup();
    });
    await waitFor(() => {
      expect(completedHook.result.current.location.pathname).toBe("/archive");
      expect(completedHook.result.current.currentView).toBe("archive");
    });

    const invalidHook = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/completed?from=/completed/release-1"),
    });
    act(() => {
      invalidHook.result.current.closeCompletedProjectsPopup();
    });
    await waitFor(() => {
      expect(invalidHook.result.current.location.pathname).toBe("/tasks");
      expect(invalidHook.result.current.currentView).toBe("tasks");
    });
  });

  test("closes draft/pending popup back to origin from from-query", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/drafts?from=/archive"),
    });

    act(() => {
      result.current.closeDraftPendingProjectsPopup();
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/archive");
      expect(result.current.currentView).toBe("archive");
    });
  });

  test("opens status-aware draft/pending detail route and keeps from query", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/drafts?from=/archive"),
    });

    act(() => {
      result.current.openDraftPendingProjectDetail("review-1", "Review");
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/pending/review-1");
      expect(result.current.searchParams.get("from")).toBe("/archive");
      expect(result.current.draftPendingProjectDetailKind).toBe("pending");
      expect(result.current.draftPendingProjectDetailId).toBe("review-1");
      expect(result.current.currentView).toBe("archive");
    });
  });

  test("normalizes invalid explicit from when opening draft/pending detail", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/archive"),
    });

    act(() => {
      result.current.openDraftPendingProjectDetail("draft-1", "Draft", {
        from: "/project/draft-1",
      });
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/drafts/draft-1");
      expect(result.current.searchParams.get("from")).toBe("/tasks");
      expect(result.current.currentView).toBe("tasks");
    });
  });

  test("backs from pending detail to pending list while preserving from query", async () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/pending/review-1?from=/tasks"),
    });

    act(() => {
      result.current.backToDraftPendingProjectsList();
    });

    await waitFor(() => {
      expect(result.current.location.pathname).toBe("/pending");
      expect(result.current.searchParams.get("from")).toBe("/tasks");
      expect(result.current.draftPendingProjectDetailId).toBeNull();
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
