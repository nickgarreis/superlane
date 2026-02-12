import React, { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import type { AppView } from "../../lib/routing";
import type {
  ProjectData,
  ViewerIdentity,
  Workspace,
  WorkspaceActivity,
} from "../../types";

const LazyDashboardSidebarDndBoundary = React.lazy(
  () => import("./DashboardSidebarDndBoundary"),
);
const loadInboxSidebarPanelModule = () => import("../../components/InboxSidebarPanel");
const LazyInboxSidebarPanel = React.lazy(async () => {
  const module = await loadInboxSidebarPanelModule();
  return { default: module.InboxSidebarPanel };
});
type DashboardChromeProps = {
  isSidebarOpen: boolean;
  navigateView: (view: AppView) => void;
  openInbox: () => void;
  closeInbox: () => void;
  isInboxOpen: boolean;
  openSearch: () => void;
  handleSearchIntent: () => void;
  currentView: AppView;
  openCreateProject: () => void;
  handleCreateProjectIntent: () => void;
  visibleProjects: Record<string, ProjectData>;
  approvedSidebarProjectIds: string[];
  viewerIdentity: ViewerIdentity;
  activeWorkspace: Workspace | undefined;
  workspaces: Workspace[];
  canCreateWorkspace: boolean;
  handleSettingsIntent: () => void;
  handleSignOut: () => void;
  onSwitchWorkspace: (workspaceSlug: string) => void;
  onCreateWorkspace: () => void;
  onOpenSettings: (
    tab?: "Account" | "Notifications" | "Company" | "Workspace" | "Billing",
  ) => void;
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
  onOpenCompletedProjectsPopup: () => void;
  onOpenDraftPendingProjectsPopup: () => void;
  workspaceActivities: WorkspaceActivity[];
  inboxUnreadCount: number;
  activitiesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceActivities: (numItems: number) => void;
  onMarkInboxActivityRead: (activityId: string) => void;
  onMarkAllInboxActivitiesRead: () => void;
  onInboxActivityClick: (activity: WorkspaceActivity) => void;
};
export const DashboardChrome = React.memo(function DashboardChrome({
  isSidebarOpen,
  navigateView,
  openInbox,
  closeInbox,
  isInboxOpen,
  openSearch,
  handleSearchIntent,
  currentView,
  openCreateProject,
  handleCreateProjectIntent,
  visibleProjects,
  approvedSidebarProjectIds,
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
  onOpenDraftPendingProjectsPopup,
  workspaceActivities,
  inboxUnreadCount,
  activitiesPaginationStatus,
  loadMoreWorkspaceActivities,
  onMarkInboxActivityRead,
  onMarkAllInboxActivitiesRead,
  onInboxActivityClick,
}: DashboardChromeProps) {
  const [hasLoadedInboxPanel, setHasLoadedInboxPanel] = useState(isInboxOpen);

  useEffect(() => {
    if (!isSidebarOpen && isInboxOpen) {
      closeInbox();
      return;
    }
    if (isInboxOpen) {
      setHasLoadedInboxPanel(true);
      void loadInboxSidebarPanelModule();
    }
  }, [closeInbox, isInboxOpen, isSidebarOpen]);

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
            className="h-full shrink-0 overflow-visible"
          >
            <div className="w-[260px] h-full relative">
              <Suspense fallback={<div className="h-full w-full" />}>
                <LazyDashboardSidebarDndBoundary
                  onNavigate={navigateView}
                  onOpenInbox={isInboxOpen ? closeInbox : openInbox}
                  onSearch={openSearch}
                  onSearchIntent={handleSearchIntent}
                  currentView={currentView}
                  onOpenCreateProject={openCreateProject}
                  onOpenCreateProjectIntent={handleCreateProjectIntent}
                  projects={visibleProjects}
                  approvedSidebarProjectIds={approvedSidebarProjectIds}
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
                  onOpenDraftPendingProjectsPopup={
                    onOpenDraftPendingProjectsPopup
                  }
                  inboxUnreadCount={inboxUnreadCount}
                  onLogout={handleSignOut}
                />
              </Suspense>
              {(hasLoadedInboxPanel || isInboxOpen) && (
                <Suspense fallback={null}>
                  <LazyInboxSidebarPanel
                    isOpen={isInboxOpen}
                    onClose={closeInbox}
                    activities={workspaceActivities}
                    unreadCount={inboxUnreadCount}
                    onMarkActivityRead={onMarkInboxActivityRead}
                    onMarkAllRead={onMarkAllInboxActivitiesRead}
                    onActivityClick={onInboxActivityClick}
                    activitiesPaginationStatus={activitiesPaginationStatus}
                    loadMoreWorkspaceActivities={loadMoreWorkspaceActivities}
                  />
                </Suspense>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
DashboardChrome.displayName = "DashboardChrome";
