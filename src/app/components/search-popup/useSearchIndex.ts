import { useMemo, useRef } from "react";
import { formatFileDisplayDate, formatTaskDueDate } from "../../lib/dates";
import type { ProjectData, ProjectFileData, Task } from "../../types";
import type {
  QuickAction,
  SearchIndexedFile,
  SearchIndexedProject,
  SearchIndexedTask,
} from "./types";

const MAX_PROJECT_RESULTS = 30;
const MAX_TASK_RESULTS = 40;
const MAX_FILE_RESULTS = 40;
const MAX_ACTION_RESULTS = 8;

type SearchIndexCache = {
  projects: Map<
    string,
    { signature: string; entry: SearchIndexedProject }
  >;
  tasks: Map<string, { signature: string; entry: SearchIndexedTask }>;
  files: Map<string, { signature: string; entry: SearchIndexedFile }>;
};

type UseSearchIndexArgs = {
  projects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  files: ProjectFileData[];
  deferredQuery: string;
  quickActions: QuickAction[];
};

type UseSearchIndexResult = {
  projectsList: ProjectData[];
  effectiveWorkspaceTasks: Task[];
  normalizedDeferredQuery: string;
  firstActiveProjectId: string | undefined;
  matchedEntries: {
    projectEntries: SearchIndexedProject[];
    taskEntries: SearchIndexedTask[];
    fileEntries: SearchIndexedFile[];
    actionEntries: QuickAction[];
  };
};

const createEmptyCache = (): SearchIndexCache => ({
  projects: new Map(),
  tasks: new Map(),
  files: new Map(),
});

export function useSearchIndex({
  projects,
  workspaceTasks,
  files,
  deferredQuery,
  quickActions,
}: UseSearchIndexArgs): UseSearchIndexResult {
  const cacheRef = useRef<SearchIndexCache>(createEmptyCache());
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

  const firstActiveProjectId = useMemo(() => {
    const active = projectsList.find(
      (project) =>
        !project.archived &&
        project.status.label !== "Draft" &&
        project.status.label !== "Review" &&
        project.status.label !== "Completed",
    );
    return active?.id || projectsList[0]?.id;
  }, [projectsList]);

  const searchIndex = useMemo(() => {
    const currentCache = cacheRef.current;
    const nextProjects = new Map<
      string,
      { signature: string; entry: SearchIndexedProject }
    >();
    const nextTasks = new Map<string, { signature: string; entry: SearchIndexedTask }>();
    const nextFiles = new Map<string, { signature: string; entry: SearchIndexedFile }>();

    const projectIndex: SearchIndexedProject[] = [];
    for (const project of projectsList) {
      const signature = [
        project.name,
        project.description,
        project.category,
        project.status.label,
        project.scope ?? "",
      ].join("|");
      const cached = currentCache.projects.get(project.id);
      if (cached && cached.signature === signature) {
        projectIndex.push(cached.entry);
        nextProjects.set(project.id, cached);
        continue;
      }
      const entry: SearchIndexedProject = {
        project,
        searchable: signature.split("|").join(" ").toLowerCase(),
      };
      const nextCached = { signature, entry };
      projectIndex.push(entry);
      nextProjects.set(project.id, nextCached);
    }

    const projectById = new Map(
      projectsList.map((project) => [project.id, project] as const),
    );
    const taskIndex: SearchIndexedTask[] = [];
    for (const task of effectiveWorkspaceTasks) {
      if (!task.projectId) {
        continue;
      }
      const project = projectById.get(task.projectId);
      if (!project) {
        continue;
      }
      if (
        project.status.label === "Draft" ||
        project.status.label === "Review" ||
        project.status.label === "Completed"
      ) {
        continue;
      }
      const taskKey = `${project.id}:${task.id}`;
      const signature = [
        task.title,
        task.assignee?.name ?? "",
        String(task.dueDateEpochMs ?? ""),
        String(task.completed),
        project.name,
      ].join("|");
      const cached = currentCache.tasks.get(taskKey);
      if (cached && cached.signature === signature) {
        taskIndex.push(cached.entry);
        nextTasks.set(taskKey, cached);
        continue;
      }

      const dueDateLabel = formatTaskDueDate(task.dueDateEpochMs);
      const assigneeName = task.assignee?.name?.trim() || "Unassigned";
      const entry: SearchIndexedTask = {
        projectId: project.id,
        projectName: project.name,
        taskId: task.id,
        title: task.title,
        assigneeName,
        dueDateLabel,
        completed: task.completed,
        searchable: `${task.title} ${assigneeName} ${dueDateLabel}`.toLowerCase(),
      };
      const nextCached = { signature, entry };
      taskIndex.push(entry);
      nextTasks.set(taskKey, nextCached);
    }

    const fileIndex: SearchIndexedFile[] = [];
    const seen = new Set<string>();
    for (const file of files) {
      const fileProject =
        file.projectPublicId && file.projectPublicId.trim().length > 0
          ? projectById.get(file.projectPublicId)
          : null;
      if (
        fileProject &&
        (fileProject.status.label === "Draft" ||
          fileProject.status.label === "Review" ||
          fileProject.status.label === "Completed")
      ) {
        continue;
      }
      const normalizedProjectId = file.projectPublicId ?? "no-project";
      const key = `${normalizedProjectId}-${file.tab}-${file.name}-${String(file.id)}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      const signature = [
        file.name,
        file.type,
        file.tab,
        file.projectPublicId ?? "",
        String(file.displayDateEpochMs ?? ""),
      ].join("|");
      const cached = currentCache.files.get(key);
      if (cached && cached.signature === signature) {
        fileIndex.push(cached.entry);
        nextFiles.set(key, cached);
        continue;
      }
      const entry: SearchIndexedFile = {
        key,
        name: file.name,
        type: file.type,
        tab: file.tab,
        projectId: file.projectPublicId ?? null,
        dateLabel: formatFileDisplayDate(file.displayDateEpochMs),
        searchable: `${file.name} ${file.type}`.toLowerCase(),
      };
      const nextCached = { signature, entry };
      fileIndex.push(entry);
      nextFiles.set(key, nextCached);
    }

    cacheRef.current = {
      projects: nextProjects,
      tasks: nextTasks,
      files: nextFiles,
    };

    return { projectIndex, taskIndex, fileIndex };
  }, [effectiveWorkspaceTasks, files, projectsList]);

  const matchedEntries = useMemo(() => {
    if (!normalizedDeferredQuery) {
      return {
        projectEntries: [] as SearchIndexedProject[],
        taskEntries: [] as SearchIndexedTask[],
        fileEntries: [] as SearchIndexedFile[],
        actionEntries: [] as QuickAction[],
      };
    }

    const projectEntries: SearchIndexedProject[] = [];
    for (const projectEntry of searchIndex.projectIndex) {
      if (!projectEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
      projectEntries.push(projectEntry);
      if (projectEntries.length >= MAX_PROJECT_RESULTS) {
        break;
      }
    }

    const taskEntries: SearchIndexedTask[] = [];
    for (const taskEntry of searchIndex.taskIndex) {
      if (!taskEntry.searchable.includes(normalizedDeferredQuery)) {
        continue;
      }
      taskEntries.push(taskEntry);
      if (taskEntries.length >= MAX_TASK_RESULTS) {
        break;
      }
    }

    const fileEntries: SearchIndexedFile[] = [];
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

  return {
    projectsList,
    effectiveWorkspaceTasks,
    normalizedDeferredQuery,
    firstActiveProjectId,
    matchedEntries,
  };
}
