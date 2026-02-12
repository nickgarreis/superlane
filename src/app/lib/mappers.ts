import type {
  ProjectData,
  ProjectDraftData,
  ProjectFileData,
  ProjectFileTab,
  ReviewComment,
  Task,
  WorkspaceActivity,
  Workspace,
} from "../types";
import { getStatusStyle } from "./status";
export type SnapshotProject = {
  publicId: string;
  name: string;
  description: string;
  category: string;
  scope?: string;
  deadlineEpochMs?: number | null;
  status: string;
  previousStatus?: string | null;
  archived: boolean;
  archivedAt?: number | null;
  completedAt?: number | null;
  draftData?: ProjectDraftData | null;
  attachments?: ProjectData["attachments"];
  reviewComments?: ReviewComment[];
  creator?: { userId?: string; name?: string; avatarUrl?: string | null };
};
export type SnapshotTask = {
  projectPublicId?: string | null;
  taskId: string;
  title: string;
  assignee: { userId?: string; name: string; avatar: string };
  dueDateEpochMs?: number | null;
  completed: boolean;
};
export type SnapshotWorkspace = {
  slug: string;
  name: string;
  plan: string;
  logo?: string;
  logoColor?: string;
  logoText?: string;
};
export type SnapshotWorkspaceFile = {
  id: string | number;
  projectPublicId: string;
  tab: ProjectFileTab;
  name: string;
  type: string;
  displayDateEpochMs: number;
  thumbnailRef?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  downloadable?: boolean;
};
export type SnapshotWorkspaceActivity = WorkspaceActivity;
export const mapWorkspacesToUi = (
  workspaces: SnapshotWorkspace[],
): Workspace[] =>
  workspaces.map((workspace) => ({
    id: workspace.slug,
    slug: workspace.slug,
    name: workspace.name,
    plan: workspace.plan,
    logo: workspace.logo,
    logoColor: workspace.logoColor,
    logoText: workspace.logoText,
  }));
export const mapProjectsToUi = ({
  projects,
  workspaceSlug,
}: {
  projects: SnapshotProject[];
  workspaceSlug: string | null;
}): Record<string, ProjectData> => {
  return projects.reduce<Record<string, ProjectData>>((acc, project) => {
    const status = getStatusStyle(project.status);
    const previousStatus = project.previousStatus
      ? getStatusStyle(project.previousStatus)
      : undefined;
    const creatorName = project.creator?.name?.trim() || "Unknown user";
    const creatorAvatar =
      typeof project.creator?.avatarUrl === "string"
        ? project.creator.avatarUrl
        : "";
    acc[project.publicId] = {
      id: project.publicId,
      name: project.name,
      description: project.description,
      creator: {
        userId: project.creator?.userId,
        name: creatorName,
        avatar: creatorAvatar,
      },
      status,
      previousStatus,
      category: project.category,
      scope: project.scope,
      deadlineEpochMs: project.deadlineEpochMs ?? null,
      workspaceId: workspaceSlug ?? undefined,
      archived: project.archived,
      archivedAt: project.archivedAt ?? null,
      completedAt: project.completedAt ?? null,
      draftData: project.draftData ?? undefined,
      attachments: project.attachments,
      comments: project.reviewComments,
    };
    return acc;
  }, {});
};
const mapTaskSnapshotToUi = (task: SnapshotTask): Task => ({
  id: task.taskId,
  title: task.title,
  projectId: task.projectPublicId ?? undefined,
  assignee: {
    userId: task.assignee.userId,
    name: task.assignee.name,
    avatar: task.assignee.avatar,
  },
  dueDateEpochMs: task.dueDateEpochMs ?? null,
  completed: task.completed,
});
export const mapWorkspaceTasksToUi = (tasks: SnapshotTask[]): Task[] =>
  tasks.map(mapTaskSnapshotToUi);
export const mapTasksByProjectToUi = (
  tasks: SnapshotTask[],
): Record<string, Task[]> =>
  tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!task.projectPublicId) {
      return acc;
    }
    if (!acc[task.projectPublicId]) {
      acc[task.projectPublicId] = [];
    }
    acc[task.projectPublicId].push(mapTaskSnapshotToUi(task));
    return acc;
  }, {});
export const mapWorkspaceFilesToUi = (
  files: SnapshotWorkspaceFile[],
): ProjectFileData[] =>
  files.map((file) => ({
    id: String(file.id),
    projectPublicId: file.projectPublicId,
    tab: file.tab,
    name: file.name,
    type: file.type,
    displayDateEpochMs: file.displayDateEpochMs,
    thumbnailRef: file.thumbnailRef ?? null,
    mimeType: file.mimeType ?? null,
    sizeBytes: file.sizeBytes ?? null,
    downloadable: file.downloadable ?? false,
  }));
