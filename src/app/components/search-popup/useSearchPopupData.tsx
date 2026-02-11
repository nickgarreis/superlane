import { useMemo } from "react";
import { ListChecks, Paperclip, FileText } from "lucide-react";
import { ProjectLogo } from "../ProjectLogo";
import { formatTaskDueDate } from "../../lib/dates";
import type { QuickAction, SearchResult } from "./types";
import type { AppView } from "../../lib/routing";
import type { ProjectData, ProjectFileData, Task } from "../../types";
import { buildSearchIndex, groupSearchResults } from "./searchIndex";

const MAX_PROJECT_RESULTS = 30;
const MAX_TASK_RESULTS = 40;
const MAX_FILE_RESULTS = 40;
const MAX_ACTION_RESULTS = 8;
type UseSearchPopupDataArgs = {
  projects: Record<string, ProjectData>;
  workspaceTasks?: Task[];
  files: ProjectFileData[];
  query: string;
  deferredQuery: string;
  recentResults: Array<{ id: string; title: string; type: string }>;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onOpenCreateProject: () => void;
  onOpenSettings: (tab?: string) => void;
  onHighlightNavigate?: (
    projectId: string,
    highlight: {
      type: "task" | "file";
      taskId?: string;
      fileName?: string;
      fileTab?: string;
    },
  ) => void;
  quickActions: QuickAction[];
};
export const useSearchPopupData = ({
  projects,
  workspaceTasks = [],
  files,
  query,
  deferredQuery,
  recentResults,
  onClose,
  onNavigate,
  onOpenCreateProject,
  onOpenSettings,
  onHighlightNavigate,
  quickActions,
}: UseSearchPopupDataArgs) => {
  const actionHandlers: Record<string, () => void> = useMemo(
    () => ({
      "action-create": () => {
        onClose();
        onOpenCreateProject();
      },
      "action-tasks": () => {
        onClose();
        onNavigate("tasks");
      },
      "action-assets": () => {
        onClose();
        onOpenSettings("Company");
      },
      "action-archive": () => {
        onClose();
        onNavigate("archive");
      },
      "action-settings": () => {
        onClose();
        onOpenSettings();
      },
    }),
    [onClose, onNavigate, onOpenCreateProject, onOpenSettings],
  );
  const projectsList = useMemo(() => Object.values(projects), [projects]);
  const effectiveWorkspaceTasks = useMemo(() => {
    if (workspaceTasks.length > 0) {
      return workspaceTasks;
    }
    const flattened: Task[] = [];
    for (const project of projectsList) {
      for (const task of project.tasks ?? []) {
        flattened.push({
          ...task,
          projectId: task.projectId ?? project.id,
        });
      }
    }
    return flattened;
  }, [projectsList, workspaceTasks]);
  const normalizedDeferredQuery = useMemo(
    () => deferredQuery.toLowerCase().trim(),
    [deferredQuery],
  );
  const trimmedQuery = query.trim();
  const firstActiveProjectId = useMemo(() => {
    const active = projectsList.find(
      (project) => !project.archived && project.status.label !== "Draft",
    );
    return active?.id || projectsList[0]?.id;
  }, [projectsList]);
  const searchIndex = useMemo(
    () =>
      buildSearchIndex({
        projectsList,
        workspaceTasks: effectiveWorkspaceTasks,
        files,
      }),
    [effectiveWorkspaceTasks, files, projectsList],
  );
  const matchedEntries = useMemo(() => {
    if (!normalizedDeferredQuery) {
      return {
        projectEntries: [] as typeof searchIndex.projectIndex,
        taskEntries: [] as typeof searchIndex.taskIndex,
        fileEntries: [] as typeof searchIndex.fileIndex,
        actionEntries: [] as QuickAction[],
      };
    }

    const projectEntries: typeof searchIndex.projectIndex = [];
    for (const projectEntry of searchIndex.projectIndex) {
      if (!projectEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
      projectEntries.push(projectEntry);
      if (projectEntries.length >= MAX_PROJECT_RESULTS) {
        break;
      }
    }

    const taskEntries: typeof searchIndex.taskIndex = [];
    for (const taskEntry of searchIndex.taskIndex) {
      if (!taskEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
      taskEntries.push(taskEntry);
      if (taskEntries.length >= MAX_TASK_RESULTS) {
        break;
      }
    }

    const fileEntries: typeof searchIndex.fileIndex = [];
    for (const fileEntry of searchIndex.fileIndex) {
      if (!fileEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
      fileEntries.push(fileEntry);
      if (fileEntries.length >= MAX_FILE_RESULTS) {
        break;
      }
    }

    const actionEntries: QuickAction[] = [];
    for (const action of quickActions) {
      if (
        action.label.toLowerCase().includes(normalizedDeferredQuery) ||
        action.keyword.toLowerCase().includes(normalizedDeferredQuery)
      ) {
        actionEntries.push(action);
        if (actionEntries.length >= MAX_ACTION_RESULTS) {
          break;
        }
      }
    }

    return {
      projectEntries,
      taskEntries,
      fileEntries,
      actionEntries,
    };
  }, [normalizedDeferredQuery, quickActions, searchIndex]);

  const results = useMemo(() => {
    if (!normalizedDeferredQuery) {
      return [] as SearchResult[];
    }

    const items: SearchResult[] = [];
    for (const { project } of matchedEntries.projectEntries) {
      items.push({
        id: `project-${project.id}`,
        type: "project",
        title: project.name,
        subtitle: project.archived
          ? "Archived"
          : project.status.label === "Completed"
            ? "Completed"
            : `${project.category} · ${project.status.label}`,
        icon: <ProjectLogo size={18} category={project.category} />,
        category: project.category,
        status: project.status,
        projectId: project.id,
        action: () => {
          if (project.archived) {
            onClose();
            onNavigate(`archive-project:${project.id}`);
          } else {
            onClose();
            onNavigate(`project:${project.id}`);
          }
        },
      });
    }

    for (const taskEntry of matchedEntries.taskEntries) {
      items.push({
        id: `task-${taskEntry.projectId}-${taskEntry.taskId}`,
        type: "task",
        title: taskEntry.title,
        subtitle: `${taskEntry.assigneeName} · ${taskEntry.dueDateLabel} · in ${taskEntry.projectName}`,
        icon: <ListChecks size={15} />,
        projectId: taskEntry.projectId,
        taskCompleted: taskEntry.completed,
        action: () => {
          onClose();
          onNavigate(`project:${taskEntry.projectId}`);
          if (onHighlightNavigate) {
            onHighlightNavigate(taskEntry.projectId, {
              type: "task",
              taskId: taskEntry.taskId,
            });
          }
        },
      });
    }

    for (const fileEntry of matchedEntries.fileEntries) {
      const targetProject = fileEntry.projectId || firstActiveProjectId;
      if (!targetProject) {
        continue;
      }
      items.push({
        id: `file-${fileEntry.key}`,
        type: "file",
        title: fileEntry.name,
        subtitle: fileEntry.projectId
          ? `${fileEntry.tab} · in ${projects[fileEntry.projectId]?.name || "project"}`
          : `${fileEntry.tab} · ${fileEntry.dateLabel}`,
        icon:
          fileEntry.tab === "Attachments" ? (
            <Paperclip size={14} />
          ) : (
            <FileText size={14} />
          ),
        fileType: fileEntry.type,
        fileTab: fileEntry.tab,
        projectId: targetProject,
        action: () => {
          onClose();
          onNavigate(`project:${targetProject}`);
          if (onHighlightNavigate) {
            onHighlightNavigate(targetProject, {
              type: "file",
              fileName: fileEntry.name,
              fileTab: fileEntry.tab,
            });
          }
        },
      });
    }

    for (const actionEntry of matchedEntries.actionEntries) {
      const action = actionHandlers[actionEntry.id];
      if (typeof action !== "function") {
        continue;
      }
      items.push({
        id: actionEntry.id,
        type: "action",
        title: actionEntry.label,
        subtitle: "Quick Action",
        icon: actionEntry.icon,
        action,
      });
    }

    return items;
  }, [
    actionHandlers,
    firstActiveProjectId,
    matchedEntries,
    normalizedDeferredQuery,
    onClose,
    onHighlightNavigate,
    onNavigate,
    projects,
  ]);
  const grouped = useMemo(() => groupSearchResults(results), [results]);
  const flatResults = useMemo(() => {
    return [
      ...grouped.projectResults,
      ...grouped.taskResults,
      ...grouped.fileResults,
      ...grouped.actionResults,
    ];
  }, [grouped]);
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
      if (project) {
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
            if (project.archived) {
              onNavigate(`archive-project:${project.id}`);
            } else {
              onNavigate(`project:${project.id}`);
            }
          },
        });
      }
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
    onClose,
    onHighlightNavigate,
    onNavigate,
    projectsList,
    effectiveWorkspaceTasks,
    recentResults,
  ]);
  const combinedDefaultList = useMemo(
    () => [...defaultContent, ...suggestions],
    [defaultContent, suggestions],
  );
  return {
    actionHandlers,
    grouped,
    flatResults,
    defaultContent,
    suggestions,
    combinedDefaultList,
    trimmedQuery,
  };
};
