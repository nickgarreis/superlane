/** @vitest-environment jsdom */

import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { viewToPath } from "../../lib/routing";
import { useDashboardLifecycleEffects } from "./useDashboardLifecycleEffects";
import type { ProjectData } from "../../types";

const { toastMock, reportUiErrorMock, scheduleIdlePrefetchMock } = vi.hoisted(
  () => ({
    toastMock: {
      success: vi.fn(),
      error: vi.fn(),
    },
    reportUiErrorMock: vi.fn(),
    scheduleIdlePrefetchMock: vi.fn(),
  }),
);

vi.mock("sonner", () => ({
  toast: toastMock,
}));

vi.mock("../../lib/errors", () => ({
  reportUiError: (...args: unknown[]) => reportUiErrorMock(...args),
}));

vi.mock("../../lib/prefetch", () => ({
  scheduleIdlePrefetch: (...args: unknown[]) =>
    scheduleIdlePrefetchMock(...args),
}));

const buildProject = (id: string, archived: boolean): ProjectData => ({
  id,
  name: id,
  description: `${id} description`,
  creator: { userId: "user-1", name: "User", avatar: "" },
  status: {
    label: archived ? "Completed" : "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "General",
  scope: "Scope",
  archived,
  tasks: [],
});

const createBaseArgs = () => ({
  snapshot: { workspaces: [{}], activeWorkspaceSlug: "workspace-1" },
  projectsPaginationStatus: "Exhausted" as const,
  ensureDefaultWorkspace: vi
    .fn()
    .mockResolvedValue({ slug: "workspace-created" }),
  setActiveWorkspaceSlug: vi.fn(),
  preloadSearchPopupModule: vi.fn().mockResolvedValue(undefined),
  openSearch: vi.fn(),
  openInbox: vi.fn(),
  openCreateProject: vi.fn(),
  openSettings: vi.fn(),
  locationPathname: "/tasks",
  locationSearch: "",
  projects: {} as Record<string, ProjectData>,
  navigateToPath: vi.fn(),
  resolvedWorkspaceSlug: null as string | null,
  companySettings: null as {
    capability?: { hasOrganizationLink?: boolean };
    viewerRole?: string | null;
  } | null,
  ensureOrganizationLinkAction: vi
    .fn()
    .mockResolvedValue({ alreadyLinked: true }),
  runWorkspaceSettingsReconciliation: vi.fn().mockResolvedValue(undefined),
});

describe("useDashboardLifecycleEffects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    scheduleIdlePrefetchMock.mockImplementation((callback: () => void) => {
      callback();
      return vi.fn();
    });
  });

  test("creates a default workspace when none exists", async () => {
    const args = createBaseArgs();
    args.snapshot = { workspaces: [] };

    renderHook(() => useDashboardLifecycleEffects(args));

    await waitFor(() => {
      expect(args.ensureDefaultWorkspace).toHaveBeenCalledWith({});
      expect(args.setActiveWorkspaceSlug).toHaveBeenCalledWith(
        "workspace-created",
      );
    });
  });

  test("reports default workspace creation failures", async () => {
    const args = createBaseArgs();
    args.snapshot = { workspaces: [] };
    args.ensureDefaultWorkspace.mockRejectedValueOnce(
      new Error("workspace failed"),
    );

    renderHook(() => useDashboardLifecycleEffects(args));

    await waitFor(() => {
      expect(reportUiErrorMock).toHaveBeenCalledWith(
        "dashboard.ensureDefaultWorkspace",
        expect.any(Error),
        { showToast: false },
      );
      expect(toastMock.error).toHaveBeenCalledWith(
        "Failed to create your default workspace",
      );
    });
  });

  test("opens keyboard shortcut targets and preloads popup on idle", async () => {
    const args = createBaseArgs();
    renderHook(() => useDashboardLifecycleEffects(args));

    expect(scheduleIdlePrefetchMock).toHaveBeenCalledTimes(1);
    expect(args.preloadSearchPopupModule).toHaveBeenCalledTimes(1);

    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "k", ctrlKey: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "i", ctrlKey: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "p", ctrlKey: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: ",", ctrlKey: true }),
    );
    document.dispatchEvent(
      new KeyboardEvent("keydown", { key: "a", ctrlKey: true }),
    );

    expect(args.openSearch).toHaveBeenCalledTimes(1);
    expect(args.openInbox).toHaveBeenCalledTimes(1);
    expect(args.openCreateProject).toHaveBeenCalledTimes(1);
    expect(args.openSettings).toHaveBeenCalledTimes(1);
    expect(args.navigateToPath).toHaveBeenCalledWith("/archive");
  });

  test("preserves select-all in text inputs", () => {
    const args = createBaseArgs();
    renderHook(() => useDashboardLifecycleEffects(args));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(
      new KeyboardEvent("keydown", {
        key: "a",
        ctrlKey: true,
        bubbles: true,
      }),
    );
    document.body.removeChild(input);

    expect(args.navigateToPath).not.toHaveBeenCalledWith("/archive");
  });

  test("registers and cleans up global keydown listener", () => {
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");
    const args = createBaseArgs();

    const { unmount } = renderHook(() => useDashboardLifecycleEffects(args));

    const keydownAdds = addEventListenerSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );
    expect(keydownAdds.length).toBeGreaterThan(0);

    unmount();

    const keydownRemoves = removeEventListenerSpy.mock.calls.filter(
      ([type]) => type === "keydown",
    );
    expect(keydownRemoves.length).toBeGreaterThan(0);
  });

  test("redirects invalid project and archive routes", async () => {
    const args = createBaseArgs();
    args.locationPathname = "/project/missing";
    const { rerender } = renderHook(
      (props: ReturnType<typeof createBaseArgs>) =>
        useDashboardLifecycleEffects(props),
      { initialProps: args },
    );

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith("Project not found");
      expect(args.navigateToPath).toHaveBeenCalledWith("/tasks", true);
    });

    rerender(args);
    expect(toastMock.error).toHaveBeenCalledTimes(1);

    const archivedProjectArgs = createBaseArgs();
    archivedProjectArgs.locationPathname = "/project/project-1";
    archivedProjectArgs.projects = {
      "project-1": buildProject("project-1", true),
    };
    renderHook(() => useDashboardLifecycleEffects(archivedProjectArgs));

    await waitFor(() => {
      expect(archivedProjectArgs.navigateToPath).toHaveBeenCalledWith(
        viewToPath("archive-project:project-1"),
        true,
      );
    });
  });

  test("redirects unknown routes, including /activities, to /tasks", async () => {
    const args = createBaseArgs();
    args.locationPathname = "/activities";

    const { rerender } = renderHook(
      (props: ReturnType<typeof createBaseArgs>) =>
        useDashboardLifecycleEffects(props),
      { initialProps: args },
    );

    await waitFor(() => {
      expect(args.navigateToPath).toHaveBeenCalledWith("/tasks", true);
    });

    const unknownPathArgs = createBaseArgs();
    unknownPathArgs.locationPathname = "/foo";
    rerender(unknownPathArgs);

    await waitFor(() => {
      expect(unknownPathArgs.navigateToPath).toHaveBeenCalledWith(
        "/tasks",
        true,
      );
    });
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  test("keeps project route stable when project is available from cache during map swap", () => {
    const args = createBaseArgs();
    args.locationPathname = "/archive";
    args.projects = {
      "project-1": buildProject("project-1", false),
    };

    const { rerender } = renderHook(
      (props: ReturnType<typeof createBaseArgs>) =>
        useDashboardLifecycleEffects(props),
      { initialProps: args },
    );

    rerender({
      ...args,
      locationPathname: "/project/project-1",
      projects: {},
    });

    expect(toastMock.error).not.toHaveBeenCalledWith("Project not found");
    expect(args.navigateToPath).not.toHaveBeenCalledWith("/tasks", true);
  });

  test("waits for projects to load before declaring a project route invalid", async () => {
    const args = createBaseArgs();
    args.locationPathname = "/project/missing";
    args.projectsPaginationStatus = "LoadingFirstPage";

    const { rerender } = renderHook(
      (props: ReturnType<typeof createBaseArgs>) =>
        useDashboardLifecycleEffects(props),
      { initialProps: args },
    );

    expect(toastMock.error).not.toHaveBeenCalled();
    expect(args.navigateToPath).not.toHaveBeenCalled();

    rerender({
      ...args,
      projectsPaginationStatus: "Exhausted",
    });

    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith("Project not found");
      expect(args.navigateToPath).toHaveBeenCalledWith("/tasks", true);
    });
  });

  test("canonicalizes completed list and detail routes with safe from query", async () => {
    const completedProject: ProjectData = {
      ...buildProject("completed-1", false),
      status: {
        label: "Completed",
        color: "#fff",
        bgColor: "#000",
        dotColor: "#fff",
      },
    };

    const listArgs = createBaseArgs();
    listArgs.locationPathname = "/completed";
    listArgs.locationSearch = "?from=/completed/completed-1";
    renderHook(() => useDashboardLifecycleEffects(listArgs));

    await waitFor(() => {
      expect(listArgs.navigateToPath).toHaveBeenCalledWith(
        "/completed?from=%2Ftasks",
        true,
      );
    });

    const detailArgs = createBaseArgs();
    detailArgs.locationPathname = "/completed/completed-1";
    detailArgs.locationSearch = "?from=/completed";
    detailArgs.projects = { "completed-1": completedProject };
    renderHook(() => useDashboardLifecycleEffects(detailArgs));

    await waitFor(() => {
      expect(detailArgs.navigateToPath).toHaveBeenCalledWith(
        "/completed/completed-1?from=%2Ftasks",
        true,
      );
    });
  });

  test("redirects invalid completed detail routes back to completed list", async () => {
    const args = createBaseArgs();
    args.locationPathname = "/completed/missing";
    args.locationSearch = "?from=/archive";

    renderHook(() => useDashboardLifecycleEffects(args));

    await waitFor(() => {
      expect(args.navigateToPath).toHaveBeenCalledWith(
        "/completed?from=%2Farchive",
        true,
      );
    });
  });

  test("ensures organization link for owners and reconciles once per workspace", async () => {
    const args = createBaseArgs();
    args.resolvedWorkspaceSlug = "workspace-1";
    args.companySettings = {
      capability: { hasOrganizationLink: false },
      viewerRole: "owner",
    };
    args.ensureOrganizationLinkAction.mockResolvedValueOnce({
      alreadyLinked: false,
    });

    const { rerender } = renderHook(
      (props: ReturnType<typeof createBaseArgs>) =>
        useDashboardLifecycleEffects(props),
      { initialProps: args },
    );

    await waitFor(() => {
      expect(args.ensureOrganizationLinkAction).toHaveBeenCalledWith({
        workspaceSlug: "workspace-1",
      });
      expect(args.runWorkspaceSettingsReconciliation).toHaveBeenCalledWith(
        "workspace-1",
      );
      expect(toastMock.success).toHaveBeenCalledWith(
        "Workspace linked to WorkOS organization",
      );
    });

    rerender(args);
    expect(args.ensureOrganizationLinkAction).toHaveBeenCalledTimes(1);
  });

  test("reports organization-link failures", async () => {
    const args = createBaseArgs();
    args.resolvedWorkspaceSlug = "workspace-1";
    args.companySettings = {
      capability: { hasOrganizationLink: false },
      viewerRole: "owner",
    };
    args.ensureOrganizationLinkAction.mockRejectedValueOnce(
      new Error("link failed"),
    );

    renderHook(() => useDashboardLifecycleEffects(args));

    await waitFor(() => {
      expect(reportUiErrorMock).toHaveBeenCalledWith(
        "dashboard.ensureOrganizationLink",
        expect.any(Error),
        { showToast: false },
      );
      expect(toastMock.error).toHaveBeenCalledWith(
        "Failed to link workspace organization",
      );
    });
  });
});
