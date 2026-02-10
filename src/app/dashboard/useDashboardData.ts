import { useEffect, useMemo, type Dispatch, type SetStateAction } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  mapProjectsToUi,
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
import type { PendingHighlight } from "./types";
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
  isSearchOpen: boolean;
  currentView: AppView;
  viewerFallback: {
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setPendingHighlight: Dispatch<SetStateAction<PendingHighlight | null>>;
  navigateView: (view: AppView) => void;
};

type UseDashboardDataResult = {
  snapshot: ReturnType<typeof useQuery<typeof api.dashboard.getSnapshot>>;
  resolvedWorkspaceSlug: string | null;
  accountSettings: ReturnType<typeof useQuery<typeof api.settings.getAccountSettings>>;
  notificationSettings: ReturnType<typeof useQuery<typeof api.settings.getNotificationPreferences>>;
  companySettings: ReturnType<typeof useQuery<typeof api.settings.getCompanySettings>>;
  workspaceMembersResult: ReturnType<typeof useQuery<typeof api.collaboration.listWorkspaceMembers>>;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  workspaces: Workspace[];
  projects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  activeWorkspace: Workspace | undefined;
  visibleProjects: Record<string, ProjectData>;
  allWorkspaceFiles: ProjectFileData[];
  projectFilesByProject: Record<string, ProjectFileData[]>;
  contentModel: ReturnType<typeof useDashboardController>["contentModel"];
  handleToggleSidebar: ReturnType<typeof useDashboardController>["toggleSidebar"];
  clearPendingHighlight: ReturnType<typeof useDashboardController>["clearPendingHighlight"];
};

