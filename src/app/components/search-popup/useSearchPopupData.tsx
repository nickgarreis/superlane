import { useMemo } from "react";
import { ListChecks, Paperclip, FileText } from "lucide-react";
import { ProjectLogo } from "../ProjectLogo";
import { formatFileDisplayDate, formatTaskDueDate } from "../../lib/dates";
import type { QuickAction, SearchIndexedFile, SearchIndexedProject, SearchIndexedTask, SearchResult } from "./types";
import type { AppView } from "../../lib/routing";
import type { ProjectData, ProjectFileData } from "../../types";

type UseSearchPopupDataArgs = {
  projects: Record<string, ProjectData>;
  files: ProjectFileData[];
  query: string;
  deferredQuery: string;
  recentResults: Array<{ id: string; title: string; type: string }>;
  onClose: () => void;
  onNavigate: (view: AppView) => void;
  onOpenCreateProject: () => void;
  onOpenSettings: (tab?: string) => void;
  onHighlightNavigate?: (projectId: string, highlight: { type: "task" | "file"; taskId?: string; fileName?: string; fileTab?: string }) => void;
  quickActions: QuickAction[];
};

export const useSearchPopupData = ({
  projects,
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
  const actionHandlers: Record<string, () => void> = useMemo(() => ({
    "action-create": () => { onClose(); onOpenCreateProject(); },
    "action-tasks": () => { onClose(); onNavigate("tasks"); },
    "action-assets": () => { onClose(); onOpenSettings("Company"); },
    "action-archive": () => { onClose(); onNavigate("archive"); },
    "action-settings": () => { onClose(); onOpenSettings(); },
  }), [onClose, onNavigate, onOpenCreateProject, onOpenSettings]);

  const projectsList = useMemo(() => Object.values(projects), [projects]);
  const normalizedDeferredQuery = deferredQuery.toLowerCase().trim();
  const trimmedQuery = query.trim();

  const firstActiveProjectId = useMemo(() => {
    const active = projectsList.find((project) => !project.archived && project.status.label !== "Draft");
    return active?.id || projectsList[0]?.id;
  }, [projectsList]);

  const searchIndex = useMemo(() => {
    const projectIndex: SearchIndexedProject[] = [];
    const taskIndex: SearchIndexedTask[] = [];

    for (const project of projectsList) {
      const projectSearchable = [
        project.name,
        project.description,
        project.category,
        project.status.label,
        project.scope ?? "",
      ].join(" ").toLowerCase();

      projectIndex.push({
        project,
        searchable: projectSearchable,
      });

      for (const task of project.tasks ?? []) {
        const dueDateLabel = formatTaskDueDate(task.dueDateEpochMs);
        const assigneeName = task.assignee?.name?.trim() || "Unassigned";
        taskIndex.push({
          projectId: project.id,
          projectName: project.name,
          taskId: task.id,
          title: task.title,
          assigneeName,
          dueDateLabel,
          completed: task.completed,
          searchable: `${task.title} ${assigneeName} ${dueDateLabel}`.toLowerCase(),
        });
      }
    }

    const fileIndex: SearchIndexedFile[] = [];
    const seen = new Set<string>();
    for (const file of files) {
      const normalizedProjectId = file.projectPublicId ?? "no-project";
      const key = `${normalizedProjectId}-${file.tab}-${file.name}-${String(file.id)}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      fileIndex.push({
        key,
        name: file.name,
        type: file.type,
        tab: file.tab,
        projectId: file.projectPublicId ?? null,
        dateLabel: formatFileDisplayDate(file.displayDateEpochMs),
        searchable: `${file.name} ${file.type}`.toLowerCase(),
      });
    }

    return {
      projectIndex,
      taskIndex,
      fileIndex,
    };
  }, [files, projectsList]);

  const results = useMemo(() => {
    const items: SearchResult[] = [];

    if (!normalizedDeferredQuery) return items;

    for (const projectEntry of searchIndex.projectIndex) {
      const { project, searchable } = projectEntry;
      if (searchable.includes(normalizedDeferredQuery)) {
        items.push({
          id: `project-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: project.archived ? "Archived" : project.status.label === "Completed" ? "Completed" : `${project.category} · ${project.status.label}`,
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
    }

    for (const taskEntry of searchIndex.taskIndex) {
      if (!taskEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
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
            onHighlightNavigate(taskEntry.projectId, { type: "task", taskId: taskEntry.taskId });
          }
        },
      });
    }

    for (const fileEntry of searchIndex.fileIndex) {
      if (!fileEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
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
        icon: fileEntry.tab === "Attachments" ? <Paperclip size={14} /> : <FileText size={14} />,
        fileType: fileEntry.type,
        fileTab: fileEntry.tab,
        projectId: targetProject,
        action: () => {
          onClose();
          onNavigate(`project:${targetProject}`);
          if (onHighlightNavigate) {
            onHighlightNavigate(targetProject, { type: "file", fileName: fileEntry.name, fileTab: fileEntry.tab });
          }
        },
      });
    }

    quickActions.forEach((act) => {
      const action = actionHandlers[act.id];
      if (typeof action !== "function") {
        return;
      }
      if (
        act.label.toLowerCase().includes(normalizedDeferredQuery)
        || act.keyword.toLowerCase().includes(normalizedDeferredQuery)
      ) {
        items.push({
          id: act.id,
          type: "action",
          title: act.label,
          subtitle: "Quick Action",
          icon: act.icon,
          action,
        });
      }
    });

    return items;
  }, [
    actionHandlers,
    firstActiveProjectId,
    normalizedDeferredQuery,
    onClose,
    onHighlightNavigate,
    onNavigate,
    projects,
    quickActions,
    searchIndex,
  ]);

  const grouped = useMemo(() => {
    return results.reduce<{
      projectResults: SearchResult[];
      taskResults: SearchResult[];
      fileResults: SearchResult[];
      actionResults: SearchResult[];
    }>((acc, result) => {
      if (result.type === "project") {
        acc.projectResults.push(result);
      } else if (result.type === "task") {
        acc.taskResults.push(result);
      } else if (result.type === "file") {
        acc.fileResults.push(result);
      } else {
        acc.actionResults.push(result);
      }
      return acc;
    }, {
      projectResults: [],
      taskResults: [],
      fileResults: [],
      actionResults: [],
    });
  }, [results]);

  const flatResults = useMemo(() => {
    return [...grouped.projectResults, ...grouped.taskResults, ...grouped.fileResults, ...grouped.actionResults];
  }, [grouped]);

  const defaultContent = useMemo(() => {
    const activeProjects = projectsList
      .filter((project) => !project.archived && project.status.label !== "Completed" && project.status.label !== "Draft")
      .slice(0, 4);

    const defaultItems: SearchResult[] = [];

    recentResults.forEach((recent) => {
      const project = projects[recent.id];
      if (project) {
        defaultItems.push({
          id: `recent-${project.id}`,
          type: "project",
          title: project.name,
          subtitle: project.archived ? "Archived" : `${project.category} · ${project.status.label}`,
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
    const defaultIds = new Set(defaultContent.map((item) => item.projectId).filter(Boolean));
    const items: SearchResult[] = [];
    let taskSuggestionCount = 0;

    for (const project of projectsList) {
      if (project.archived || project.status.label === "Completed") {
        continue;
      }
      for (const task of project.tasks || []) {
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
              onHighlightNavigate(project.id, { type: "task", taskId: task.id });
            }
          },
        });
      }
    }

    projectsList
      .filter((project) => !project.archived && project.status.label === "Draft" && !recentIds.has(project.id) && !defaultIds.has(project.id))
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
          action: () => { onClose(); onNavigate(`project:${project.id}`); },
        });
      });

    projectsList
      .filter((project) =>
        !project.archived
        && project.status.label !== "Completed"
        && project.status.label !== "Draft"
        && !recentIds.has(project.id)
        && !defaultIds.has(project.id))
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
          action: () => { onClose(); onNavigate(`project:${project.id}`); },
        });
      });

    return items;
  }, [defaultContent, onClose, onHighlightNavigate, onNavigate, projectsList, recentResults]);

  const combinedDefaultList = useMemo(() => [...defaultContent, ...suggestions], [defaultContent, suggestions]);

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
