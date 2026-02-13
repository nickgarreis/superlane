import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { isProtectedPath, pathToView, viewToPath } from "../../lib/routing";
import { scheduleIdlePrefetch } from "../../lib/prefetch";
import { reportUiError } from "../../lib/errors";
import { useGlobalEventListener } from "../../lib/hooks/useGlobalEventListener";
import type { ProjectData } from "../../types";
type DashboardSnapshotLike =
  | { workspaces: unknown[]; activeWorkspaceSlug?: string | null }
  | null
  | undefined;
type CompanySettingsLike =
  | {
      capability?: { hasOrganizationLink?: boolean };
      viewerRole?: string | null;
    }
  | null
  | undefined;
type UseDashboardLifecycleEffectsArgs = {
  snapshot: DashboardSnapshotLike;
  projectsPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  ensureDefaultWorkspace: (args: {}) => Promise<{ slug: string }>;
  setActiveWorkspaceSlug: (slug: string) => void;
  preloadSearchPopupModule: () => Promise<unknown>;
  openSearch: () => void;
  openInbox: () => void;
  openCreateProject: () => void;
  openSettings: () => void;
  locationPathname: string;
  locationSearch: string;
  projects: Record<string, ProjectData>;
  navigateToPath: (path: string, replace?: boolean) => void;
  resolvedWorkspaceSlug: string | null;
  companySettings: CompanySettingsLike;
  ensureOrganizationLinkAction: (args: {
    workspaceSlug: string;
  }) => Promise<{ alreadyLinked: boolean }>;
  runWorkspaceSettingsReconciliation: (workspaceSlug: string) => Promise<void>;
};

const COMPLETED_PATH = viewToPath("completed");
const DRAFTS_PATH = viewToPath("drafts");
const PENDING_PATH = viewToPath("pending");
const isCompletedPath = (pathname: string): boolean =>
  pathname === COMPLETED_PATH || pathname.startsWith(`${COMPLETED_PATH}/`);
const isDraftPendingPath = (pathname: string): boolean =>
  pathname === DRAFTS_PATH ||
  pathname === PENDING_PATH ||
  pathname.startsWith(`${DRAFTS_PATH}/`) ||
  pathname.startsWith(`${PENDING_PATH}/`);

