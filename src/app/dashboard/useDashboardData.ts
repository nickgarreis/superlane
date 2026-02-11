import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { usePaginatedQuery, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  mapProjectsToUi,
  mapTasksByProjectToUi,
  mapWorkspaceFilesToUi,
  mapWorkspaceTasksToUi,
  mapWorkspacesToUi,
  type SnapshotProject,
  type SnapshotTask,
  type SnapshotWorkspace,
  type SnapshotWorkspaceFile,
} from "../lib/mappers";
import type { AppView } from "../lib/routing";
import { useDashboardController } from "./useDashboardController";
import type { PendingHighlight, SettingsTab } from "./types";
import type {
  ProjectData,
  ProjectFileData,
  Task,
  ViewerIdentity,
  Workspace,
  WorkspaceMember,
} from "../types";
type UseDashboardDataArgs = {
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
type UseDashboardDataResult = {
  snapshot: ReturnType<
    typeof useQuery<typeof api.dashboard.getWorkspaceBootstrap>
  >;
  resolvedWorkspaceSlug: string | null;
  projectsPaginationStatus: ReturnType<
    typeof usePaginatedQuery<typeof api.projects.listForWorkspace>
  >["status"];
  tasksPaginationStatus: ReturnType<
    typeof usePaginatedQuery<typeof api.tasks.listForWorkspace>
  >["status"];
  loadMoreWorkspaceTasks: ReturnType<
    typeof usePaginatedQuery<typeof api.tasks.listForWorkspace>
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
  accountSettings: ReturnType<
    typeof useQuery<typeof api.settings.getAccountSettings>
  >;
  notificationSettings: ReturnType<
    typeof useQuery<typeof api.settings.getNotificationPreferences>
  >;
  companySummary: ReturnType<
    typeof useQuery<typeof api.settings.getCompanySettingsSummary>
  >;
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
  activeWorkspace: Workspace | undefined;
  visibleProjects: Record<string, ProjectData>;
  sidebarVisibleProjects: Record<string, ProjectData>;
  allWorkspaceFiles: ProjectFileData[];
  projectFilesByProject: Record<string, ProjectFileData[]>;
  contentModel: ReturnType<typeof useDashboardController>["contentModel"];
  handleToggleSidebar: ReturnType<
    typeof useDashboardController
  >["toggleSidebar"];
  clearPendingHighlight: ReturnType<
    typeof useDashboardController
  >["clearPendingHighlight"];
};
const PROJECTS_PAGE_SIZE = 50;
const TASKS_PAGE_SIZE = 50;
const WORKSPACE_FILES_PAGE_SIZE = 40;
const PROJECT_FILES_PAGE_SIZE = 40;
const SETTINGS_PAGE_SIZE = 100;
const filterProjectsByWorkspace = (
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
export const useDashboardData = ({
  isAuthenticated,
  activeWorkspaceSlug,
  setActiveWorkspaceSlug,
  isSettingsOpen,
  isSearchOpen,
  currentView,
  completedProjectDetailId,
  viewerFallback,
  setIsSidebarOpen,
  setPendingHighlight,
  navigateView,
}: UseDashboardDataArgs): UseDashboardDataResult => {
  const snapshot = useQuery(
    api.dashboard.getWorkspaceBootstrap,
    isAuthenticated
      ? { activeWorkspaceSlug: activeWorkspaceSlug ?? undefined }
      : "skip",
  );
  const resolvedWorkspaceSlug =
    snapshot === undefined
      ? (activeWorkspaceSlug ?? null)
      : (snapshot.activeWorkspaceSlug ?? null);
  const isArchiveView =
    currentView === "archive" || currentView.startsWith("archive-project:");
  const shouldIncludeArchivedProjects =
    // Completed-project popup/detail only ever shows non-archived projects.
    // Keeping this false avoids query-arg churn when opening detail in popup.
    isArchiveView || isSearchOpen;
  const activeProjectsResult = usePaginatedQuery(
    api.projects.listForWorkspace,
    isAuthenticated && resolvedWorkspaceSlug
      ? {
          workspaceSlug: resolvedWorkspaceSlug,
          includeArchived: false,
        }
      : "skip",
    { initialNumItems: PROJECTS_PAGE_SIZE },
  );
  const archivedProjectsResult = usePaginatedQuery(
    api.projects.listForWorkspace,
    isAuthenticated && resolvedWorkspaceSlug
      ? {
          workspaceSlug: resolvedWorkspaceSlug,
          includeArchived: true,
        }
      : "skip",
    { initialNumItems: PROJECTS_PAGE_SIZE },
  );
  const routeProjectPublicId = currentView.startsWith("project:")
    ? currentView.slice("project:".length)
    : currentView.startsWith("archive-project:")
      ? currentView.slice("archive-project:".length)
      : null;
  const activeProjectPublicId = routeProjectPublicId ?? completedProjectDetailId;
  const shouldLoadWorkspaceTasks = Boolean(isAuthenticated && resolvedWorkspaceSlug);
  const shouldLoadProjectTasks = activeProjectPublicId != null;
  const shouldLoadProjectFiles = activeProjectPublicId != null;
  const [hasOpenedSearchOnce, setHasOpenedSearchOnce] = useState(isSearchOpen);
  useEffect(() => {
    if (isSearchOpen) {
      setHasOpenedSearchOnce(true);
    }
  }, [isSearchOpen]);
  const shouldKeepWorkspaceFilesWarm = isSearchOpen || hasOpenedSearchOnce;
  const workspaceTasksResult = usePaginatedQuery(
    api.tasks.listForWorkspace,
    isAuthenticated && resolvedWorkspaceSlug && shouldLoadWorkspaceTasks
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
    { initialNumItems: TASKS_PAGE_SIZE },
  );
  const projectTasksResult = usePaginatedQuery(
    api.tasks.listForProject,
    isAuthenticated && shouldLoadProjectTasks && activeProjectPublicId
      ? { projectPublicId: activeProjectPublicId }
      : "skip",
    { initialNumItems: TASKS_PAGE_SIZE },
  );
  const workspaceFiles = usePaginatedQuery(
    api.files.listForWorkspace,
    isAuthenticated && resolvedWorkspaceSlug && shouldKeepWorkspaceFilesWarm
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
    { initialNumItems: WORKSPACE_FILES_PAGE_SIZE },
  );
  const projectFiles = usePaginatedQuery(
    api.files.listForProjectPaginated,
    isAuthenticated && shouldLoadProjectFiles && activeProjectPublicId
      ? { projectPublicId: activeProjectPublicId }
      : "skip",
    { initialNumItems: PROJECT_FILES_PAGE_SIZE },
  );
  const {
    results: paginatedActiveProjects,
    status: activeProjectsPaginationStatus,
  } = activeProjectsResult;
  const {
    results: paginatedProjectsWithArchived,
    status: archivedProjectsPaginationStatus,
  } = archivedProjectsResult;
  const paginatedProjects = shouldIncludeArchivedProjects
    ? paginatedProjectsWithArchived
    : paginatedActiveProjects;
  const projectsPaginationStatus = shouldIncludeArchivedProjects
    ? archivedProjectsPaginationStatus
    : activeProjectsPaginationStatus;
  const paginatedSidebarProjects = paginatedActiveProjects;
  const {
    results: paginatedWorkspaceTasks,
    status: tasksPaginationStatus,
    loadMore: loadMoreWorkspaceTasks,
  } = workspaceTasksResult;
  const {
    results: paginatedProjectTasks,
    status: projectTasksPaginationStatus,
  } = projectTasksResult;
  const {
    results: paginatedWorkspaceFiles,
    status: filesPaginationStatus,
    loadMore: loadMoreWorkspaceFiles,
  } = workspaceFiles;
  const {
    results: paginatedProjectFiles,
    status: projectFilesPaginationStatus,
    loadMore: loadMoreProjectFiles,
  } = projectFiles;
  const accountSettings = useQuery(
    api.settings.getAccountSettings,
    isAuthenticated ? {} : "skip",
  );
  const notificationSettings = useQuery(
    api.settings.getNotificationPreferences,
    isAuthenticated && isSettingsOpen ? {} : "skip",
  );
  const shouldLoadCompanySettings =
    isAuthenticated && resolvedWorkspaceSlug && isSettingsOpen;
  const companySummary = useQuery(
    api.settings.getCompanySettingsSummary,
    shouldLoadCompanySettings
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
  );
  const companyMembersResult = usePaginatedQuery(
    api.settings.listCompanyMembers,
    shouldLoadCompanySettings
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
    { initialNumItems: SETTINGS_PAGE_SIZE },
  );
  const companyPendingInvitationsResult = usePaginatedQuery(
    api.settings.listPendingInvitations,
    shouldLoadCompanySettings
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
    { initialNumItems: SETTINGS_PAGE_SIZE },
  );
  const companyBrandAssetsResult = usePaginatedQuery(
    api.settings.listBrandAssets,
    shouldLoadCompanySettings
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
    { initialNumItems: SETTINGS_PAGE_SIZE },
  );
  const workspaceMembersResult = useQuery(
    api.collaboration.listWorkspaceMembers,
    isAuthenticated && resolvedWorkspaceSlug
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
  );
  const viewerMembershipResult = useQuery(
    api.collaboration.getViewerMembership,
    isAuthenticated && resolvedWorkspaceSlug
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
  );
  const projectTasksCacheRef = useRef<Record<string, SnapshotTask[]>>({});
  const projectFilesCacheRef = useRef<Record<string, SnapshotWorkspaceFile[]>>(
    {},
  );

  useEffect(() => {
    projectTasksCacheRef.current = {};
    projectFilesCacheRef.current = {};
  }, [resolvedWorkspaceSlug]);

  useEffect(() => {
    if (!activeProjectPublicId) {
      return;
    }
    if (projectTasksPaginationStatus === "LoadingFirstPage") {
      return;
    }
    projectTasksCacheRef.current[activeProjectPublicId] =
      paginatedProjectTasks as SnapshotTask[];
  }, [
    activeProjectPublicId,
    paginatedProjectTasks,
    projectTasksPaginationStatus,
  ]);

  useEffect(() => {
    if (!activeProjectPublicId) {
      return;
    }
    if (projectFilesPaginationStatus === "LoadingFirstPage") {
      return;
    }
    projectFilesCacheRef.current[activeProjectPublicId] =
      paginatedProjectFiles as SnapshotWorkspaceFile[];
  }, [
    activeProjectPublicId,
    paginatedProjectFiles,
    projectFilesPaginationStatus,
  ]);

  useEffect(() => {
    if (snapshot === undefined) {
      return;
    }
    const nextWorkspaceSlug = snapshot.activeWorkspaceSlug ?? null;
    if (nextWorkspaceSlug !== activeWorkspaceSlug) {
      setActiveWorkspaceSlug(nextWorkspaceSlug);
    }
  }, [snapshot, activeWorkspaceSlug, setActiveWorkspaceSlug]);
  const workspaceMembers = useMemo<WorkspaceMember[]>(
    () => workspaceMembersResult?.members ?? [],
    [workspaceMembersResult],
  );
  const viewerWorkspaceMember = useMemo(
    () => workspaceMembers.find((member) => member.isViewer),
    [workspaceMembers],
  );
  const viewerIdentity = useMemo<ViewerIdentity>(
    () => ({
      userId: snapshot?.viewer?.id
        ? String(snapshot.viewer.id)
        : (viewerMembershipResult?.userId ?? viewerWorkspaceMember?.userId ?? null),
      workosUserId:
        snapshot?.viewer?.workosUserId ??
        viewerWorkspaceMember?.workosUserId ??
        null,
      name:
        viewerWorkspaceMember?.name ??
        snapshot?.viewer?.name ??
        viewerFallback.name,
      email:
        viewerWorkspaceMember?.email ??
        snapshot?.viewer?.email ??
        viewerFallback.email,
      avatarUrl:
        viewerWorkspaceMember?.avatarUrl ??
        snapshot?.viewer?.avatarUrl ??
        viewerFallback.avatarUrl,
      role: viewerMembershipResult?.role ?? viewerWorkspaceMember?.role ?? null,
    }),
    [
      snapshot?.viewer,
      viewerFallback.avatarUrl,
      viewerFallback.email,
      viewerFallback.name,
      viewerMembershipResult?.role,
      viewerMembershipResult?.userId,
      viewerWorkspaceMember,
    ],
  );
  const workspaces = useMemo(
    () =>
      mapWorkspacesToUi((snapshot?.workspaces ?? []) as SnapshotWorkspace[]),
    [snapshot?.workspaces],
  );
  const projectsByRoute = useMemo(
    () =>
      mapProjectsToUi({
        projects: paginatedProjects as SnapshotProject[],
        workspaceSlug: snapshot?.activeWorkspaceSlug ?? null,
      }),
    [paginatedProjects, snapshot?.activeWorkspaceSlug],
  );
  const sidebarProjects = useMemo(
    () =>
      mapProjectsToUi({
        projects: paginatedSidebarProjects as SnapshotProject[],
        workspaceSlug: snapshot?.activeWorkspaceSlug ?? null,
      }),
    [paginatedSidebarProjects, snapshot?.activeWorkspaceSlug],
  );
  const workspaceTasks = useMemo(
    () => mapWorkspaceTasksToUi(paginatedWorkspaceTasks as SnapshotTask[]),
    [paginatedWorkspaceTasks],
  );
  const activeProjectTasksSource = useMemo<SnapshotTask[]>(() => {
    if (!activeProjectPublicId) {
      return [];
    }
    const currentProjectTasks = paginatedProjectTasks as SnapshotTask[];
    if (
      projectTasksPaginationStatus !== "LoadingFirstPage" ||
      currentProjectTasks.length > 0
    ) {
      return currentProjectTasks;
    }
    return projectTasksCacheRef.current[activeProjectPublicId] ?? [];
  }, [
    activeProjectPublicId,
    paginatedProjectTasks,
    projectTasksPaginationStatus,
  ]);
  const tasksByProject = useMemo(
    () => {
      const grouped = mapTasksByProjectToUi(paginatedWorkspaceTasks as SnapshotTask[]);
      if (!activeProjectPublicId) {
        return grouped;
      }
      const activeProjectGrouped = mapTasksByProjectToUi(activeProjectTasksSource);
      grouped[activeProjectPublicId] = activeProjectGrouped[activeProjectPublicId] ?? [];
      return grouped;
    },
    [activeProjectPublicId, activeProjectTasksSource, paginatedWorkspaceTasks],
  );
  const activeWorkspace = useMemo<Workspace | undefined>(() => {
    const targetWorkspaceSlug =
      snapshot?.activeWorkspaceSlug ?? activeWorkspaceSlug;
    if (!targetWorkspaceSlug) {
      return workspaces[0];
    }
    return (
      workspaces.find((workspace) => workspace.slug === targetWorkspaceSlug) ??
      workspaces[0]
    );
  }, [workspaces, snapshot?.activeWorkspaceSlug, activeWorkspaceSlug]);
  const visibleProjects = useMemo(
    () => filterProjectsByWorkspace(projectsByRoute, activeWorkspace),
    [projectsByRoute, activeWorkspace],
  );
  const sidebarVisibleProjects = useMemo(
    () => filterProjectsByWorkspace(sidebarProjects, activeWorkspace),
    [sidebarProjects, activeWorkspace],
  );
  const visibleProjectIds = useMemo(
    () => Object.keys(sidebarVisibleProjects),
    [sidebarVisibleProjects],
  );
  const {
    contentModel,
    toggleSidebar: handleToggleSidebar,
    clearPendingHighlight,
  } = useDashboardController({
    currentView,
    projects: projectsByRoute,
    visibleProjects: sidebarVisibleProjects,
    setIsSidebarOpen,
    setPendingHighlight,
    navigateView,
  });
  const allWorkspaceFiles = useMemo<ProjectFileData[]>(
    () =>
      mapWorkspaceFilesToUi(paginatedWorkspaceFiles as SnapshotWorkspaceFile[]),
    [paginatedWorkspaceFiles],
  );
  const activeProjectFilesSource = useMemo<SnapshotWorkspaceFile[]>(() => {
    if (!activeProjectPublicId) {
      return [];
    }
    const currentProjectFiles = paginatedProjectFiles as SnapshotWorkspaceFile[];
    if (
      projectFilesPaginationStatus !== "LoadingFirstPage" ||
      currentProjectFiles.length > 0
    ) {
      return currentProjectFiles;
    }
    return projectFilesCacheRef.current[activeProjectPublicId] ?? [];
  }, [activeProjectPublicId, paginatedProjectFiles, projectFilesPaginationStatus]);
  const projectFilesByProject = useMemo(() => {
    const grouped: Record<string, ProjectFileData[]> = {};
    for (const [projectId, files] of Object.entries(projectFilesCacheRef.current)) {
      grouped[projectId] = mapWorkspaceFilesToUi(files).filter(
        (file) => file.projectPublicId === projectId,
      );
    }
    if (activeProjectPublicId) {
      grouped[activeProjectPublicId] = mapWorkspaceFilesToUi(activeProjectFilesSource);
    }
    return grouped;
  }, [activeProjectFilesSource, activeProjectPublicId]);
  return {
    snapshot,
    resolvedWorkspaceSlug,
    projectsPaginationStatus,
    tasksPaginationStatus,
    loadMoreWorkspaceTasks,
    workspaceFilesPaginationStatus: filesPaginationStatus,
    loadMoreWorkspaceFiles,
    projectFilesPaginationStatus,
    loadMoreProjectFiles,
    accountSettings,
    notificationSettings,
    companySummary,
    companyMembersResult,
    companyPendingInvitationsResult,
    companyBrandAssetsResult,
    workspaceMembersResult,
    workspaceMembers,
    usesWorkspaceTaskFeed: shouldLoadWorkspaceTasks,
    usesProjectTaskFeed: shouldLoadProjectTasks,
    viewerIdentity,
    projectsById: projectsByRoute,
    tasksByProject,
    visibleProjectIds,
    workspaces,
    projects: projectsByRoute,
    workspaceTasks,
    activeWorkspace,
    visibleProjects,
    sidebarVisibleProjects,
    allWorkspaceFiles,
    projectFilesByProject,
    contentModel,
    handleToggleSidebar,
    clearPendingHighlight,
  };
};
