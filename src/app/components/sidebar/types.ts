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
  onSearch: () => void;
  onSearchIntent?: () => void;
  onNavigate: (view: AppView) => void;
  onOpenCreateProject: () => void;
  onOpenCreateProjectIntent?: () => void;
};
export type SidebarProjectsSectionProps = {
  projects: Record<string, ProjectData>;
  currentView?: string;
  onNavigate: (view: AppView) => void;
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
  onOpenCompletedProjectsPopup: () => void;
};
export type SidebarProfileMenuProps = {
  viewerIdentity: ViewerIdentity;
  onOpenSettings: (
    tab?: "Account" | "Notifications" | "Company" | "Billing",
  ) => void;
  onOpenSettingsIntent?: () => void;
  onLogout: () => void;
};
