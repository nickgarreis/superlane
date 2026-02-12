/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useDashboardController } from "./useDashboardController";
import type { ProjectData } from "../types";

const buildProject = (
  id: string,
  archived: boolean,
  statusLabel = "Active",
): ProjectData => ({
  id,
  name: id,
  description: `${id} description`,
  creator: { userId: "user-1", name: "User", avatar: "" },
  status: {
    label: statusLabel,
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "General",
  scope: "Scope",
  archived,
  tasks: [],
});

describe("useDashboardController", () => {
  test("exposes sidebar and highlight handlers", () => {
    const setIsSidebarOpen = vi.fn();
    const setPendingHighlight = vi.fn();
    const { result } = renderHook(() =>
      useDashboardController({
        currentView: "tasks",
        projects: {},
        visibleProjects: {},
        setIsSidebarOpen,
        setPendingHighlight,
        navigateView: vi.fn(),
      }),
    );

    act(() => {
      result.current.toggleSidebar();
      result.current.clearPendingHighlight();
    });

    expect(setIsSidebarOpen).toHaveBeenCalledTimes(1);
    const updater = setIsSidebarOpen.mock.calls[0][0] as (
      value: boolean,
    ) => boolean;
    expect(updater(false)).toBe(true);
    expect(updater(true)).toBe(false);
    expect(setPendingHighlight).toHaveBeenCalledWith(null);
  });

  test("returns expected content model for tasks/archive/activities/project routes", () => {
    const project = buildProject("project-1", false);
    const archivedProject = buildProject("project-2", true);
    const navigateView = vi.fn();

    const tasksHook = renderHook(() =>
      useDashboardController({
        currentView: "tasks",
        projects: { "project-1": project },
        visibleProjects: { "project-1": project },
        setIsSidebarOpen: vi.fn(),
        setPendingHighlight: vi.fn(),
        navigateView,
      }),
    );
    expect(tasksHook.result.current.contentModel).toEqual({ kind: "tasks" });

    const archiveHook = renderHook(() =>
      useDashboardController({
        currentView: "archive",
        projects: { "project-2": archivedProject },
        visibleProjects: { "project-2": archivedProject },
        setIsSidebarOpen: vi.fn(),
        setPendingHighlight: vi.fn(),
        navigateView,
      }),
    );
    expect(archiveHook.result.current.contentModel).toEqual({
      kind: "archive",
    });

    const activitiesHook = renderHook(() =>
      useDashboardController({
        currentView: "activities",
        projects: { "project-1": project },
        visibleProjects: { "project-1": project },
        setIsSidebarOpen: vi.fn(),
        setPendingHighlight: vi.fn(),
        navigateView,
      }),
    );
    expect(activitiesHook.result.current.contentModel).toEqual({
      kind: "activities",
    });

    const projectHook = renderHook(() =>
      useDashboardController({
        currentView: "project:project-1",
        projects: { "project-1": project },
        visibleProjects: { "project-1": project },
        setIsSidebarOpen: vi.fn(),
        setPendingHighlight: vi.fn(),
        navigateView,
      }),
    );
    expect(projectHook.result.current.contentModel).toMatchObject({
      kind: "main",
      project,
    });

    const archiveProjectHook = renderHook(() =>
      useDashboardController({
        currentView: "archive-project:project-2",
        projects: { "project-2": archivedProject },
        visibleProjects: { "project-2": archivedProject },
        setIsSidebarOpen: vi.fn(),
        setPendingHighlight: vi.fn(),
        navigateView,
      }),
    );
    expect(archiveProjectHook.result.current.contentModel).toMatchObject({
      kind: "main",
      project: archivedProject,
      backTo: "archive",
    });

    const back =
      archiveProjectHook.result.current.contentModel.kind === "main"
        ? archiveProjectHook.result.current.contentModel.back
        : undefined;
    back?.();
    expect(navigateView).toHaveBeenCalledWith("archive");
  });

  test("falls back to first visible active project or empty state", () => {
    const draft = buildProject("draft", false, "Draft");
    const review = buildProject("review", false, "Review");
    const active = buildProject("active", false, "Active");

    const fallbackHook = renderHook(() =>
      useDashboardController({
        currentView: "project:missing",
        projects: {},
        visibleProjects: { draft, review, active },
        setIsSidebarOpen: vi.fn(),
        setPendingHighlight: vi.fn(),
        navigateView: vi.fn(),
      }),
    );
    expect(fallbackHook.result.current.contentModel).toMatchObject({
      kind: "main",
      project: active,
    });

    const emptyHook = renderHook(() =>
      useDashboardController({
        currentView: "project:missing",
        projects: {},
        visibleProjects: { draft, review },
        setIsSidebarOpen: vi.fn(),
        setPendingHighlight: vi.fn(),
        navigateView: vi.fn(),
      }),
    );
    expect(emptyHook.result.current.contentModel).toEqual({ kind: "empty" });
  });
});
