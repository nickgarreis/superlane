import { useMemo } from "react";
import { FileText, ListChecks, Paperclip } from "lucide-react";
import { ProjectLogo } from "../ProjectLogo";
import type { AppView } from "../../lib/routing";
import type { ProjectData, Task } from "../../types";
import { groupSearchResults } from "./searchIndex";
import { useSearchDefaultContent } from "./useSearchDefaultContent";
import { toProjectSearchIntent } from "./navigationIntent";
import type {
  QuickAction,
  SearchIndexedFile,
  SearchIndexedProject,
  SearchIndexedTask,
  SearchResult,
} from "./types";

type UseSearchResultsArgs = {
  projects: Record<string, ProjectData>;
  projectsList: ProjectData[];
  effectiveWorkspaceTasks: Task[];
  recentResults: Array<{ id: string; title: string; type: string }>;
  normalizedDeferredQuery: string;
  firstActiveProjectId: string | undefined;
  matchedEntries: {
    projectEntries: SearchIndexedProject[];
    taskEntries: SearchIndexedTask[];
    fileEntries: SearchIndexedFile[];
    actionEntries: QuickAction[];
  };
  actionHandlers: Record<string, () => void>;
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

export function useSearchResults({
  projects,
  projectsList,
  effectiveWorkspaceTasks,
  recentResults,
  normalizedDeferredQuery,
  firstActiveProjectId,
  matchedEntries,
  actionHandlers,
  onClose,
  onNavigate,
  onHighlightNavigate,
}: UseSearchResultsArgs) {
  const projectActionById = useMemo(() => {
    const handlers = new Map<string, () => void>();
    for (const { project } of matchedEntries.projectEntries) {
      handlers.set(project.id, () => {
        onNavigate(toProjectSearchIntent(project));
        onClose();
      });
    }
    return handlers;
  }, [matchedEntries.projectEntries, onClose, onNavigate]);

  const taskActionByKey = useMemo(() => {
    const handlers = new Map<string, () => void>();
    for (const taskEntry of matchedEntries.taskEntries) {
      const key = `${taskEntry.projectId}:${taskEntry.taskId}`;
      handlers.set(key, () => {
        onClose();
        onNavigate(`project:${taskEntry.projectId}`);
        if (onHighlightNavigate) {
          onHighlightNavigate(taskEntry.projectId, {
            type: "task",
            taskId: taskEntry.taskId,
          });
        }
      });
    }
    return handlers;
  }, [matchedEntries.taskEntries, onClose, onHighlightNavigate, onNavigate]);

  const fileActionByKey = useMemo(() => {
    const handlers = new Map<string, () => void>();
    for (const fileEntry of matchedEntries.fileEntries) {
      const targetProject = fileEntry.projectId || firstActiveProjectId;
      if (!targetProject) {
        continue;
      }
      handlers.set(fileEntry.key, () => {
        onClose();
        onNavigate(`project:${targetProject}`);
        if (onHighlightNavigate) {
          onHighlightNavigate(targetProject, {
            type: "file",
            fileName: fileEntry.name,
            fileTab: fileEntry.tab,
          });
        }
      });
    }
    return handlers;
  }, [
    firstActiveProjectId,
    matchedEntries.fileEntries,
    onClose,
    onHighlightNavigate,
    onNavigate,
  ]);

  const results = useMemo(() => {
    if (!normalizedDeferredQuery) {
      return [] as SearchResult[];
    }

    const items: SearchResult[] = [];
    for (const { project } of matchedEntries.projectEntries) {
      const action = projectActionById.get(project.id);
      if (!action) {
        continue;
      }
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
        action,
      });
    }

    for (const taskEntry of matchedEntries.taskEntries) {
      const action = taskActionByKey.get(`${taskEntry.projectId}:${taskEntry.taskId}`);
      if (!action) {
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
        action,
      });
    }

    for (const fileEntry of matchedEntries.fileEntries) {
      const targetProject = fileEntry.projectId || firstActiveProjectId;
      if (!targetProject) {
        continue;
      }
      const action = fileActionByKey.get(fileEntry.key);
      if (!action) {
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
        action,
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
    fileActionByKey,
    firstActiveProjectId,
    matchedEntries.actionEntries,
    matchedEntries.fileEntries,
    matchedEntries.projectEntries,
    matchedEntries.taskEntries,
    normalizedDeferredQuery,
    projectActionById,
    projects,
    taskActionByKey,
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

  const { defaultContent, suggestions, combinedDefaultList } = useSearchDefaultContent({
    projects,
    projectsList,
    effectiveWorkspaceTasks,
    recentResults,
    onClose,
    onNavigate,
    onHighlightNavigate,
  });

  return {
    grouped,
    flatResults,
    defaultContent,
    suggestions,
    combinedDefaultList,
  };
}
