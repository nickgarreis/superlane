/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardData } from "./useDashboardData";

const useQueryMock = vi.fn();
const usePaginatedQueryMock = vi.fn();
const useDashboardControllerMock = vi.fn();

vi.mock("convex/react", () => ({
  useQuery: (...args: unknown[]) => useQueryMock(...args),
  usePaginatedQuery: (...args: unknown[]) => usePaginatedQueryMock(...args),
}));

vi.mock("./useDashboardController", () => ({
  useDashboardController: (...args: unknown[]) =>
    useDashboardControllerMock(...args),
}));

const createBaseArgs = () => ({
  isAuthenticated: true,
  activeWorkspaceSlug: null,
  setActiveWorkspaceSlug: vi.fn(),
  isSettingsOpen: true,
  settingsTab: "Company" as const,
  isSearchOpen: true,
  currentView: "project:project-1" as const,
  completedProjectDetailId: null as string | null,
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
    usePaginatedQueryMock.mockReset();
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
    const paginatedQueryArgs: unknown[] = [];

    const snapshot = {
      activeWorkspaceSlug: "alpha",
      viewer: {
        id: "viewer-1",
        workosUserId: "workos-1",
        name: "Snapshot User",
        email: "snapshot@example.com",
        avatarUrl: "https://img.example/avatar.png",
      },
      activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
      workspaces: [
        {
          slug: "alpha",
          name: "Alpha",
          plan: "Free",
          logo: "",
          logoColor: "",
          logoText: "A",
        },
      ],
    };

    const projectsResult = {
      results: [
        {
          publicId: "project-1",
          name: "Project One",
          description: "Desc",
          category: "Web",
          status: "Active",
          lastApprovedAt: 1_700_000_000_500,
          archived: false,
          creator: { userId: "viewer-1", name: "Snapshot User", avatarUrl: "" },
        },
      ],
    };

    const tasksResult = {
      results: [
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

    const workspaceMembers = {
      members: [
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
    };

    const queryResults = [
      snapshot,
      {},
      {
        events: {
          eventNotifications: true,
          teamActivities: true,
          productUpdates: true,
        },
      },
      {},
      workspaceMembers,
      {
        userId: "member-1",
        role: "owner",
      },
      {
        unreadCount: 3,
      },
      [
        {
          projectPublicId: "project-1",
          lastSeenApprovedAt: 1_700_000_000_000,
        },
      ],
    ];
    const paginatedQueryResults = [
      {
        ...projectsResult,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      },
      {
        ...projectsResult,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      },
      {
        ...tasksResult,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      },
      { results: [], status: "Exhausted", isLoading: false, loadMore: vi.fn() }, // workspace activities
      {
        ...tasksResult,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      }, // project tasks
      {
        results: workspaceFiles,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      }, // workspace files
      {
        results: workspaceFiles,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      }, // project files
      {
        results: workspaceMembers.members,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      },
      { results: [], status: "Exhausted", isLoading: false, loadMore: vi.fn() },
      { results: [], status: "Exhausted", isLoading: false, loadMore: vi.fn() },
      { results: [], status: "Exhausted", isLoading: false, loadMore: vi.fn() },
    ];

    useQueryMock.mockImplementation((_query: unknown, queryArg: unknown) => {
      queryArgs.push(queryArg);
      return queryResults[queryArgs.length - 1];
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        paginatedQueryArgs.push(queryArg);
        return (
          paginatedQueryResults[paginatedQueryArgs.length - 1] ?? {
            results: [],
            status: "Exhausted",
            isLoading: false,
            loadMore: vi.fn(),
          }
        );
      },
    );

    const { result } = renderHook(() => useDashboardData(args));

    expect(result.current.resolvedWorkspaceSlug).toBe("alpha");
    expect(result.current.viewerIdentity.name).toBe("Snapshot Member");
    expect(result.current.activeWorkspace?.slug).toBe("alpha");
    expect(result.current.visibleProjects["project-1"]?.name).toBe(
      "Project One",
    );
    expect(result.current.chatProjects["project-1"]?.name).toBe("Project One");
    expect(result.current.allWorkspaceFiles).toHaveLength(1);
    expect(result.current.projectFilesByProject["project-1"]).toHaveLength(1);
    expect(result.current.inboxUnreadCount).toBe(3);
    expect(result.current.approvedSidebarProjectIds).toEqual(["project-1"]);
    expect(result.current.usesWorkspaceTaskFeed).toBe(true);
    expect(result.current.usesProjectTaskFeed).toBe(true);
    expect(queryArgs[4]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedQueryArgs[0]).toEqual({
      workspaceSlug: "alpha",
      includeArchived: false,
    });
    expect(paginatedQueryArgs[1]).toEqual({
      workspaceSlug: "alpha",
      includeArchived: true,
    });
    expect(paginatedQueryArgs[2]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedQueryArgs[3]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedQueryArgs[4]).toEqual({ projectPublicId: "project-1" });
    expect(paginatedQueryArgs[5]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedQueryArgs[6]).toEqual({ projectPublicId: "project-1" });
    expect(queryArgs[7]).toEqual({ workspaceSlug: "alpha" });

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

  test("ignores stale persisted workspace slug when bootstrap resolves with no active workspace", async () => {
    const args = {
      ...createBaseArgs(),
      activeWorkspaceSlug: "stale-workspace",
      isSearchOpen: false,
      isSettingsOpen: false,
      currentView: "tasks" as const,
    };
    const paginatedCallArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, queryArg: unknown) => {
      if (queryArg === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: null,
        viewer: {
          id: null,
          workosUserId: "workos-1",
          name: "New User",
          email: "new@example.com",
          avatarUrl: null,
        },
        activeWorkspace: null,
        workspaces: [],
      };
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        paginatedCallArgs.push(queryArg);
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const { result } = renderHook(() => useDashboardData(args));

    expect(result.current.resolvedWorkspaceSlug).toBeNull();
    expect(paginatedCallArgs[0]).toBe("skip");
    expect(paginatedCallArgs[1]).toBe("skip");
    expect(paginatedCallArgs[2]).toBe("skip");
    expect(paginatedCallArgs[3]).toBe("skip");

    await waitFor(() => {
      expect(args.setActiveWorkspaceSlug).toHaveBeenCalledWith(null);
    });
  });

  test("skips workspace file query when search is closed and view is not project", () => {
    const queryCallArgs: unknown[] = [];
    const paginatedCallArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      queryCallArgs.push(args);
      if (queryCallArgs.length === 1) {
        return {
          activeWorkspaceSlug: "alpha",
          viewer: null,
          activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
          workspaces: [
            {
              slug: "alpha",
              name: "Alpha",
              plan: "Free",
              logo: "",
              logoColor: "",
              logoText: "A",
            },
          ],
        };
      }
      return undefined;
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, args: unknown) => {
        paginatedCallArgs.push(args);
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const args = {
      ...createBaseArgs(),
      isSearchOpen: false,
      isSettingsOpen: false,
      currentView: "tasks" as const,
    };

    renderHook(() => useDashboardData(args));

    expect(paginatedCallArgs[0]).toEqual({
      workspaceSlug: "alpha",
      includeArchived: false,
    });
    expect(paginatedCallArgs[1]).toEqual({
      workspaceSlug: "alpha",
      includeArchived: true,
    });
    expect(paginatedCallArgs[2]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[3]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[4]).toBe("skip");
    expect(paginatedCallArgs[5]).toBe("skip");
    expect(paginatedCallArgs[6]).toBe("skip");
    expect(paginatedCallArgs[7]).toBe("skip");
    expect(paginatedCallArgs[8]).toBe("skip");
    expect(paginatedCallArgs[9]).toBe("skip");
  });

  test("keeps project query args stable between tasks and project routes", () => {
    const projectsQueryArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: "alpha",
        viewer: null,
        activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
        workspaces: [
          {
            slug: "alpha",
            name: "Alpha",
            plan: "Free",
            logo: "",
            logoColor: "",
            logoText: "A",
          },
        ],
      };
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        if (
          queryArg !== "skip" &&
          typeof queryArg === "object" &&
          queryArg !== null &&
          "includeArchived" in queryArg
        ) {
          projectsQueryArgs.push(queryArg);
        }
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const baseArgs = {
      ...createBaseArgs(),
      isSearchOpen: false,
      isSettingsOpen: false,
      currentView: "tasks" as const,
    };
    const { rerender } = renderHook(
      ({ currentView }: { currentView: "tasks" | `project:${string}` }) =>
        useDashboardData({ ...baseArgs, currentView }),
      { initialProps: { currentView: "tasks" as const } },
    );

    rerender({
      currentView: "project:project-1",
    });

    expect(projectsQueryArgs).toEqual([
      { workspaceSlug: "alpha", includeArchived: false },
      { workspaceSlug: "alpha", includeArchived: true },
      { workspaceSlug: "alpha", includeArchived: false },
      { workspaceSlug: "alpha", includeArchived: true },
    ]);
  });

  test("keeps project query args stable when opening completed project popup detail", () => {
    const projectsQueryArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: "alpha",
        viewer: null,
        activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
        workspaces: [
          {
            slug: "alpha",
            name: "Alpha",
            plan: "Free",
            logo: "",
            logoColor: "",
            logoText: "A",
          },
        ],
      };
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        if (
          queryArg !== "skip" &&
          typeof queryArg === "object" &&
          queryArg !== null &&
          "includeArchived" in queryArg
        ) {
          projectsQueryArgs.push(queryArg);
        }
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const baseArgs = {
      ...createBaseArgs(),
      isSearchOpen: false,
      isSettingsOpen: false,
      currentView: "tasks" as const,
    };
    const { rerender } = renderHook(
      ({ completedProjectDetailId }: { completedProjectDetailId: string | null }) =>
        useDashboardData({ ...baseArgs, completedProjectDetailId }),
      { initialProps: { completedProjectDetailId: null } },
    );

    rerender({ completedProjectDetailId: "completed-1" });

    expect(projectsQueryArgs).toEqual([
      { workspaceSlug: "alpha", includeArchived: false },
      { workspaceSlug: "alpha", includeArchived: true },
      { workspaceSlug: "alpha", includeArchived: false },
      { workspaceSlug: "alpha", includeArchived: true },
    ]);
  });

  test("uses project-scoped task feed for project routes when search is closed", () => {
    const paginatedCallArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: "alpha",
        viewer: null,
        activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
        workspaces: [
          {
            slug: "alpha",
            name: "Alpha",
            plan: "Free",
            logo: "",
            logoColor: "",
            logoText: "A",
          },
        ],
      };
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, args: unknown) => {
        paginatedCallArgs.push(args);
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const { result } = renderHook(() =>
      useDashboardData({
        ...createBaseArgs(),
        isSearchOpen: false,
        isSettingsOpen: false,
        currentView: "project:project-1",
      }),
    );

    expect(paginatedCallArgs[2]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[3]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[4]).toEqual({ projectPublicId: "project-1" });
    expect(result.current.usesWorkspaceTaskFeed).toBe(true);
    expect(result.current.usesProjectTaskFeed).toBe(true);
  });

  test("loads project files for completed-project popup detail without route navigation", () => {
    const paginatedCallArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: "alpha",
        viewer: null,
        activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
        workspaces: [
          {
            slug: "alpha",
            name: "Alpha",
            plan: "Free",
            logo: "",
            logoColor: "",
            logoText: "A",
          },
        ],
      };
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        paginatedCallArgs.push(queryArg);
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const args = {
      ...createBaseArgs(),
      isSearchOpen: false,
      isSettingsOpen: false,
      currentView: "tasks" as const,
      completedProjectDetailId: "completed-42",
    };

    renderHook(() => useDashboardData(args));

    expect(paginatedCallArgs[4]).toEqual({ projectPublicId: "completed-42" });
    expect(paginatedCallArgs[6]).toEqual({ projectPublicId: "completed-42" });
  });

  test("prioritizes completed detail id over route project id for detail hydration", () => {
    const paginatedCallArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: "alpha",
        viewer: null,
        activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
        workspaces: [
          {
            slug: "alpha",
            name: "Alpha",
            plan: "Free",
            logo: "",
            logoColor: "",
            logoText: "A",
          },
        ],
      };
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        paginatedCallArgs.push(queryArg);
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    renderHook(() =>
      useDashboardData({
        ...createBaseArgs(),
        isSearchOpen: false,
        isSettingsOpen: false,
        currentView: "project:active-1",
        completedProjectDetailId: "completed-42",
      }),
    );

    expect(paginatedCallArgs[4]).toEqual({ projectPublicId: "completed-42" });
    expect(paginatedCallArgs[6]).toEqual({ projectPublicId: "completed-42" });
  });

  test("loads company settings queries while settings is open even when tab is Account", () => {
    const queryCallArgs: unknown[] = [];
    const paginatedCallArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      queryCallArgs.push(args);
      if (queryCallArgs.length === 1) {
        return {
          activeWorkspaceSlug: "alpha",
          viewer: null,
          activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
          workspaces: [
            {
              slug: "alpha",
              name: "Alpha",
              plan: "Free",
              logo: "",
              logoColor: "",
              logoText: "A",
            },
          ],
        };
      }
      return undefined;
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, args: unknown) => {
        paginatedCallArgs.push(args);
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const args = {
      ...createBaseArgs(),
      settingsTab: "Account" as const,
      isSearchOpen: false,
      currentView: "tasks" as const,
      isSettingsOpen: true,
    };

    renderHook(() => useDashboardData(args));

    expect(queryCallArgs[3]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[7]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[8]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[9]).toEqual({ workspaceSlug: "alpha" });
  });

  test("falls back to workspace members query when snapshot has no members payload", () => {
    const queryCallArgs: unknown[] = [];
    const paginatedCallArgs: unknown[] = [];

    useQueryMock.mockImplementation((_query: unknown, queryArg: unknown) => {
      queryCallArgs.push(queryArg);
      if (queryCallArgs.length === 1) {
        return {
          activeWorkspaceSlug: "alpha",
          viewer: {
            id: "viewer-1",
            workosUserId: "workos-1",
            name: "Snapshot User",
            email: "snapshot@example.com",
            avatarUrl: null,
          },
          activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
          workspaces: [
            {
              slug: "alpha",
              name: "Alpha",
              plan: "Free",
              logo: "",
              logoColor: "",
              logoText: "A",
            },
          ],
        };
      }
      if (queryCallArgs.length === 5) {
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
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        paginatedCallArgs.push(queryArg);
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const { result } = renderHook(() => useDashboardData(createBaseArgs()));

    expect(queryCallArgs[4]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[0]).toEqual({
      workspaceSlug: "alpha",
      includeArchived: false,
    });
    expect(paginatedCallArgs[1]).toEqual({
      workspaceSlug: "alpha",
      includeArchived: true,
    });
    expect(result.current.viewerIdentity.name).toBe("Fallback Member");
  });

  test("does not auto-drain paginated queries on mount", () => {
    const args = {
      ...createBaseArgs(),
      isSearchOpen: false,
      isSettingsOpen: false,
      settingsTab: "Account" as const,
      currentView: "tasks" as const,
    };

    useQueryMock.mockImplementation((_query: unknown, queryArg: unknown) => {
      if (queryArg === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: "alpha",
        viewer: null,
        activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
        workspaces: [
          {
            slug: "alpha",
            name: "Alpha",
            plan: "Free",
            logo: "",
            logoColor: "",
            logoText: "A",
          },
        ],
      };
    });

    const loadMoreSpies = Array.from({ length: 10 }, () => vi.fn());
    usePaginatedQueryMock.mockImplementation(
      (_: unknown, queryArg: unknown) => {
        const index = usePaginatedQueryMock.mock.calls.length - 1;
        return {
          results: [],
          status: queryArg === "skip" ? "Exhausted" : "CanLoadMore",
          isLoading: false,
          loadMore: loadMoreSpies[index] ?? vi.fn(),
        };
      },
    );

    renderHook(() => useDashboardData(args));

    expect(loadMoreSpies.every((spy) => spy.mock.calls.length === 0)).toBe(
      true,
    );
  });

  test("keeps sidebar active and completed project data stable while archive query reloads", () => {
    useQueryMock.mockImplementation((_query: unknown, args: unknown) => {
      if (args === "skip") {
        return undefined;
      }
      return {
        activeWorkspaceSlug: "alpha",
        viewer: null,
        activeWorkspace: { slug: "alpha", name: "Alpha", plan: "Free" },
        workspaces: [
          {
            slug: "alpha",
            name: "Alpha",
            plan: "Free",
            logo: "",
            logoColor: "",
            logoText: "A",
          },
        ],
      };
    });
    usePaginatedQueryMock.mockImplementation(
      (_query: unknown, queryArg: unknown) => {
        if (
          queryArg !== "skip" &&
          typeof queryArg === "object" &&
          queryArg !== null &&
          "includeArchived" in queryArg
        ) {
          const { includeArchived } = queryArg as {
            includeArchived?: boolean;
          };
          if (includeArchived === false) {
            return {
              results: [
                {
                  publicId: "active-1",
                  name: "Active One",
                  description: "Desc",
                  category: "Web",
                  status: "Active",
                  archived: false,
                  creator: {
                    userId: "viewer-1",
                    name: "Snapshot User",
                    avatarUrl: "",
                  },
                },
                {
                  publicId: "completed-1",
                  name: "Completed One",
                  description: "Desc",
                  category: "Web",
                  status: "Completed",
                  archived: false,
                  creator: {
                    userId: "viewer-1",
                    name: "Snapshot User",
                    avatarUrl: "",
                  },
                },
              ],
              status: "Exhausted",
              isLoading: false,
              loadMore: vi.fn(),
            };
          }
          return {
            results: [],
            status: "LoadingFirstPage",
            isLoading: true,
            loadMore: vi.fn(),
          };
        }
        return {
          results: [],
          status: "Exhausted",
          isLoading: false,
          loadMore: vi.fn(),
        };
      },
    );

    const baseArgs = {
      ...createBaseArgs(),
      isSearchOpen: false,
      isSettingsOpen: false,
      currentView: "tasks" as const,
    };
    const { result, rerender } = renderHook(
      ({ currentView }: { currentView: "tasks" | "archive" }) =>
        useDashboardData({ ...baseArgs, currentView }),
      { initialProps: { currentView: "tasks" as const } },
    );

    expect(result.current.sidebarVisibleProjects["active-1"]).toBeDefined();
    expect(result.current.sidebarVisibleProjects["completed-1"]).toBeDefined();

    rerender({ currentView: "archive" });

    expect(result.current.sidebarVisibleProjects["active-1"]).toBeDefined();
    expect(result.current.sidebarVisibleProjects["completed-1"]).toBeDefined();
    expect(result.current.visibleProjects["active-1"]).toBeUndefined();
    expect(result.current.visibleProjects["completed-1"]).toBeUndefined();
  });
});
