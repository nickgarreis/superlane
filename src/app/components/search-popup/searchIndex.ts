import { formatFileDisplayDate, formatTaskDueDate } from "../../lib/dates";
import type { ProjectData, ProjectFileData } from "../../types";
import type {
  SearchIndexedFile,
  SearchIndexedProject,
  SearchIndexedTask,
  SearchResult,
} from "./types";
export type SearchIndex = {
  projectIndex: SearchIndexedProject[];
  taskIndex: SearchIndexedTask[];
  fileIndex: SearchIndexedFile[];
};
export type GroupedSearchResults = {
  projectResults: SearchResult[];
  taskResults: SearchResult[];
  fileResults: SearchResult[];
  actionResults: SearchResult[];
};
export const buildSearchIndex = ({
  projectsList,
  files,
}: {
  projectsList: ProjectData[];
  files: ProjectFileData[];
}): SearchIndex => {
  const projectIndex: SearchIndexedProject[] = [];
  const taskIndex: SearchIndexedTask[] = [];
  for (const project of projectsList) {
    const projectSearchable = [
      project.name,
      project.description,
      project.category,
      project.status.label,
      project.scope ?? "",
    ]
      .join(" ")
      .toLowerCase();
    projectIndex.push({ project, searchable: projectSearchable });
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
        searchable:
          `${task.title} ${assigneeName} ${dueDateLabel}`.toLowerCase(),
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
  return { projectIndex, taskIndex, fileIndex };
};
export const groupSearchResults = (
  results: SearchResult[],
): GroupedSearchResults => {
  return results.reduce<GroupedSearchResults>(
    (acc, result) => {
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
    },
    { projectResults: [], taskResults: [], fileResults: [], actionResults: [] },
  );
};
