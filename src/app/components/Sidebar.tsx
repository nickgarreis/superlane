import React from "react";
import type { AppView } from "../lib/routing";
import type { ProjectData, ViewerIdentity, Workspace } from "../types";
import { SidebarPrimaryActions } from "./sidebar/SidebarPrimaryActions";
import { SidebarProfileMenu } from "./sidebar/SidebarProfileMenu";
import { SidebarProjectsSection } from "./sidebar/SidebarProjectsSection";
import { SidebarWorkspaceSwitcher } from "./sidebar/SidebarWorkspaceSwitcher";
type SidebarProps = {
  onNavigate: (view: AppView) => void;
  onSearch: () => void;
  onSearchIntent?: () => void;
  onOpenCreateProject: () => void;
  onOpenCreateProjectIntent?: () => void;
  currentView?: string;
  projects: Record<string, ProjectData>;
  viewerIdentity: ViewerIdentity;
  activeWorkspace?: Workspace;
  workspaces: Workspace[];
  onSwitchWorkspace: (workspaceSlug: string) => void;
  onCreateWorkspace: () => void;
  canCreateWorkspace: boolean;
  onOpenSettings: (
    tab?: "Account" | "Notifications" | "Company" | "Billing",
  ) => void;
  onOpenSettingsIntent?: () => void;
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
  onOpenCompletedProjectsPopup: () => void;
  onLogout: () => void;
};
export function Sidebar({
  onNavigate,
  onSearch,
  onSearchIntent,
  onOpenCreateProject,
  onOpenCreateProjectIntent,
  currentView,
  projects,
  viewerIdentity,
  activeWorkspace,
  workspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
  canCreateWorkspace,
  onOpenSettings,
  onOpenSettingsIntent,
  onEditProject,
  onViewReviewProject,
  onOpenCompletedProjectsPopup,
  onLogout,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-full bg-transparent px-3 py-4 select-none">
      <SidebarWorkspaceSwitcher
        activeWorkspace={activeWorkspace}
        workspaces={workspaces}
        onSwitchWorkspace={onSwitchWorkspace}
        onCreateWorkspace={onCreateWorkspace}
        canCreateWorkspace={canCreateWorkspace}
      />
      <SidebarPrimaryActions
        currentView={currentView}
        onSearch={onSearch}
        onSearchIntent={onSearchIntent}
        onNavigate={onNavigate}
        onOpenCreateProject={onOpenCreateProject}
        onOpenCreateProjectIntent={onOpenCreateProjectIntent}
      />
      <SidebarProjectsSection
        projects={projects}
        currentView={currentView}
        onNavigate={onNavigate}
        onEditProject={onEditProject}
        onViewReviewProject={onViewReviewProject}
        onOpenCompletedProjectsPopup={onOpenCompletedProjectsPopup}
      />
      <SidebarProfileMenu
        viewerIdentity={viewerIdentity}
        onOpenSettings={onOpenSettings}
        onOpenSettingsIntent={onOpenSettingsIntent}
        onLogout={onLogout}
      />
    </div>
  );
}
