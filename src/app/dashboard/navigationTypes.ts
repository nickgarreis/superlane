import type { Dispatch, SetStateAction } from "react";
import type { Location, NavigateFunction } from "react-router-dom";
import type { AppView } from "../lib/routing";
import type { ProjectData, ProjectDraftData } from "../types";
import type {
  PendingHighlight,
  SettingsFocusTarget,
  SettingsTab,
} from "./types";
import type { DraftPendingRouteKind, DraftPendingStatus } from "./navigationHelpers";

export type DashboardNavigationState = {
  location: Location;
  navigate: NavigateFunction;
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
    options?: { replace?: boolean; from?: string },
  ) => void;
  backToDraftPendingProjectsList: () => void;
  handleOpenSettingsWithFocus: (args: {
    tab?: SettingsTab;
    focus?: SettingsFocusTarget | null;
  }) => void;
  handleOpenSettings: (tab?: SettingsTab) => void;
  handleCloseSettings: () => void;
};
