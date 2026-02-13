import React, { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster } from "sonner";
import type { AppView } from "../../lib/routing";
import { Z_LAYERS } from "../../lib/zLayers";
import type {
  ProjectData,
  ViewerIdentity,
  Workspace,
  WorkspaceActivity,
  WorkspaceMember,
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
  isMobile: boolean;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
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
  workspaceMembers: WorkspaceMember[];
  inboxUnreadCount: number;
  activitiesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceActivities: (numItems: number) => void;
  onMarkInboxActivityRead: (activityId: string) => void;
  onDismissInboxActivity: (activityId: string) => void;
  onMarkAllInboxActivitiesRead: () => void;
  onInboxActivityClick: (activity: WorkspaceActivity) => void;
};
export const DashboardChrome = React.memo(function DashboardChrome({
  isMobile,
  isSidebarOpen,
  onToggleSidebar,
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
  workspaceMembers,
  inboxUnreadCount,
  activitiesPaginationStatus,
  loadMoreWorkspaceActivities,
  onMarkInboxActivityRead,
  onDismissInboxActivity,
  onMarkAllInboxActivitiesRead,
  onInboxActivityClick,
}: DashboardChromeProps) {
  const [hasLoadedInboxPanel, setHasLoadedInboxPanel] = useState(isInboxOpen);

  useEffect(() => {
    if (!isMobile && !isSidebarOpen && isInboxOpen) {
      closeInbox();
      return;
    }
    if (isInboxOpen) {
      setHasLoadedInboxPanel(true);
      void loadInboxSidebarPanelModule();
    }
  }, [closeInbox, isInboxOpen, isMobile, isSidebarOpen]);

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
      {isMobile ? (
        <AnimatePresence initial={false}>
          {isSidebarOpen ? (
            <>
              <motion.button
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                style={{ zIndex: Z_LAYERS.dropdown - 1 }}
                aria-label="Close sidebar"
                onClick={onToggleSidebar}
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.24, ease: [0.32, 0.72, 0, 1] }}
                className="fixed inset-y-0 left-0 safe-pt safe-pl safe-pb"
                style={{ zIndex: Z_LAYERS.dropdown }}
              >
                <div className="h-full w-[min(88vw,320px)] bg-bg-base border-r border-border-subtle-soft shadow-2xl">
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
                </div>
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>
      ) : (
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
      {(hasLoadedInboxPanel || isInboxOpen) && (
        <Suspense fallback={null}>
          <LazyInboxSidebarPanel
            isOpen={isInboxOpen}
            isMobile={isMobile}
            onClose={closeInbox}
            activities={workspaceActivities}
            workspaceMembers={workspaceMembers}
            unreadCount={inboxUnreadCount}
            onMarkActivityRead={onMarkInboxActivityRead}
            onDismissActivity={onDismissInboxActivity}
            onMarkAllRead={onMarkAllInboxActivitiesRead}
            onActivityClick={onInboxActivityClick}
            activitiesPaginationStatus={activitiesPaginationStatus}
            loadMoreWorkspaceActivities={loadMoreWorkspaceActivities}
          />
        </Suspense>
      )}
    </>
  );
});
DashboardChrome.displayName = "DashboardChrome";
