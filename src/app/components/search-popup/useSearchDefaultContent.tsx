import { useMemo } from "react";
import { ListChecks } from "lucide-react";
import { ProjectLogo } from "../ProjectLogo";
import { formatTaskDueDate } from "../../lib/dates";
import type { AppView } from "../../lib/routing";
import type { ProjectData, Task } from "../../types";
import type { SearchResult } from "./types";

type UseSearchDefaultContentArgs = {
  projects: Record<string, ProjectData>;
  projectsList: ProjectData[];
  effectiveWorkspaceTasks: Task[];
  recentResults: Array<{ id: string; title: string; type: string }>;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onHighlightNavigate?: (
    projectId: string,
    highlight: {
      type: "task" | "file";
      taskId?: string;
      fileName?: string;
      fileTab?: string;
    },
  ) => void;
};

export function useSearchDefaultContent({
  projects,
  projectsList,
  effectiveWorkspaceTasks,
  recentResults,
  onClose,
  onNavigate,
  onHighlightNavigate,
}: UseSearchDefaultContentArgs) {
  const defaultContent = useMemo(() => {
    const activeProjects = projectsList
      .filter(
        (project) =>
          !project.archived &&
          project.status.label !== "Completed" &&
          project.status.label !== "Draft",
      )
      .slice(0, 4);
    const defaultItems: SearchResult[] = [];
    recentResults.forEach((recent) => {
      const project = projects[recent.id];
      if (!project) {
        return;
      }
      defaultItems.push({
        id: `recent-${project.id}`,
        type: "project",
        title: project.name,
        subtitle: project.archived
          ? "Archived"
          : `${project.category} · ${project.status.label}`,
        icon: <ProjectLogo size={18} category={project.category} />,
        category: project.category,
        status: project.status,
        projectId: project.id,
        action: () => {
          onClose();
          onNavigate(project.archived ? `archive-project:${project.id}` : `project:${project.id}`);
        },
      });
    });
    if (defaultItems.length === 0) {
      activeProjects.forEach((project) => {
        defaultItems.push({
          id: `default-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: `${project.category} · ${project.status.label}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => {
            onClose();
            onNavigate(`project:${project.id}`);
          },
        });
      });
    }
    return defaultItems;
  }, [onClose, onNavigate, projects, projectsList, recentResults]);

  const suggestions = useMemo(() => {
    const recentIds = new Set(recentResults.map((recent) => recent.id));
    const defaultIds = new Set(
      defaultContent.map((item) => item.projectId).filter(Boolean),
    );
    const items: SearchResult[] = [];
    const projectsById = new Map(projectsList.map((project) => [project.id, project]));
    let taskSuggestionCount = 0;
    for (const task of effectiveWorkspaceTasks) {
      const project = task.projectId ? projectsById.get(task.projectId) : null;
      if (!project || project.archived || project.status.label === "Completed") {
        continue;
      }
      if (task.completed || taskSuggestionCount >= 3) {
        continue;
      }
      taskSuggestionCount += 1;
      items.push({
        id: `suggest-task-${project.id}-${task.id}`,
        type: "task",
        title: task.title,
        subtitle: `${formatTaskDueDate(task.dueDateEpochMs)} · in ${project.name}`,
        icon: <ListChecks size={15} />,
        projectId: project.id,
        taskCompleted: false,
        action: () => {
          onClose();
          onNavigate(`project:${project.id}`);
          if (onHighlightNavigate) {
            onHighlightNavigate(project.id, {
              type: "task",
              taskId: task.id,
            });
          }
        },
      });
    }
    projectsList
      .filter(
        (project) =>
          !project.archived &&
          project.status.label === "Draft" &&
          !recentIds.has(project.id) &&
          !defaultIds.has(project.id),
      )
      .slice(0, 2)
      .forEach((project) => {
        items.push({
          id: `suggest-draft-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: `Draft · ${project.category}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => {
            onClose();
            onNavigate(`project:${project.id}`);
          },
        });
      });
    projectsList
      .filter(
        (project) =>
          !project.archived &&
          project.status.label !== "Completed" &&
          project.status.label !== "Draft" &&
          !recentIds.has(project.id) &&
          !defaultIds.has(project.id),
      )
      .slice(0, 2)
      .forEach((project) => {
        items.push({
          id: `suggest-project-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: `${project.category} · ${project.status.label}`,
          icon: <ProjectLogo size={18} category={project.category} />,
          category: project.category,
          status: project.status,
          projectId: project.id,
          action: () => {
            onClose();
            onNavigate(`project:${project.id}`);
          },
        });
      });
    return items;
  }, [
    defaultContent,
    effectiveWorkspaceTasks,
    onClose,
    onHighlightNavigate,
    onNavigate,
    projectsList,
    recentResults,
  ]);

  const combinedDefaultList = useMemo(
    () => [...defaultContent, ...suggestions],
    [defaultContent, suggestions],
  );

  return {
    defaultContent,
    suggestions,
    combinedDefaultList,
  };
}