export const useDashboardLifecycleEffects = ({
  snapshot,
  projectsPaginationStatus,
  ensureDefaultWorkspace,
  setActiveWorkspaceSlug,
  preloadSearchPopupModule,
  openSearch,
  openInbox,
  openCreateProject,
  openSettings,
  locationPathname,
  locationSearch,
  projects,
  navigateToPath,
  resolvedWorkspaceSlug,
  companySettings,
  ensureOrganizationLinkAction,
  runWorkspaceSettingsReconciliation,
}: UseDashboardLifecycleEffectsArgs) => {
  const defaultWorkspaceRequestedRef = useRef(false);
  const invalidRouteRef = useRef<string | null>(null);
  const projectCacheRef = useRef<Record<string, ProjectData>>({});
  const cacheWorkspaceSlugRef = useRef<string | null>(resolvedWorkspaceSlug);
  const organizationLinkAttemptedWorkspacesRef = useRef<Set<string>>(new Set());

  if (cacheWorkspaceSlugRef.current !== resolvedWorkspaceSlug) {
    cacheWorkspaceSlugRef.current = resolvedWorkspaceSlug;
    projectCacheRef.current = {};
    invalidRouteRef.current = null;
  }

  for (const [projectId, project] of Object.entries(projects)) {
    projectCacheRef.current[projectId] = project;
  }

  const handleGlobalShortcuts = useCallback(
    (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      if (event.defaultPrevented) {
        return;
      }
      if (!(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) {
        return;
      }
      const isTextInputShortcutTarget =
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target instanceof HTMLElement && event.target.isContentEditable);
      switch (event.key.toLowerCase()) {
        case "k":
          event.preventDefault();
          openSearch();
          break;
        case "i":
          event.preventDefault();
          openInbox();
          break;
        case "p":
          event.preventDefault();
          openCreateProject();
          break;
        case ",":
          event.preventDefault();
          openSettings();
          break;
        case "a":
          if (isTextInputShortcutTarget) {
            return;
          }
          event.preventDefault();
          navigateToPath(viewToPath("archive"));
          break;
        default:
          break;
      }
    },
    [navigateToPath, openCreateProject, openInbox, openSearch, openSettings],
  );
  useEffect(() => {
    if (!snapshot) {
      return;
    }
    if (
      snapshot.workspaces.length > 0 ||
      defaultWorkspaceRequestedRef.current
    ) {
      return;
    }
    defaultWorkspaceRequestedRef.current = true;
    void ensureDefaultWorkspace({})
      .then((result) => {
        setActiveWorkspaceSlug(result.slug);
      })
      .catch((error) => {
        reportUiError("dashboard.ensureDefaultWorkspace", error, {
          showToast: false,
        });
        toast.error("Failed to create your default workspace");
      });
  }, [snapshot, ensureDefaultWorkspace, setActiveWorkspaceSlug]);
  useEffect(() => {
    const cancel = scheduleIdlePrefetch(() => preloadSearchPopupModule());
    return cancel;
  }, [preloadSearchPopupModule]);
  useGlobalEventListener({
    target: document,
    type: "keydown",
    listener: handleGlobalShortcuts,
  });
  const toProtectedFromPath = useCallback(
    (
      candidate: string | null | undefined,
      options?: { allowCompleted?: boolean; allowDraftPending?: boolean },
    ): string | null => {
      if (!candidate || !candidate.startsWith("/")) {
        return null;
      }
      const pathOnly = candidate.split(/[?#]/, 1)[0] ?? candidate;
      if (!isProtectedPath(pathOnly) || pathOnly === "/settings") {
        return null;
      }
      if (options?.allowCompleted === false && isCompletedPath(pathOnly)) {
        return null;
      }
      if (
        options?.allowDraftPending === false &&
        isDraftPendingPath(pathOnly)
      ) {
        return null;
      }
      return candidate;
    },
    [],
  );
  const toValidDraftPendingFromPath = useCallback(
    (
      candidate: string | null | undefined,
      options?: { draftPendingProjectId?: string },
    ): string | null => {
      const protectedPath = toProtectedFromPath(candidate, {
        allowCompleted: false,
        allowDraftPending: false,
      });
      if (!protectedPath) {
        return null;
      }
      const pathOnly = protectedPath.split(/[?#]/, 1)[0] ?? protectedPath;
      const fromView = pathToView(pathOnly);
      if (
        !fromView ||
        fromView === "completed" ||
        fromView === "drafts" ||
        fromView === "pending" ||
        fromView.startsWith("completed-project:") ||
        fromView.startsWith("draft-project:") ||
        fromView.startsWith("pending-project:")
      ) {
        return null;
      }
      if (
        options?.draftPendingProjectId &&
        fromView === `project:${options.draftPendingProjectId}`
      ) {
        return null;
      }
      return protectedPath;
    },
    [toProtectedFromPath],
  );
  const resolveDraftPendingFromPath = useCallback(
    (options?: { draftPendingProjectId?: string }) => {
      const fromParam = toValidDraftPendingFromPath(
        new URLSearchParams(locationSearch).get("from"),
        { draftPendingProjectId: options?.draftPendingProjectId },
      );
      return fromParam ?? "/tasks";
    },
    [locationSearch, toValidDraftPendingFromPath],
  );
  const resolveCompletedFromPath = useCallback(
    (options?: { completedProjectId?: string }) => {
      const fromParam = toProtectedFromPath(
        new URLSearchParams(locationSearch).get("from"),
        { allowCompleted: false },
      );
      if (!fromParam) {
        return "/tasks";
      }
      const fromPathname = fromParam.split(/[?#]/, 1)[0] ?? fromParam;
      const fromView = pathToView(fromPathname);
      if (
        !fromView ||
        fromView === "completed" ||
        fromView.startsWith("completed-project:") ||
        fromView === `project:${options?.completedProjectId ?? ""}`
      ) {
        return "/tasks";
      }
      return fromParam;
    },
    [locationSearch, toProtectedFromPath],
  );
  useEffect(() => {
    if (!snapshot) {
      return;
    }
    const routeView = pathToView(locationPathname);
    if (!routeView) {
      invalidRouteRef.current = null;
      if (locationPathname !== "/settings") {
        navigateToPath("/tasks", true);
      }
      return;
    }
    const projectRouteLoading =
      (routeView.startsWith("project:") ||
        routeView.startsWith("archive-project:") ||
        routeView.startsWith("completed-project:") ||
        routeView.startsWith("draft-project:") ||
        routeView.startsWith("pending-project:")) &&
      projectsPaginationStatus === "LoadingFirstPage";
    if (projectRouteLoading) {
      return;
    }
    if (routeView.startsWith("project:")) {
      const projectId = routeView.slice("project:".length);
      const project = projects[projectId] ?? projectCacheRef.current[projectId];
      if (!project) {
        if (invalidRouteRef.current !== locationPathname) {
          invalidRouteRef.current = locationPathname;
          toast.error("Project not found");
        }
        navigateToPath("/tasks", true);
        return;
      }
      if (project.archived) {
        navigateToPath(viewToPath(`archive-project:${projectId}`), true);
        return;
      }
      invalidRouteRef.current = null;
      return;
    }
    if (routeView.startsWith("archive-project:")) {
      const projectId = routeView.slice("archive-project:".length);
      const project = projects[projectId] ?? projectCacheRef.current[projectId];
      if (!project) {
        if (invalidRouteRef.current !== locationPathname) {
          invalidRouteRef.current = locationPathname;
          toast.error("Archived project not found");
        }
        navigateToPath("/archive", true);
        return;
      }
      if (!project.archived) {
        navigateToPath(viewToPath(`project:${projectId}`), true);
        return;
      }
      invalidRouteRef.current = null;
      return;
    }
    if (routeView === "drafts" || routeView === "pending") {
      const fromPath = resolveDraftPendingFromPath();
      const fromParams = new URLSearchParams({ from: fromPath });
      const expectedPath = `${viewToPath(routeView)}?${fromParams.toString()}`;
      if (`${locationPathname}${locationSearch}` !== expectedPath) {
        navigateToPath(expectedPath, true);
        return;
      }
      invalidRouteRef.current = null;
      return;
    }
    if (
      routeView.startsWith("draft-project:") ||
      routeView.startsWith("pending-project:")
    ) {
      const routeKind = routeView.startsWith("draft-project:")
        ? "draft"
        : "pending";
      const routePrefix =
        routeKind === "draft" ? "draft-project:" : "pending-project:";
      const projectId = routeView.slice(routePrefix.length);
      const project = projects[projectId] ?? projectCacheRef.current[projectId];
      const fromPath = resolveDraftPendingFromPath({
        draftPendingProjectId: projectId,
      });
      const fromParams = new URLSearchParams({ from: fromPath });
      const listView = routeKind === "draft" ? "drafts" : "pending";
      const listPath = `${viewToPath(listView)}?${fromParams.toString()}`;
      if (
        !project ||
        project.archived ||
        (project.status.label !== "Draft" && project.status.label !== "Review")
      ) {
        navigateToPath(listPath, true);
        return;
      }
      const expectedDetailView =
        project.status.label === "Draft"
          ? (`draft-project:${projectId}` as const)
          : (`pending-project:${projectId}` as const);
      const expectedPath = `${viewToPath(expectedDetailView)}?${fromParams.toString()}`;
      if (`${locationPathname}${locationSearch}` !== expectedPath) {
        navigateToPath(expectedPath, true);
        return;
      }
      invalidRouteRef.current = null;
      return;
    }
    if (routeView === "completed") {
      const fromPath = resolveCompletedFromPath();
      const fromParams = new URLSearchParams({ from: fromPath });
      const expectedPath = `${viewToPath("completed")}?${fromParams.toString()}`;
      if (`${locationPathname}${locationSearch}` !== expectedPath) {
        navigateToPath(expectedPath, true);
        return;
      }
      invalidRouteRef.current = null;
      return;
    }
    if (routeView.startsWith("completed-project:")) {
      const projectId = routeView.slice("completed-project:".length);
      const project = projects[projectId] ?? projectCacheRef.current[projectId];
      const fromPath = resolveCompletedFromPath({
        completedProjectId: projectId,
      });
      const fromParams = new URLSearchParams({ from: fromPath });
      const listPath = `${viewToPath("completed")}?${fromParams.toString()}`;
      if (
        !project ||
        project.archived ||
        project.status.label !== "Completed"
      ) {
        navigateToPath(listPath, true);
        return;
      }
      const expectedPath = `${viewToPath(`completed-project:${projectId}`)}?${fromParams.toString()}`;
      if (`${locationPathname}${locationSearch}` !== expectedPath) {
        navigateToPath(expectedPath, true);
        return;
      }
      invalidRouteRef.current = null;
      return;
    }
  }, [
    snapshot,
    locationPathname,
    locationSearch,
    projects,
    navigateToPath,
    projectsPaginationStatus,
    resolveCompletedFromPath,
    resolveDraftPendingFromPath,
  ]);
  useEffect(() => {
    if (!resolvedWorkspaceSlug || !companySettings) {
      return;
    }
    if (
      companySettings.capability?.hasOrganizationLink ||
      companySettings.viewerRole !== "owner"
    ) {
      return;
    }
    const slug = resolvedWorkspaceSlug;
    const attempted = organizationLinkAttemptedWorkspacesRef.current;
    if (attempted.has(slug)) {
      return;
    }
    attempted.add(slug);
    void ensureOrganizationLinkAction({ workspaceSlug: slug })
      .then(async (result) => {
        if (!result.alreadyLinked) {
          await runWorkspaceSettingsReconciliation(slug);
          toast.success("Workspace linked to WorkOS organization");
        }
      })
      .catch((error) => {
        reportUiError("dashboard.ensureOrganizationLink", error, {
          showToast: false,
        });
        toast.error("Failed to link workspace organization");
      });
  }, [
    resolvedWorkspaceSlug,
    companySettings,
    ensureOrganizationLinkAction,
    runWorkspaceSettingsReconciliation,
  ]);
};
