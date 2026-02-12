import { useMemo } from "react";
import type { QuickAction } from "./types";
import type { AppView } from "../../lib/routing";
import type { ProjectData, ProjectFileData, Task } from "../../types";
import { useSearchIndex } from "./useSearchIndex";
import { useSearchResults } from "./useSearchResults";

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
      "action-activities": () => {
        onClose();
        onNavigate("activities");
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

  const {
    projectsList,
    effectiveWorkspaceTasks,
    normalizedDeferredQuery,
    firstActiveProjectId,
    matchedEntries,
  } = useSearchIndex({
    projects,
    workspaceTasks,
    files,
    deferredQuery,
    quickActions,
  });

  const {
    grouped,
    flatResults,
    defaultContent,
    suggestions,
    combinedDefaultList,
  } = useSearchResults({
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
  });

  return {
    actionHandlers,
    grouped,
    flatResults,
    defaultContent,
    suggestions,
    combinedDefaultList,
    trimmedQuery: query.trim(),
  };
};
