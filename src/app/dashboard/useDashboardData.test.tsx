/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardData } from "./useDashboardData";

const useQueryMock = vi.fn();
const useDashboardControllerMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
}));

vi.mock("./useDashboardController", () => ({
  useDashboardController: (...args: unknown[]) => useDashboardControllerMock(...args),
}));

const createBaseArgs = () => ({
  isAuthenticated: true,
  activeWorkspaceSlug: null,
  setActiveWorkspaceSlug: vi.fn(),
  isSettingsOpen: true,
  isSearchOpen: true,
  currentView: "project:project-1" as const,
  viewerFallback: {
    name: "Fallback User",
    email: "fallback@example.com",
    avatarUrl: null,
  },
  setIsSidebarOpen: vi.fn(),
  setPendingHighlight: vi.fn(),
  navigateView: vi.fn(),
});

describe("useDashboardData", () => {
  beforeEach(() => {
    useQueryMock.mockReset();
    useDashboardControllerMock.mockReset();
    useDashboardControllerMock.mockReturnValue({
      contentModel: { kind: "tasks" },
      toggleSidebar: vi.fn(),
      clearPendingHighlight: vi.fn(),
    });
  });

  test("maps snapshot data, derives viewer identity, and syncs workspace slug", async () => {
    const args = createBaseArgs();
    const queryArgs: unknown[] = [];

    const snapshot = {
      activeWorkspaceSlug: "alpha",
      viewer: {
        id: "viewer-1",
        workosUserId: "workos-1",
        name: "Snapshot User",
        email: "snapshot@example.com",
        avatarUrl: "https://img.example/avatar.png",
      },
      workspaces: [
        { slug: "alpha", name: "Alpha", plan: "Free", logo: "", logoColor: "", logoText: "A" },
      ],
      workspaceMembers: [
        {
          userId: "member-1",
          workosUserId: "workos-member-1",
          name: "Snapshot Member",
          email: "member@example.com",
          avatarUrl: null,
          role: "owner",
          isViewer: true,
        },
      ],
      projects: [
        {
          publicId: "project-1",
          name: "Project One",
          description: "Desc",
          category: "Web",
          status: "Active",
          archived: false,
          creator: { userId: "viewer-1", name: "Snapshot User", avatarUrl: "" },
        },
      ],
      tasks: [
        {
          taskId: "task-1",
          title: "Ship",
          assignee: { name: "Snapshot User", avatar: "" },
          completed: false,
          projectPublicId: "project-1",
        },
      ],
    };

    const workspaceFiles = [
      {
        id: "file-1",
        projectPublicId: "project-1",
        tab: "Assets",
        name: "logo.png",
        type: "PNG",
        displayDateEpochMs: 1700000000000,
      },
    ];

    const queryResults = [
      snapshot,
      workspaceFiles,
      {},
      { events: { eventNotifications: true, teamActivities: true, productUpdates: true } },
      {},
      undefined,
    ];

    useQueryMock.mockImplementation((_query: unknown, queryArg: unknown) => {
      queryArgs.push(queryArg);
      return queryResults[queryArgs.length - 1];
    });

    const { result } = renderHook(() => useDashboardData(args));

    expect(result.current.resolvedWorkspaceSlug).toBe("alpha");
    expect(result.current.viewerIdentity.name).toBe("Snapshot Member");
    expect(result.current.activeWorkspace?.slug).toBe("alpha");
    expect(result.current.visibleProjects["project-1"]?.name).toBe("Project One");
    expect(result.current.allWorkspaceFiles).toHaveLength(1);
    expect(result.current.projectFilesByProject["project-1"]).toHaveLength(1);
    expect(queryArgs[5]).toBe("skip");

    await waitFor(() => {
      expect(args.setActiveWorkspaceSlug).toHaveBeenCalledWith("alpha");
    });

    expect(useDashboardControllerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        currentView: "project:project-1",
        projects: expect.any(Object),
        visibleProjects: expect.any(Object),
      }),
    );
  });

  test("skips workspace file query when search is closed and view is not project", () => {
    const callArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      callArgs.push(args);
      return undefined;
    });

    const args = {
      ...createBaseArgs(),
      isSearchOpen: false,
      isSettingsOpen: false,
      currentView: "tasks" as const,
    };

    renderHook(() => useDashboardData(args));

    expect(callArgs[1]).toBe("skip");
  });

  test("falls back to workspace members query when snapshot has no members payload", () => {
    const callArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, queryArg: unknown) => {
      callArgs.push(queryArg);
      if (callArgs.length === 1) {
        return {
          activeWorkspaceSlug: "alpha",
          viewer: {
            id: "viewer-1",
            workosUserId: "workos-1",
            name: "Snapshot User",
            email: "snapshot@example.com",
            avatarUrl: null,
          },
          workspaces: [
            { slug: "alpha", name: "Alpha", plan: "Free", logo: "", logoColor: "", logoText: "A" },
          ],
          projects: [],
          tasks: [],
        };
      }
      if (callArgs.length === 6) {
        return {
          members: [
            {
              userId: "fallback-member",
              workosUserId: "fallback-workos",
              name: "Fallback Member",
              email: "fallback@example.com",
              avatarUrl: null,
              role: "owner",
              isViewer: true,
            },
          ],
        };
      }
      return undefined;
    });

    const { result } = renderHook(() => useDashboardData(createBaseArgs()));

    expect(callArgs[5]).toEqual({ workspaceSlug: "alpha" });
    expect(result.current.viewerIdentity.name).toBe("Fallback Member");
  });
});
