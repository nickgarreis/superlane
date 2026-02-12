import { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { pathToView, viewToPath } from "../../lib/routing";
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
  locationPathname: string;
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
  locationPathname,
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

  const handleSearchShortcut = useCallback(
    (event: Event) => {
      if (!(event instanceof KeyboardEvent)) {
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    },
    [openSearch],
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
    listener: handleSearchShortcut,
  });
  useEffect(() => {
    if (!snapshot) {
      return;
    }
    const routeView = pathToView(locationPathname);
    if (!routeView) {
      invalidRouteRef.current = null;
      return;
    }
    const projectRouteLoading =
      (routeView.startsWith("project:") ||
        routeView.startsWith("archive-project:")) &&
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
    }
  }, [
    snapshot,
    locationPathname,
    projects,
    navigateToPath,
    projectsPaginationStatus,
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
