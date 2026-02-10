/** @vitest-environment jsdom */

import React from "react";
import { act, renderHook, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, test, vi } from "vitest";
import { useDashboardNavigation } from "./useDashboardNavigation";

const buildWrapper = (initialEntry: string) => {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>;
  };
};

const baseArgs = () => ({
  preloadSearchPopup: vi.fn(),
  preloadCreateProjectPopup: vi.fn(),
  preloadCreateWorkspacePopup: vi.fn(),
  preloadSettingsPopup: vi.fn(),
});

describe("useDashboardNavigation", () => {
  test("derives currentView/settingsTab from settings route with from param", () => {
    const args = baseArgs();

    const { result } = renderHook(() => useDashboardNavigation(args), {
      wrapper: buildWrapper("/settings?tab=Notifications&from=/archive"),
    });

    expect(result.current.isSettingsOpen).toBe(true);
    expect(result.current.settingsTab).toBe("Notifications");
    expect(result.current.currentView).toBe("archive");
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
});
