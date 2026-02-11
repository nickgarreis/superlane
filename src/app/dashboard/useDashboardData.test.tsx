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
    ];
    const paginatedQueryResults = [
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
      {
        results: workspaceFiles,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      },
      {
        results: workspaceFiles,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      },
      {
        results: workspaceMembers.members,
        status: "Exhausted",
        isLoading: false,
        loadMore: vi.fn(),
      },
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
    expect(result.current.allWorkspaceFiles).toHaveLength(1);
    expect(result.current.projectFilesByProject["project-1"]).toHaveLength(1);
    expect(queryArgs[4]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedQueryArgs[0]).toEqual({
      workspaceSlug: "alpha",
      includeArchived: true,
    });
    expect(paginatedQueryArgs[1]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedQueryArgs[2]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedQueryArgs[3]).toEqual({ projectPublicId: "project-1" });

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

    expect(paginatedCallArgs[2]).toBe("skip");
    expect(paginatedCallArgs[3]).toBe("skip");
    expect(paginatedCallArgs[4]).toBe("skip");
    expect(paginatedCallArgs[5]).toBe("skip");
    expect(paginatedCallArgs[6]).toBe("skip");
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
    expect(paginatedCallArgs[4]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[5]).toEqual({ workspaceSlug: "alpha" });
    expect(paginatedCallArgs[6]).toEqual({ workspaceSlug: "alpha" });
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

    const loadMoreSpies = Array.from({ length: 7 }, () => vi.fn());
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
});
