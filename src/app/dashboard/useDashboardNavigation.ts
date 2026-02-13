import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import {
  isProtectedPath,
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
import {
  readPersistedDashboardWorkspaceSlug,
  writeDashboardWorkspaceSlug,
} from "./storage";
type UseDashboardNavigationArgs = {
  preloadSearchPopup: () => void;
  preloadCreateProjectPopup: () => void;
  preloadCreateWorkspacePopup: () => void;
  preloadSettingsPopup: () => void;
};

type DraftPendingRouteKind = "draft" | "pending";
type DraftPendingStatus = "Draft" | "Review";

const WORKSPACE_SLUG_QUERY_KEY = "workspace";
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
const isValidWorkspaceSlug = (value: string): boolean =>
  /^[a-z0-9-]+$/.test(value);
const readPersistedWorkspaceSlug = (
  searchParams: URLSearchParams,
): string | null => {
  const fromQuery = searchParams.get(WORKSPACE_SLUG_QUERY_KEY)?.trim();
  if (fromQuery && isValidWorkspaceSlug(fromQuery)) {
    return fromQuery;
  }
  return readPersistedDashboardWorkspaceSlug();
};
export type DashboardNavigationState = {
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  searchParams: URLSearchParams;
  currentView: AppView;
  settingsTab: SettingsTab;
  settingsFocusTarget: SettingsFocusTarget | null;
  isSettingsOpen: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isInboxOpen: boolean;
  isSearchOpen: boolean;
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>;
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: Dispatch<SetStateAction<boolean>>;
  isCreateWorkspaceOpen: boolean;
  setIsCreateWorkspaceOpen: Dispatch<SetStateAction<boolean>>;
  isCompletedProjectsOpen: boolean;
  completedProjectDetailId: string | null;
  isDraftPendingProjectsOpen: boolean;
  draftPendingProjectDetailId: string | null;
  draftPendingProjectDetailKind: DraftPendingRouteKind | null;
  highlightedArchiveProjectId: string | null;
  setHighlightedArchiveProjectId: Dispatch<SetStateAction<string | null>>;
  pendingHighlight: PendingHighlight | null;
  setPendingHighlight: Dispatch<SetStateAction<PendingHighlight | null>>;
  editProjectId: string | null;
  setEditProjectId: Dispatch<SetStateAction<string | null>>;
  editDraftData: ProjectDraftData | null;
  setEditDraftData: Dispatch<SetStateAction<ProjectDraftData | null>>;
  reviewProject: ProjectData | null;
  setReviewProject: Dispatch<SetStateAction<ProjectData | null>>;
  activeWorkspaceSlug: string | null;
  setActiveWorkspaceSlug: Dispatch<SetStateAction<string | null>>;
  navigateView: (view: AppView) => void;
  navigateViewPreservingInbox: (view: AppView) => void;
  openInbox: () => void;
  closeInbox: () => void;
  openSearch: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openCreateWorkspace: () => void;
  closeCreateWorkspace: () => void;
  openCompletedProjectsPopup: () => void;
  closeCompletedProjectsPopup: () => void;
  openCompletedProjectDetail: (
    projectId: string,
    options?: { replace?: boolean; from?: string },
  ) => void;
  backToCompletedProjectsList: () => void;
  openDraftPendingProjectsPopup: () => void;
  closeDraftPendingProjectsPopup: () => void;
  openDraftPendingProjectDetail: (
    projectId: string,
    status: DraftPendingStatus,
    options?: { replace?: boolean },
  ) => void;
  backToDraftPendingProjectsList: () => void;
  handleOpenSettingsWithFocus: (args: {
    tab?: SettingsTab;
    focus?: SettingsFocusTarget | null;
  }) => void;
  handleOpenSettings: (tab?: SettingsTab) => void;
  handleCloseSettings: () => void;
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
  useEffect(() => {
    writeDashboardWorkspaceSlug(activeWorkspaceSlug);
  }, [activeWorkspaceSlug]);
  const routeView = useMemo(
    () => pathToView(location.pathname),
    [location.pathname],
  );
  const currentView = useMemo<AppView>(() => {
    if (routeView) {
      if (
        routeView === "completed" ||
        routeView.startsWith("completed-project:")
      ) {
        const completedProjectId = routeView.startsWith("completed-project:")
          ? routeView.slice("completed-project:".length)
          : null;
        const fromParam = searchParams.get("from");
        if (fromParam && fromParam.startsWith("/")) {
          const fromPathname = fromParam.split(/[?#]/, 1)[0] ?? fromParam;
          const fromView = pathToView(fromPathname);
          const fromIsSameCompletedProject =
            completedProjectId != null &&
            fromView === `project:${completedProjectId}`;
          if (
            fromView &&
            fromView !== "completed" &&
            !fromView.startsWith("completed-project:") &&
            !fromIsSameCompletedProject
          ) {
            return fromView;
          }
        }
        return "tasks";
      }
      return routeView;
    }
    if (location.pathname === "/settings") {
      const fromParam = searchParams.get("from");
      if (fromParam && fromParam.startsWith("/")) {
        const fromPathname = fromParam.split(/[?#]/, 1)[0] ?? fromParam;
        const derivedView = pathToView(fromPathname);
        if (derivedView) {
          return derivedView;
        }
      }
    }
    return "tasks";
  }, [location.pathname, routeView, searchParams]);
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
      options?: { allowCompleted?: boolean },
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
      return candidate;
    },
    [],
  );
  const currentLocationPath = useMemo(
    () => `${location.pathname}${location.search}${location.hash}`,
    [location.hash, location.pathname, location.search],
  );
  const resolveDraftPendingFromPath = useCallback((): string => {
    const fromParam = toProtectedFromPath(searchParams.get("from"));
    if (fromParam) {
      return fromParam;
    }
    if (
      isProtectedPath(location.pathname) &&
      location.pathname !== "/settings" &&
      !isDraftPendingPath(location.pathname)
    ) {
      return currentLocationPath;
    }
    return "/tasks";
  }, [currentLocationPath, location.pathname, searchParams, toProtectedFromPath]);
  const resolveCompletedFromPath = useCallback(
    (options?: {
      from?: string | null;
      fallback?: string;
      completedProjectId?: string | null;
    }): string => {
      const toValidCompletedFromPath = (
        candidate: string | null | undefined,
      ): string | null => {
        const protectedPath = toProtectedFromPath(candidate, {
          allowCompleted: false,
        });
        if (!protectedPath) {
          return null;
        }
        if (!options?.completedProjectId) {
          return protectedPath;
        }
        const pathOnly = protectedPath.split(/[?#]/, 1)[0] ?? protectedPath;
        const fromView = pathToView(pathOnly);
        if (fromView === `project:${options.completedProjectId}`) {
          return null;
        }
        return protectedPath;
      };
      const explicitFromCandidate = options?.from;
      const explicitFrom = toValidCompletedFromPath(explicitFromCandidate);
      if (explicitFrom) {
        return explicitFrom;
      }
      if (explicitFromCandidate != null) {
        const fallbackFromExplicit = toValidCompletedFromPath(options?.fallback);
        return fallbackFromExplicit ?? "/tasks";
      }
      const fromParam = toValidCompletedFromPath(searchParams.get("from"));
      if (fromParam) {
        return fromParam;
      }
      if (
        isProtectedPath(location.pathname) &&
        location.pathname !== "/settings" &&
        !isCompletedPath(location.pathname)
      ) {
        return currentLocationPath;
      }
      const fallback = toValidCompletedFromPath(options?.fallback);
      return fallback ?? "/tasks";
    },
    [currentLocationPath, location.pathname, searchParams, toProtectedFromPath],
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
  const resolveSettingsFromPath = useCallback((): string => {
    if (
      isProtectedPath(location.pathname) &&
      location.pathname !== "/settings"
    ) {
      return currentLocationPath;
    }
    const fromParam = toProtectedFromPath(searchParams.get("from"));
    return fromParam ?? "/tasks";
  }, [currentLocationPath, location.pathname, searchParams, toProtectedFromPath]);
  const navigateView = useCallback(
    (view: AppView) => {
      const nextPath = viewToPath(view);
      setIsInboxOpen(false);
      if (location.pathname === nextPath) {
        return;
      }
      navigate(nextPath);
    },
    [location.pathname, navigate],
  );
  const navigateViewPreservingInbox = useCallback(
    (view: AppView) => {
      const nextPath = viewToPath(view);
      if (location.pathname === nextPath) {
        return;
      }
      navigate(nextPath);
    },
    [location.pathname, navigate],
  );
  const openInbox = useCallback(() => {
    setIsSidebarOpen(true);
    setIsInboxOpen(true);
  }, []);
  const closeInbox = useCallback(() => {
    setIsInboxOpen(false);
  }, []);
  const openSearch = useCallback(() => {
    preloadSearchPopup();
    setIsSearchOpen(true);
  }, [preloadSearchPopup]);
  const openCreateProject = useCallback(() => {
    preloadCreateProjectPopup();
    setIsCreateProjectOpen(true);
  }, [preloadCreateProjectPopup]);
  const closeCreateProject = useCallback(() => {
    setIsCreateProjectOpen(false);
    setEditProjectId(null);
    setEditDraftData(null);
    setReviewProject(null);
  }, []);
  const openCreateWorkspace = useCallback(() => {
    preloadCreateWorkspacePopup();
    setIsCreateWorkspaceOpen(true);
  }, [preloadCreateWorkspacePopup]);
  const closeCreateWorkspace = useCallback(() => {
    setIsCreateWorkspaceOpen(false);
  }, []);
  const openCompletedProjectsPopup = useCallback(() => {
    const from = resolveCompletedFromPath();
    const params = new URLSearchParams({ from });
    const nextPath = `${COMPLETED_PATH}?${params.toString()}`;
    setIsInboxOpen(false);
    if (currentLocationPath === nextPath) {
      return;
    }
    navigate(nextPath);
  }, [currentLocationPath, navigate, resolveCompletedFromPath]);
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
      setIsInboxOpen(false);
      if (currentLocationPath === nextPath) {
        return;
      }
      navigate(nextPath, { replace: options?.replace });
    },
    [currentLocationPath, navigate, resolveCompletedFromPath],
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
    setIsInboxOpen(false);
    navigate(`${DRAFTS_PATH}?${params.toString()}`);
  }, [navigate, resolveDraftPendingFromPath]);
  const closeDraftPendingProjectsPopup = useCallback(() => {
    const destination = resolveDraftPendingFromPath();
    setIsInboxOpen(false);
    if (currentLocationPath === destination) {
      return;
    }
    navigate(destination, { replace: true });
  }, [currentLocationPath, navigate, resolveDraftPendingFromPath]);
  const openDraftPendingProjectDetail = useCallback(
    (
      projectId: string,
      status: DraftPendingStatus,
      options?: { replace?: boolean },
    ) => {
      const detailView: AppView =
        status === "Draft"
          ? `draft-project:${projectId}`
          : `pending-project:${projectId}`;
      const from = resolveDraftPendingFromPath();
      const params = new URLSearchParams({ from });
      const nextPath = `${viewToPath(detailView)}?${params.toString()}`;
      setIsInboxOpen(false);
      if (currentLocationPath === nextPath) {
        return;
      }
      navigate(nextPath, { replace: options?.replace });
    },
    [currentLocationPath, navigate, resolveDraftPendingFromPath],
  );
  const backToDraftPendingProjectsList = useCallback(() => {
    const from = resolveDraftPendingFromPath();
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
      navigate(`/settings?${params.toString()}`);
    },
    [navigate, preloadSettingsPopup, resolveSettingsFromPath],
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
