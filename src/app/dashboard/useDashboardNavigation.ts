import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  pathToView,
  viewToPath,
  type AppView,
} from "../lib/routing";
import {
  applySettingsFocusTargetToSearchParams,
  parseSettingsTab,
  type PendingHighlight,
  parseSettingsFocusTarget,
  type SettingsFocusTarget,
  type SettingsTab,
} from "./types";
import type { ProjectData, ProjectDraftData } from "../types";
import { writeDashboardWorkspaceSlug } from "./storage";
import {
  COMPLETED_PATH,
  DRAFTS_PATH,
  DraftPendingRouteKind,
  DraftPendingStatus,
  deriveCurrentView,
  isMobileViewport,
  readPersistedWorkspaceSlug,
  resolveCompletedFromPathValue,
  resolveDraftPendingFromPathValue,
  resolveSettingsFromPathValue,
  toProtectedFromPathCandidate,
} from "./navigationHelpers";
import type { DashboardNavigationState } from "./navigationTypes";
type UseDashboardNavigationArgs = {
  preloadSearchPopup: () => void;
  preloadCreateProjectPopup: () => void;
  preloadCreateWorkspacePopup: () => void;
  preloadSettingsPopup: () => void;
};
export const useDashboardNavigation = ({
  preloadSearchPopup,
  preloadCreateProjectPopup,
  preloadCreateWorkspacePopup,
  preloadSettingsPopup,
}: UseDashboardNavigationArgs): DashboardNavigationState => {
  const navigate = useNavigate();
  const location = useLocation();
  const [rawSearchParams] = useSearchParams();
  const searchParams = useMemo(
    () => new URLSearchParams(rawSearchParams),
    [rawSearchParams],
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => !isMobileViewport());
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [highlightedArchiveProjectId, setHighlightedArchiveProjectId] =
    useState<string | null>(null);
  const [pendingHighlight, setPendingHighlight] =
    useState<PendingHighlight | null>(null);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editDraftData, setEditDraftData] = useState<ProjectDraftData | null>(
    null,
  );
  const [reviewProject, setReviewProject] = useState<ProjectData | null>(null);
  const [activeWorkspaceSlug, setActiveWorkspaceSlug] = useState<string | null>(
    () => readPersistedWorkspaceSlug(searchParams),
  );
  const shouldUseMobileNav = useCallback(() => isMobileViewport(), []);
  const closeSidebarForMobile = useCallback(() => {
    if (!shouldUseMobileNav()) {
      return;
    }
    setIsSidebarOpen(false);
  }, [shouldUseMobileNav]);
  useEffect(() => {
    writeDashboardWorkspaceSlug(activeWorkspaceSlug);
  }, [activeWorkspaceSlug]);
  const routeView = useMemo(
    () => pathToView(location.pathname),
    [location.pathname],
  );
  const currentView = useMemo<AppView>(
    () =>
      deriveCurrentView({
        routeView,
        pathname: location.pathname,
        searchParams,
      }),
    [location.pathname, routeView, searchParams],
  );
  const settingsTab = useMemo(
    () => parseSettingsTab(searchParams.get("tab")),
    [searchParams],
  );
  const settingsFocusTarget = useMemo(
    () => parseSettingsFocusTarget(searchParams),
    [searchParams],
  );
  const isSettingsOpen = location.pathname === "/settings";
  const toProtectedFromPath = useCallback(
    (
      candidate: string | null | undefined,
      options?: { allowCompleted?: boolean; allowDraftPending?: boolean },
    ): string | null =>
      toProtectedFromPathCandidate(candidate, options),
    [],
  );
  const currentLocationPath = useMemo(
    () => `${location.pathname}${location.search}${location.hash}`,
    [location.hash, location.pathname, location.search],
  );
  const resolveDraftPendingFromPath = useCallback(
    (options?: {
      from?: string | null;
      fallback?: string;
      draftPendingProjectId?: string | null;
    }): string =>
      resolveDraftPendingFromPathValue({
        searchParams,
        locationPathname: location.pathname,
        currentLocationPath,
        options,
      }),
    [currentLocationPath, location.pathname, searchParams],
  );
  const resolveCompletedFromPath = useCallback(
    (options?: {
      from?: string | null;
      fallback?: string;
      completedProjectId?: string | null;
    }): string =>
      resolveCompletedFromPathValue({
        searchParams,
        locationPathname: location.pathname,
        currentLocationPath,
        options,
      }),
    [currentLocationPath, location.pathname, searchParams],
  );
  const completedProjectDetailId = useMemo(() => {
    if (routeView && routeView.startsWith("completed-project:")) {
      return routeView.slice("completed-project:".length);
    }
    return null;
  }, [routeView]);
  const isCompletedProjectsOpen = useMemo(
    () =>
      routeView === "completed" ||
      Boolean(routeView?.startsWith("completed-project:")),
    [routeView],
  );
  const draftPendingProjectDetailId = useMemo(() => {
    if (routeView && routeView.startsWith("draft-project:")) {
      return routeView.slice("draft-project:".length);
    }
    if (routeView && routeView.startsWith("pending-project:")) {
      return routeView.slice("pending-project:".length);
    }
    return null;
  }, [routeView]);
  const draftPendingProjectDetailKind = useMemo<DraftPendingRouteKind | null>(
    () => {
      if (
        routeView === "drafts" ||
        Boolean(routeView?.startsWith("draft-project:"))
      ) {
        return "draft";
      }
      if (
        routeView === "pending" ||
        Boolean(routeView?.startsWith("pending-project:"))
      ) {
        return "pending";
      }
      return null;
    },
    [routeView],
  );
  const isDraftPendingProjectsOpen = draftPendingProjectDetailKind != null;
  const resolveSettingsFromPath = useCallback(
    (): string =>
      resolveSettingsFromPathValue({
        locationPathname: location.pathname,
        currentLocationPath,
        searchParams,
      }),
    [currentLocationPath, location.pathname, searchParams],
  );
  const navigateView = useCallback(
    (view: AppView) => {
      const nextPath = viewToPath(view);
      closeSidebarForMobile();
      setIsInboxOpen(false);
      if (location.pathname === nextPath) {
        return;
      }
      navigate(nextPath);
    },
    [closeSidebarForMobile, location.pathname, navigate],
  );
  const navigateViewPreservingInbox = useCallback(
    (view: AppView) => {
      const nextPath = viewToPath(view);
      closeSidebarForMobile();
      if (location.pathname === nextPath) {
        return;
      }
      navigate(nextPath);
    },
    [closeSidebarForMobile, location.pathname, navigate],
  );
  const openInbox = useCallback(() => {
    if (!shouldUseMobileNav()) {
      setIsSidebarOpen(true);
    }
    setIsInboxOpen(true);
  }, [shouldUseMobileNav]);
  const closeInbox = useCallback(() => {
    setIsInboxOpen(false);
  }, []);
  const openSearch = useCallback(() => {
    preloadSearchPopup();
    closeSidebarForMobile();
    setIsSearchOpen(true);
  }, [closeSidebarForMobile, preloadSearchPopup]);
  const openCreateProject = useCallback(() => {
    preloadCreateProjectPopup();
    closeSidebarForMobile();
    setIsCreateProjectOpen(true);
  }, [closeSidebarForMobile, preloadCreateProjectPopup]);
  const closeCreateProject = useCallback(() => {
    setIsCreateProjectOpen(false);
    setEditProjectId(null);
    setEditDraftData(null);
    setReviewProject(null);
  }, []);
  const openCreateWorkspace = useCallback(() => {
    preloadCreateWorkspacePopup();
    closeSidebarForMobile();
    setIsCreateWorkspaceOpen(true);
  }, [closeSidebarForMobile, preloadCreateWorkspacePopup]);
  const closeCreateWorkspace = useCallback(() => {
    setIsCreateWorkspaceOpen(false);
  }, []);
  const openCompletedProjectsPopup = useCallback(() => {
    const from = resolveCompletedFromPath();
    const params = new URLSearchParams({ from });
    const nextPath = `${COMPLETED_PATH}?${params.toString()}`;
    closeSidebarForMobile();
    setIsInboxOpen(false);
    if (currentLocationPath === nextPath) {
      return;
    }
    navigate(nextPath);
  }, [
    closeSidebarForMobile,
    currentLocationPath,
    navigate,
    resolveCompletedFromPath,
  ]);
  const closeCompletedProjectsPopup = useCallback(() => {
    const destination = resolveCompletedFromPath({
      completedProjectId: completedProjectDetailId,
    });
    setIsInboxOpen(false);
    if (currentLocationPath === destination) {
      return;
    }
    navigate(destination, { replace: true });
  }, [
    completedProjectDetailId,
    currentLocationPath,
    navigate,
    resolveCompletedFromPath,
  ]);
  const openCompletedProjectDetail = useCallback(
    (
      projectId: string,
      options?: { replace?: boolean; from?: string },
    ) => {
      const from = resolveCompletedFromPath({
        from: options?.from,
        completedProjectId: projectId,
      });
      const params = new URLSearchParams({ from });
      const detailView: AppView = `completed-project:${projectId}`;
      const nextPath = `${viewToPath(detailView)}?${params.toString()}`;
      closeSidebarForMobile();
      setIsInboxOpen(false);
      if (currentLocationPath === nextPath) {
        return;
      }
      navigate(nextPath, { replace: options?.replace });
    },
    [
      closeSidebarForMobile,
      currentLocationPath,
      navigate,
      resolveCompletedFromPath,
    ],
  );
  const backToCompletedProjectsList = useCallback(() => {
    const from = resolveCompletedFromPath({
      completedProjectId: completedProjectDetailId,
    });
    const params = new URLSearchParams({ from });
    const nextPath = `${COMPLETED_PATH}?${params.toString()}`;
    setIsInboxOpen(false);
    if (currentLocationPath === nextPath) {
      return;
    }
    navigate(nextPath, { replace: true });
  }, [
    completedProjectDetailId,
    currentLocationPath,
    navigate,
    resolveCompletedFromPath,
  ]);
  const openDraftPendingProjectsPopup = useCallback(() => {
    const from = resolveDraftPendingFromPath();
    const params = new URLSearchParams({ from });
    const nextPath = `${DRAFTS_PATH}?${params.toString()}`;
    closeSidebarForMobile();
    setIsInboxOpen(false);
    if (currentLocationPath === nextPath) {
      return;
    }
    navigate(nextPath);
  }, [
    closeSidebarForMobile,
    currentLocationPath,
    navigate,
    resolveDraftPendingFromPath,
  ]);
  const closeDraftPendingProjectsPopup = useCallback(() => {
    const destination = resolveDraftPendingFromPath({
      draftPendingProjectId: draftPendingProjectDetailId,
    });
    setIsInboxOpen(false);
    if (currentLocationPath === destination) {
      return;
    }
    navigate(destination, { replace: true });
  }, [
    currentLocationPath,
    draftPendingProjectDetailId,
    navigate,
    resolveDraftPendingFromPath,
  ]);
  const openDraftPendingProjectDetail = useCallback(
    (
      projectId: string,
      status: DraftPendingStatus,
      options?: { replace?: boolean; from?: string },
    ) => {
      const detailView: AppView =
        status === "Draft"
          ? `draft-project:${projectId}`
          : `pending-project:${projectId}`;
      const from = resolveDraftPendingFromPath({
        from: options?.from,
        draftPendingProjectId: projectId,
      });
      const params = new URLSearchParams({ from });
      const nextPath = `${viewToPath(detailView)}?${params.toString()}`;
      closeSidebarForMobile();
      setIsInboxOpen(false);
      if (currentLocationPath === nextPath) {
        return;
      }
      navigate(nextPath, { replace: options?.replace });
    },
    [
      closeSidebarForMobile,
      currentLocationPath,
      navigate,
      resolveDraftPendingFromPath,
    ],
  );
  const backToDraftPendingProjectsList = useCallback(() => {
    const from = resolveDraftPendingFromPath({
      draftPendingProjectId: draftPendingProjectDetailId,
    });
    const listView: AppView =
      draftPendingProjectDetailKind === "pending" ? "pending" : "drafts";
    const params = new URLSearchParams({ from });
    const nextPath = `${viewToPath(listView)}?${params.toString()}`;
    setIsInboxOpen(false);
    if (currentLocationPath === nextPath) {
      return;
    }
    navigate(nextPath, { replace: true });
  }, [
    currentLocationPath,
    draftPendingProjectDetailId,
    draftPendingProjectDetailKind,
    navigate,
    resolveDraftPendingFromPath,
  ]);
  const handleOpenSettingsWithFocus = useCallback(
    ({
      tab = "Account",
      focus = null,
    }: {
      tab?: SettingsTab;
      focus?: SettingsFocusTarget | null;
    }) => {
      preloadSettingsPopup();
      const params = new URLSearchParams({
        tab,
        from: resolveSettingsFromPath(),
      });
      applySettingsFocusTargetToSearchParams(params, focus);
      closeSidebarForMobile();
      navigate(`/settings?${params.toString()}`);
    },
    [closeSidebarForMobile, navigate, preloadSettingsPopup, resolveSettingsFromPath],
  );
  const handleOpenSettings = useCallback(
    (tab: SettingsTab = "Account") => {
      handleOpenSettingsWithFocus({ tab });
    },
    [handleOpenSettingsWithFocus],
  );
  const handleCloseSettings = useCallback(() => {
    const fromParam = toProtectedFromPath(searchParams.get("from"));
    const destination = fromParam ?? "/tasks";
    if (location.pathname === destination) {
      return;
    }
    navigate(destination);
  }, [location.pathname, navigate, searchParams, toProtectedFromPath]);
  return {
    location,
    navigate,
    searchParams,
    currentView,
    settingsTab,
    settingsFocusTarget,
    isSettingsOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isInboxOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    isCreateWorkspaceOpen,
    setIsCreateWorkspaceOpen,
    isCompletedProjectsOpen,
    completedProjectDetailId,
    isDraftPendingProjectsOpen,
    draftPendingProjectDetailId,
    draftPendingProjectDetailKind,
    highlightedArchiveProjectId,
    setHighlightedArchiveProjectId,
    pendingHighlight,
    setPendingHighlight,
    editProjectId,
    setEditProjectId,
    editDraftData,
    setEditDraftData,
    reviewProject,
    setReviewProject,
    activeWorkspaceSlug,
    setActiveWorkspaceSlug,
    navigateView,
    navigateViewPreservingInbox,
    openInbox,
    closeInbox,
    openSearch,
    openCreateProject,
    closeCreateProject,
    openCreateWorkspace,
    closeCreateWorkspace,
    openCompletedProjectsPopup,
    closeCompletedProjectsPopup,
    openCompletedProjectDetail,
    backToCompletedProjectsList,
    openDraftPendingProjectsPopup,
    closeDraftPendingProjectsPopup,
    openDraftPendingProjectDetail,
    backToDraftPendingProjectsList,
    handleOpenSettingsWithFocus,
    handleOpenSettings,
    handleCloseSettings,
  };
};
