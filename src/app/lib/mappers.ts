import type { ProjectData, Task, Workspace } from "../types";
import { getStatusStyle } from "./status";

type SnapshotProject = {
  publicId: string;
  name: string;
  description: string;
  category: string;
  scope?: string;
  deadline?: string;
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
    date: string;
    img: string;
  }>;
  reviewComments?: Array<{
    id: string;
    author: { name: string; avatar: string };
    content: string;
    timestamp: string;
  }>;
};

type SnapshotTask = {
  projectPublicId: string;
  taskId: string;
  title: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
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
  fallbackCreatorName,
  fallbackCreatorAvatar,
}: {
  projects: SnapshotProject[];
  tasks: SnapshotTask[];
  workspaceSlug: string | null;
  fallbackCreatorName: string;
  fallbackCreatorAvatar: string;
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
      dueDate: task.dueDate,
      completed: task.completed,
    });
    return acc;
  }, {});

  return projects.reduce<Record<string, ProjectData>>((acc, project) => {
    const status = getStatusStyle(project.status);
    const previousStatus = project.previousStatus ? getStatusStyle(project.previousStatus) : undefined;

    acc[project.publicId] = {
      id: project.publicId,
      name: project.name,
      description: project.description,
      creator: {
        name: fallbackCreatorName,
        avatar: fallbackCreatorAvatar,
      },
      status,
      previousStatus,
      category: project.category,
      scope: project.scope,
      deadline: project.deadline || "",
      workspaceId: workspaceSlug ?? undefined,
      archived: project.archived,
      archivedAt: project.archivedAt ? new Date(project.archivedAt).toISOString() : undefined,
      completedAt: project.completedAt ? new Date(project.completedAt).toISOString() : undefined,
      draftData: project.draftData ?? undefined,
      attachments: project.attachments,
      comments: project.reviewComments,
      tasks: tasksByProject[project.publicId] ?? [],
    };

    return acc;
  }, {});
};