export const useDashboardData = ({
  isAuthenticated,
  activeWorkspaceSlug,
  setActiveWorkspaceSlug,
  isSettingsOpen,
  isSearchOpen,
  currentView,
  viewerFallback,
  setIsSidebarOpen,
  setPendingHighlight,
  navigateView,
}: UseDashboardDataArgs): UseDashboardDataResult => {
  const snapshot = useQuery(
    api.dashboard.getSnapshot,
    isAuthenticated ? { activeWorkspaceSlug: activeWorkspaceSlug ?? undefined } : "skip",
  );

  const resolvedWorkspaceSlug = snapshot?.activeWorkspaceSlug ?? activeWorkspaceSlug ?? null;

  const shouldLoadWorkspaceFiles = isSearchOpen
    || currentView.startsWith("project:")
    || currentView.startsWith("archive-project:");

  const workspaceFiles = useQuery(
    api.files.listForWorkspace,
    isAuthenticated && resolvedWorkspaceSlug && shouldLoadWorkspaceFiles
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
  );

  const accountSettings = useQuery(
    api.settings.getAccountSettings,
    isAuthenticated ? {} : "skip",
  );

  const notificationSettings = useQuery(
    api.settings.getNotificationPreferences,
    isAuthenticated && isSettingsOpen ? {} : "skip",
  );

  const companySettings = useQuery(
    api.settings.getCompanySettings,
    isAuthenticated && resolvedWorkspaceSlug && isSettingsOpen
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
  );

  const hasSnapshotWorkspaceMembers = Array.isArray(snapshot?.workspaceMembers);
  const workspaceMembersResult = useQuery(
    api.collaboration.listWorkspaceMembers,
    isAuthenticated
      && resolvedWorkspaceSlug
      && snapshot !== undefined
      && !hasSnapshotWorkspaceMembers
      ? { workspaceSlug: resolvedWorkspaceSlug }
      : "skip",
  );

  useEffect(() => {
    if (!snapshot) {
      return;
    }
    if (snapshot.activeWorkspaceSlug && snapshot.activeWorkspaceSlug !== activeWorkspaceSlug) {
      setActiveWorkspaceSlug(snapshot.activeWorkspaceSlug);
    }
  }, [snapshot, activeWorkspaceSlug, setActiveWorkspaceSlug]);

  const workspaceMembers = useMemo<WorkspaceMember[]>(
    () => {
      if (hasSnapshotWorkspaceMembers) {
        return (snapshot?.workspaceMembers ?? []) as WorkspaceMember[];
      }
      return workspaceMembersResult?.members ?? [];
    },
    [hasSnapshotWorkspaceMembers, snapshot?.workspaceMembers, workspaceMembersResult],
  );

  const viewerMembership = useMemo(
    () => workspaceMembers.find((member) => member.isViewer),
    [workspaceMembers],
  );

  const viewerIdentity = useMemo<ViewerIdentity>(() => ({
    userId: snapshot?.viewer?.id ? String(snapshot.viewer.id) : viewerMembership?.userId ?? null,
    workosUserId: snapshot?.viewer?.workosUserId ?? viewerMembership?.workosUserId ?? null,
    name: viewerMembership?.name ?? snapshot?.viewer?.name ?? viewerFallback.name,
    email: viewerMembership?.email ?? snapshot?.viewer?.email ?? viewerFallback.email,
    avatarUrl: viewerMembership?.avatarUrl ?? snapshot?.viewer?.avatarUrl ?? viewerFallback.avatarUrl,
    role: viewerMembership?.role ?? null,
  }), [snapshot?.viewer, viewerFallback.avatarUrl, viewerFallback.email, viewerFallback.name, viewerMembership]);

  const workspaces = useMemo(
    () => mapWorkspacesToUi((snapshot?.workspaces ?? []) as SnapshotWorkspace[]),
    [snapshot?.workspaces],
  );

  const projects = useMemo(
    () =>
      mapProjectsToUi({
        projects: (snapshot?.projects ?? []) as SnapshotProject[],
        tasks: (snapshot?.tasks ?? []) as SnapshotTask[],
        workspaceSlug: snapshot?.activeWorkspaceSlug ?? null,
      }),
    [snapshot?.projects, snapshot?.tasks, snapshot?.activeWorkspaceSlug],
  );

  const workspaceTasks = useMemo(
    () => mapWorkspaceTasksToUi((snapshot?.tasks ?? []) as SnapshotTask[]),
    [snapshot?.tasks],
  );

  const activeWorkspace = useMemo<Workspace | undefined>(() => {
    const targetWorkspaceSlug = snapshot?.activeWorkspaceSlug ?? activeWorkspaceSlug;
    if (!targetWorkspaceSlug) {
      return workspaces[0];
    }

    return workspaces.find((workspace) => workspace.slug === targetWorkspaceSlug) ?? workspaces[0];
  }, [workspaces, snapshot?.activeWorkspaceSlug, activeWorkspaceSlug]);

  const visibleProjects = useMemo(() => {
    if (!activeWorkspace) {
      return {};
    }

    return Object.entries(projects).reduce<Record<string, ProjectData>>((acc, [key, project]) => {
      if (project.workspaceId === activeWorkspace.id) {
        acc[key] = project;
      }
      return acc;
    }, {});
  }, [projects, activeWorkspace]);

  const {
    contentModel,
    toggleSidebar: handleToggleSidebar,
    clearPendingHighlight,
  } = useDashboardController({
    currentView,
    projects,
    visibleProjects,
    setIsSidebarOpen,
    setPendingHighlight,
    navigateView,
  });

  const allWorkspaceFiles = useMemo<ProjectFileData[]>(
    () => mapWorkspaceFilesToUi((workspaceFiles ?? []) as SnapshotWorkspaceFile[]),
    [workspaceFiles],
  );

  const projectFilesByProject = useMemo(
    () =>
      allWorkspaceFiles.reduce<Record<string, ProjectFileData[]>>((acc, file) => {
        if (!acc[file.projectPublicId]) {
          acc[file.projectPublicId] = [];
        }
        acc[file.projectPublicId].push(file);
        return acc;
      }, {}),
    [allWorkspaceFiles],
  );

  return {
    snapshot,
    resolvedWorkspaceSlug,
    accountSettings,
    notificationSettings,
    companySettings,
    workspaceMembersResult,
    workspaceMembers,
    viewerIdentity,
    workspaces,
    projects,
    workspaceTasks,
    activeWorkspace,
    visibleProjects,
    allWorkspaceFiles,
    projectFilesByProject,
    contentModel,
    handleToggleSidebar,
    clearPendingHighlight,
  };
};
