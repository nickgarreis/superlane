import type { Dispatch, SetStateAction } from "react";
import type { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { AppView } from "../lib/routing";
import type {
  ProjectData,
  ProjectFileData,
  Task,
  WorkspaceActivity,
  ViewerIdentity,
  Workspace,
  WorkspaceMember,
} from "../types";
import type {
  SnapshotProject,
  SnapshotTask,
  SnapshotWorkspace,
  SnapshotWorkspaceFile,
} from "../lib/mappers";
import { useDashboardController } from "./useDashboardController";
import type { PendingHighlight, SettingsTab } from "./types";

export type UseDashboardDataArgs = {
  isAuthenticated: boolean;
  activeWorkspaceSlug: string | null;
  setActiveWorkspaceSlug: (slug: string | null) => void;
  isSettingsOpen: boolean;
  settingsTab: SettingsTab;
  isSearchOpen: boolean;
  currentView: AppView;
  completedProjectDetailId: string | null;
  viewerFallback: { name: string; email: string; avatarUrl: string | null };
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setPendingHighlight: Dispatch<SetStateAction<PendingHighlight | null>>;
  navigateView: (view: AppView) => void;
};

export type UseDashboardDataResult = {
  snapshot: ReturnType<typeof useQuery<typeof api.dashboard.getWorkspaceBootstrap>>;
  resolvedWorkspaceSlug: string | null;
  projectsPaginationStatus: ReturnType<
    typeof usePaginatedQuery<typeof api.projects.listForWorkspace>
  >["status"];
  tasksPaginationStatus: ReturnType<
    typeof usePaginatedQuery<typeof api.tasks.listForWorkspace>
  >["status"];
  activitiesPaginationStatus: ReturnType<
    typeof usePaginatedQuery<typeof api.activities.listForWorkspace>
  >["status"];
  loadMoreWorkspaceTasks: ReturnType<
    typeof usePaginatedQuery<typeof api.tasks.listForWorkspace>
  >["loadMore"];
  loadMoreWorkspaceActivities: ReturnType<
    typeof usePaginatedQuery<typeof api.activities.listForWorkspace>
  >["loadMore"];
  workspaceFilesPaginationStatus: ReturnType<
    typeof usePaginatedQuery<typeof api.files.listForWorkspace>
  >["status"];
  loadMoreWorkspaceFiles: ReturnType<
    typeof usePaginatedQuery<typeof api.files.listForWorkspace>
  >["loadMore"];
  projectFilesPaginationStatus: ReturnType<
    typeof usePaginatedQuery<typeof api.files.listForProjectPaginated>
  >["status"];
  loadMoreProjectFiles: ReturnType<
    typeof usePaginatedQuery<typeof api.files.listForProjectPaginated>
  >["loadMore"];
  accountSettings: ReturnType<typeof useQuery<typeof api.settings.getAccountSettings>>;
  notificationSettings: ReturnType<
    typeof useQuery<typeof api.settings.getNotificationPreferences>
  >;
  companySummary: ReturnType<typeof useQuery<typeof api.settings.getCompanySettingsSummary>>;
  companyMembersResult: ReturnType<
    typeof usePaginatedQuery<typeof api.settings.listCompanyMembers>
  >;
  companyPendingInvitationsResult: ReturnType<
    typeof usePaginatedQuery<typeof api.settings.listPendingInvitations>
  >;
  companyBrandAssetsResult: ReturnType<
    typeof usePaginatedQuery<typeof api.settings.listBrandAssets>
  >;
  workspaceMembersResult: ReturnType<
    typeof useQuery<typeof api.collaboration.listWorkspaceMembers>
  >;
  workspaceMembers: WorkspaceMember[];
  usesWorkspaceTaskFeed: boolean;
  usesProjectTaskFeed: boolean;
  viewerIdentity: ViewerIdentity;
  projectsById: Record<string, ProjectData>;
  tasksByProject: Record<string, Task[]>;
  visibleProjectIds: string[];
  workspaces: Workspace[];
  projects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  workspaceActivities: WorkspaceActivity[];
  inboxUnreadCount: number;
  activeWorkspace: Workspace | undefined;
  visibleProjects: Record<string, ProjectData>;
  sidebarVisibleProjects: Record<string, ProjectData>;
  allWorkspaceFiles: ProjectFileData[];
  projectFilesByProject: Record<string, ProjectFileData[]>;
  contentModel: ReturnType<typeof useDashboardController>["contentModel"];
  handleToggleSidebar: ReturnType<typeof useDashboardController>["toggleSidebar"];
  clearPendingHighlight: ReturnType<typeof useDashboardController>["clearPendingHighlight"];
};

export const filterProjectsByWorkspace = (
  projects: Record<string, ProjectData>,
  activeWorkspace: Workspace | undefined,
): Record<string, ProjectData> => {
  if (!activeWorkspace) {
    return {};
  }
  return Object.entries(projects).reduce<Record<string, ProjectData>>(
    (acc, [projectId, project]) => {
      if (project.workspaceId === activeWorkspace.id) {
        acc[projectId] = project;
      }
      return acc;
    },
    {},
  );
};

export type {
  SnapshotProject,
  SnapshotTask,
  SnapshotWorkspace,
  SnapshotWorkspaceFile,
};
