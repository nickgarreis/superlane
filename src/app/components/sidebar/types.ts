import type { AppView } from "../../lib/routing";
import type { ProjectData, ViewerIdentity, Workspace } from "../../types";
export type SidebarWorkspaceSectionProps = {
  activeWorkspace?: Workspace;
  workspaces: Workspace[];
  onSwitchWorkspace: (workspaceSlug: string) => void;
  onCreateWorkspace: () => void;
  canCreateWorkspace: boolean;
};
export type SidebarPrimaryActionsProps = {
  currentView?: string;
  inboxUnreadCount: number;
  onSearch: () => void;
  onSearchIntent?: () => void;
  onNavigate: (view: AppView) => void;
  onOpenInbox: () => void;
  onOpenCreateProject: () => void;
  onOpenCreateProjectIntent?: () => void;
};
export type SidebarProjectsSectionProps = {
  projects: Record<string, ProjectData>;
  approvedSidebarProjectIds: string[];
  currentView?: string;
  onNavigate: (view: AppView) => void;
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
  onOpenCompletedProjectsPopup: () => void;
  onOpenDraftPendingProjectsPopup: () => void;
};
export type SidebarProfileMenuProps = {
  viewerIdentity: ViewerIdentity;
  onOpenSettings: (
    tab?: "Account" | "Notifications" | "Company" | "Workspace" | "Billing",
  ) => void;
  onOpenSettingsIntent?: () => void;
  onLogout: () => void;
};
