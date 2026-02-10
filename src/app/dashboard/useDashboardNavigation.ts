import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { isProtectedPath, pathToView, viewToPath, type AppView } from "../lib/routing";
import { parseSettingsTab, type PendingHighlight, type SettingsTab } from "./types";
import type { ProjectData, ProjectDraftData } from "../types";

type UseDashboardNavigationArgs = {
  preloadSearchPopup: () => void;
  preloadCreateProjectPopup: () => void;
  preloadCreateWorkspacePopup: () => void;
  preloadSettingsPopup: () => void;
};

const ACTIVE_WORKSPACE_SLUG_STORAGE_KEY = "dashboard.activeWorkspaceSlug";
const WORKSPACE_SLUG_QUERY_KEY = "workspace";

const isValidWorkspaceSlug = (value: string): boolean => /^[a-z0-9-]+$/.test(value);

const readPersistedWorkspaceSlug = (searchParams: URLSearchParams): string | null => {
  const fromQuery = searchParams.get(WORKSPACE_SLUG_QUERY_KEY)?.trim();
  if (fromQuery && isValidWorkspaceSlug(fromQuery)) {
    return fromQuery;
  }

  if (typeof window === "undefined") {
    return null;
  }

  const fromStorage = window.localStorage.getItem(ACTIVE_WORKSPACE_SLUG_STORAGE_KEY)?.trim();
  if (fromStorage && isValidWorkspaceSlug(fromStorage)) {
    return fromStorage;
  }

  return null;
};

export type DashboardNavigationState = {
  location: ReturnType<typeof useLocation>;
  navigate: ReturnType<typeof useNavigate>;
  searchParams: URLSearchParams;
  currentView: AppView;
  settingsTab: SettingsTab;
  isSettingsOpen: boolean;
  isSidebarOpen: boolean;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  isSearchOpen: boolean;
  setIsSearchOpen: Dispatch<SetStateAction<boolean>>;
  isCreateProjectOpen: boolean;
  setIsCreateProjectOpen: Dispatch<SetStateAction<boolean>>;
  isCreateWorkspaceOpen: boolean;
  setIsCreateWorkspaceOpen: Dispatch<SetStateAction<boolean>>;
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
  openSearch: () => void;
  openCreateProject: () => void;
  closeCreateProject: () => void;
  openCreateWorkspace: () => void;
  closeCreateWorkspace: () => void;
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

  const searchParams = useMemo(() => new URLSearchParams(rawSearchParams), [rawSearchParams]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [highlightedArchiveProjectId, setHighlightedArchiveProjectId] = useState<string | null>(null);
  const [pendingHighlight, setPendingHighlight] = useState<PendingHighlight | null>(null);
  const [editProjectId, setEditProjectId] = useState<string | null>(null);
  const [editDraftData, setEditDraftData] = useState<ProjectDraftData | null>(null);
  const [reviewProject, setReviewProject] = useState<ProjectData | null>(null);
  const [activeWorkspaceSlug, setActiveWorkspaceSlug] = useState<string | null>(() =>
    readPersistedWorkspaceSlug(searchParams),
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (activeWorkspaceSlug) {
      window.localStorage.setItem(ACTIVE_WORKSPACE_SLUG_STORAGE_KEY, activeWorkspaceSlug);
      return;
    }
    window.localStorage.removeItem(ACTIVE_WORKSPACE_SLUG_STORAGE_KEY);
  }, [activeWorkspaceSlug]);

  const currentView = useMemo<AppView>(() => {
    const directView = pathToView(location.pathname);
    if (directView) {
      return directView;
    }

    if (location.pathname === "/settings") {
      const fromParam = searchParams.get("from");
      if (fromParam && fromParam.startsWith("/")) {
        const derivedView = pathToView(fromParam);
        if (derivedView) {
          return derivedView;
        }
      }
    }

    return "tasks";
  }, [location.pathname, searchParams]);

  const settingsTab = useMemo(() => parseSettingsTab(searchParams.get("tab")), [searchParams]);
  const isSettingsOpen = location.pathname === "/settings";

  const toProtectedFromPath = useCallback((candidate: string | null | undefined): string | null => {
    if (!candidate || !candidate.startsWith("/")) {
      return null;
    }
    if (!isProtectedPath(candidate) || candidate === "/settings") {
      return null;
    }
    return candidate;
  }, []);

  const resolveSettingsFromPath = useCallback((): string => {
    if (isProtectedPath(location.pathname) && location.pathname !== "/settings") {
      return location.pathname;
    }

    const fromParam = toProtectedFromPath(searchParams.get("from"));
    return fromParam ?? "/tasks";
  }, [location.pathname, searchParams, toProtectedFromPath]);

  const navigateView = useCallback((view: AppView) => {
    navigate(viewToPath(view));
  }, [navigate]);

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

  const handleOpenSettings = useCallback((tab: SettingsTab = "Account") => {
    preloadSettingsPopup();
    const params = new URLSearchParams({
      tab,
      from: resolveSettingsFromPath(),
    });
    navigate(`/settings?${params.toString()}`);
  }, [navigate, preloadSettingsPopup, resolveSettingsFromPath]);

  const handleCloseSettings = useCallback(() => {
    const fromParam = toProtectedFromPath(searchParams.get("from"));
    navigate(fromParam ?? "/tasks");
  }, [navigate, searchParams, toProtectedFromPath]);

  return {
    location,
    navigate,
    searchParams,
    currentView,
    settingsTab,
    isSettingsOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCreateProjectOpen,
    setIsCreateProjectOpen,
    isCreateWorkspaceOpen,
    setIsCreateWorkspaceOpen,
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
    openSearch,
    openCreateProject,
    closeCreateProject,
    openCreateWorkspace,
    closeCreateWorkspace,
    handleOpenSettings,
    handleCloseSettings,
  };
};
