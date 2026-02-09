import type { ProjectData, Task, Workspace } from "../types";
import { getStatusStyle } from "./status";

type SnapshotProject = {
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
  draftData?: any;
  attachments?: Array<{
    id: number | string;
    name: string;
    type: string;
    dateEpochMs?: number | null;
    img: string;
  }>;
  reviewComments?: Array<{
    id: string;
    author: { name: string; avatar: string };
    content: string;
    timestamp: string;
  }>;
  creator?: {
    userId?: string;
    name?: string;
    avatarUrl?: string | null;
  };
};

type SnapshotTask = {
  projectPublicId: string;
  taskId: string;
  title: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDateEpochMs?: number | null;
  completed: boolean;
};

type SnapshotWorkspace = {
  slug: string;
  name: string;
  plan: string;
  logo?: string;
  logoColor?: string;
  logoText?: string;
};

export const mapWorkspacesToUi = (workspaces: SnapshotWorkspace[]): Workspace[] =>
  workspaces.map((workspace) => ({
    id: workspace.slug,
    name: workspace.name,
    plan: workspace.plan,
    logo: workspace.logo,
    logoColor: workspace.logoColor,
    logoText: workspace.logoText,
  }));

export const mapProjectsToUi = ({
  projects,
  tasks,
  workspaceSlug,
}: {
  projects: SnapshotProject[];
  tasks: SnapshotTask[];
  workspaceSlug: string | null;
}): Record<string, ProjectData> => {
  const tasksByProject = tasks.reduce<Record<string, Task[]>>((acc, task) => {
    if (!acc[task.projectPublicId]) {
      acc[task.projectPublicId] = [];
    }
    acc[task.projectPublicId].push({
      id: task.taskId,
      title: task.title,
      assignee: {
        name: task.assignee.name,
        avatar: task.assignee.avatar,
      },
      dueDateEpochMs: task.dueDateEpochMs ?? null,
      completed: task.completed,
    });
    return acc;
  }, {});

  return projects.reduce<Record<string, ProjectData>>((acc, project) => {
    const status = getStatusStyle(project.status);
    const previousStatus = project.previousStatus ? getStatusStyle(project.previousStatus) : undefined;
    const creatorName = project.creator?.name?.trim() || "Unknown user";
    const creatorAvatar = typeof project.creator?.avatarUrl === "string" ? project.creator.avatarUrl : "";

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
      tasks: tasksByProject[project.publicId] ?? [],
    };

    return acc;
  }, {});
};
