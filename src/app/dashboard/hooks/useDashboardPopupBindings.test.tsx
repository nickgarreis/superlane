/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDashboardPopupBindings } from "./useDashboardPopupBindings";

describe("useDashboardPopupBindings", () => {
  test("maps viewer data and forwards popup intents", async () => {
    const setPendingHighlight = vi.fn();
    const openSettings = vi.fn();
    const preloadSearchPopupModule = vi.fn().mockResolvedValue(undefined);
    const preloadCreateProjectPopupModule = vi.fn().mockResolvedValue(undefined);
    const preloadSettingsPopupModule = vi.fn().mockResolvedValue(undefined);
    const signOut = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useDashboardPopupBindings({
      viewerIdentity: {
        userId: "viewer-id",
        workosUserId: "workos-viewer-id",
        name: "Viewer Name",
        email: "viewer@example.com",
        avatarUrl: "https://example.com/avatar.png",
        role: "owner",
      },
      setPendingHighlight,
      openSettings,
      preloadSearchPopupModule,
      preloadCreateProjectPopupModule,
      preloadSettingsPopupModule,
      signOut,
    }));

    expect(result.current.createProjectViewer).toEqual({
      userId: "viewer-id",
      name: "Viewer Name",
      avatar: "https://example.com/avatar.png",
      role: "owner",
    });

    act(() => {
      result.current.searchPopupOpenSettings("Company");
      result.current.searchPopupHighlightNavigate("project-1", { type: "task", taskId: "task-1" });
      result.current.handleSearchIntent();
      result.current.handleCreateProjectIntent();
      result.current.handleSettingsIntent();
    });

    expect(openSettings).toHaveBeenNthCalledWith(1, "Company");
    expect(setPendingHighlight).toHaveBeenCalledWith({
      projectId: "project-1",
      type: "task",
      taskId: "task-1",
    });
    expect(preloadSearchPopupModule).toHaveBeenCalledTimes(1);
    expect(preloadCreateProjectPopupModule).toHaveBeenCalledTimes(1);
    expect(preloadSettingsPopupModule).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.handleSignOut();
    });
    expect(signOut).toHaveBeenCalledTimes(1);
  });

  test("normalizes invalid settings tabs and handles sign out failures", async () => {
    const openSettings = vi.fn();
    const signOut = vi.fn().mockRejectedValue(new Error("signout failed"));
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { result } = renderHook(() => useDashboardPopupBindings({
      viewerIdentity: {
        userId: null,
        workosUserId: null,
        name: "Viewer Name",
        email: "viewer@example.com",
        avatarUrl: null,
        role: null,
      },
      setPendingHighlight: vi.fn(),
      openSettings,
      preloadSearchPopupModule: vi.fn().mockResolvedValue(undefined),
      preloadCreateProjectPopupModule: vi.fn().mockResolvedValue(undefined),
      preloadSettingsPopupModule: vi.fn().mockResolvedValue(undefined),
      signOut,
    }));

    act(() => {
      result.current.searchPopupOpenSettings("NotATab");
    });
    expect(openSettings).toHaveBeenCalledWith("Account");

    await act(async () => {
      await result.current.handleSignOut();
    });
    expect(errorSpy).toHaveBeenCalled();

    errorSpy.mockRestore();
  });
});
