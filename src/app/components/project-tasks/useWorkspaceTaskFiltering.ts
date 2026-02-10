import { useMemo } from "react";
import { compareNullableEpochMsAsc } from "../../lib/dates";
import type { Task } from "../../types";

export type TaskSortBy = "dueDate" | "name" | "status";

export const TASK_SORT_OPTIONS: ReadonlyArray<{ id: TaskSortBy; label: string }> = [
  { id: "dueDate", label: "Due Date" },
  { id: "name", label: "Name" },
  { id: "status", label: "Status" },
];

type UseWorkspaceTaskFilteringArgs = {
  initialTasks: Task[];
  disableInternalSort: boolean;
  sortBy: TaskSortBy;
};

export function useWorkspaceTaskFiltering({
  initialTasks,
  disableInternalSort,
  sortBy,
}: UseWorkspaceTaskFilteringArgs) {
  const sortedTasks = useMemo(
    () =>
      disableInternalSort
        ? initialTasks
        : [...initialTasks].sort((a, b) => {
            if (sortBy === "name") return a.title.localeCompare(b.title);
            if (sortBy === "status") return Number(a.completed) - Number(b.completed);
            return compareNullableEpochMsAsc(a.dueDateEpochMs, b.dueDateEpochMs);
          }),
    [disableInternalSort, initialTasks, sortBy],
  );

  const shouldOptimizeTaskRows = sortedTasks.length > 40;
  const taskRowStyle = useMemo(
    () =>
      shouldOptimizeTaskRows
        ? ({ contentVisibility: "auto", containIntrinsicSize: "56px" } as const)
        : undefined,
    [shouldOptimizeTaskRows],
  );

  return {
    sortedTasks,
    taskRowStyle,
  };
}
