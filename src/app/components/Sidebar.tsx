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
  onOpenInbox: () => void;
  inboxUnreadCount: number;
  onOpenCreateProject: () => void;
  onOpenCreateProjectIntent?: () => void;
  currentView?: string;
  projects: Record<string, ProjectData>;
  approvedSidebarProjectIds: string[];
  viewerIdentity: ViewerIdentity;
  activeWorkspace?: Workspace;
  workspaces: Workspace[];
  onSwitchWorkspace: (workspaceSlug: string) => void;
  onCreateWorkspace: () => void;
  canCreateWorkspace: boolean;
  onOpenSettings: (
    tab?: "Account" | "Notifications" | "Company" | "Workspace" | "Billing",
  ) => void;
  onOpenSettingsIntent?: () => void;
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
  onOpenCompletedProjectsPopup: () => void;
  onOpenDraftPendingProjectsPopup: () => void;
  onLogout: () => void;
};
export function Sidebar({
  onNavigate,
  onSearch,
  onSearchIntent,
  onOpenInbox,
  inboxUnreadCount,
  onOpenCreateProject,
  onOpenCreateProjectIntent,
  currentView,
  projects,
  approvedSidebarProjectIds,
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
  onOpenDraftPendingProjectsPopup,
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
        inboxUnreadCount={inboxUnreadCount}
        onSearch={onSearch}
        onSearchIntent={onSearchIntent}
        onNavigate={onNavigate}
        onOpenInbox={onOpenInbox}
        onOpenCreateProject={onOpenCreateProject}
        onOpenCreateProjectIntent={onOpenCreateProjectIntent}
      />
      <SidebarProjectsSection
        projects={projects}
        approvedSidebarProjectIds={approvedSidebarProjectIds}
        currentView={currentView}
        onNavigate={onNavigate}
        onEditProject={onEditProject}
        onViewReviewProject={onViewReviewProject}
        onOpenCompletedProjectsPopup={onOpenCompletedProjectsPopup}
        onOpenDraftPendingProjectsPopup={onOpenDraftPendingProjectsPopup}
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
