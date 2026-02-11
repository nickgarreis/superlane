import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import { Sidebar } from "../../components/Sidebar";
import type { AppView } from "../../lib/routing";
import type { ProjectData, ViewerIdentity, Workspace } from "../../types";
type DashboardChromeProps = {
  isSidebarOpen: boolean;
  navigateView: (view: AppView) => void;
  openSearch: () => void;
  handleSearchIntent: () => void;
  currentView: AppView;
  openCreateProject: () => void;
  handleCreateProjectIntent: () => void;
  visibleProjects: Record<string, ProjectData>;
  viewerIdentity: ViewerIdentity;
  activeWorkspace: Workspace | undefined;
  workspaces: Workspace[];
  canCreateWorkspace: boolean;
  handleSettingsIntent: () => void;
  handleSignOut: () => void;
  onSwitchWorkspace: (workspaceSlug: string) => void;
  onCreateWorkspace: () => void;
  onOpenSettings: (
    tab?: "Account" | "Notifications" | "Company" | "Billing",
  ) => void;
  onUpdateProjectStatus: (projectId: string, newStatus: string) => void;
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
};
export const DashboardChrome = React.memo(function DashboardChrome({
  isSidebarOpen,
  navigateView,
  openSearch,
  handleSearchIntent,
  currentView,
  openCreateProject,
  handleCreateProjectIntent,
  visibleProjects,
  viewerIdentity,
  activeWorkspace,
  workspaces,
  canCreateWorkspace,
  handleSettingsIntent,
  handleSignOut,
  onSwitchWorkspace,
  onCreateWorkspace,
  onOpenSettings,
  onUpdateProjectStatus,
  onEditProject,
  onViewReviewProject,
}: DashboardChromeProps) {
  return (
    <>
      <Toaster
        position="bottom-right"
        theme="dark"
        gap={8}
        duration={3000}
        offset={20}
        toastOptions={{
          style: {
            background: "#131314",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "14px",
            color: "#E8E8E8",
            padding: "14px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
            backdropFilter: "blur(12px)",
            gap: "12px",
          },
          classNames: {
            toast: "custom-toast",
            title: "custom-toast-title",
            icon: "custom-toast-icon",
            success: "custom-toast-success",
            error: "custom-toast-error",
            info: "custom-toast-info",
          },
        }}
      />
      <AnimatePresence mode="wait" initial={false}>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="h-full shrink-0 overflow-hidden"
          >
            <div className="w-[260px] h-full">
              <Sidebar
                onNavigate={navigateView}
                onSearch={openSearch}
                onSearchIntent={handleSearchIntent}
                currentView={currentView}
                onOpenCreateProject={openCreateProject}
                onOpenCreateProjectIntent={handleCreateProjectIntent}
                projects={visibleProjects}
                viewerIdentity={viewerIdentity}
                activeWorkspace={activeWorkspace}
                workspaces={workspaces}
                onSwitchWorkspace={onSwitchWorkspace}
                onCreateWorkspace={onCreateWorkspace}
                canCreateWorkspace={canCreateWorkspace}
                onOpenSettings={onOpenSettings}
                onOpenSettingsIntent={handleSettingsIntent}
                onUpdateProjectStatus={onUpdateProjectStatus}
                onEditProject={onEditProject}
                onViewReviewProject={onViewReviewProject}
                onLogout={handleSignOut}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
DashboardChrome.displayName = "DashboardChrome";
