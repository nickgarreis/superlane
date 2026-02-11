import React, { Suspense } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import type { AppView } from "../../lib/routing";
import type { ProjectData, ViewerIdentity, Workspace } from "../../types";

const LazyDashboardSidebarDndBoundary = React.lazy(
  () => import("./DashboardSidebarDndBoundary"),
);
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
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
  onOpenCompletedProjectsPopup: () => void;
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
  onEditProject,
  onViewReviewProject,
  onOpenCompletedProjectsPopup,
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
              <Suspense fallback={<div className="h-full w-full" />}>
                <LazyDashboardSidebarDndBoundary
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
                  onEditProject={onEditProject}
                  onViewReviewProject={onViewReviewProject}
                  onOpenCompletedProjectsPopup={onOpenCompletedProjectsPopup}
                  onLogout={handleSignOut}
                />
              </Suspense>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
DashboardChrome.displayName = "DashboardChrome";
