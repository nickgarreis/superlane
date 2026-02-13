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
  const resolveDraftPendingFromPath = useCallback(() => {
    const fromParam = new URLSearchParams(locationSearch).get("from");
    if (!fromParam || !fromParam.startsWith("/")) {
      return "/tasks";
    }
    const fromPathname = fromParam.split(/[?#]/, 1)[0] ?? fromParam;
    if (!isProtectedPath(fromPathname) || fromPathname === "/settings") {
      return "/tasks";
    }
    return fromParam;
  }, [locationSearch]);
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
      const fromPath = resolveDraftPendingFromPath();
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
      if (routeView !== expectedDetailView) {
        navigateToPath(expectedPath, true);
        return;
      }
      invalidRouteRef.current = null;
    }
  }, [
    snapshot,
    locationPathname,
    locationSearch,
    projects,
    navigateToPath,
    projectsPaginationStatus,
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
