import { useCallback, useEffect, useRef, useState } from "react";
import { safeScrollIntoView } from "../../lib/dom";
import type { PendingHighlight } from "../../dashboard/types";
import type { ProjectFileData, ProjectFileTab, Task } from "../../types";

const PROJECT_FILE_TABS: readonly ProjectFileTab[] = ["Assets", "Contract", "Attachments"];

const isProjectFileTab = (value: string): value is ProjectFileTab =>
  (PROJECT_FILE_TABS as readonly string[]).includes(value);

type UseMainContentHighlightingArgs = {
  projectId: string;
  tasks: Task[];
  projectFiles: ProjectFileData[];
  pendingHighlight?: PendingHighlight | null;
  onClearPendingHighlight?: () => void;
  setActiveTab: (tab: ProjectFileTab) => void;
};

export function useMainContentHighlighting({
  projectId,
  tasks,
  projectFiles,
  pendingHighlight,
  onClearPendingHighlight,
  setActiveTab,
}: UseMainContentHighlightingArgs) {
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [highlightedFileId, setHighlightedFileId] = useState<string | null>(null);
  const fileRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleMentionClick = useCallback(
    (type: "task" | "file" | "user", label: string) => {
      if (type === "task") {
        const task = tasks.find((entry) => entry.title === label);
        if (task) {
          setHighlightedTaskId(task.id);
        }
        return;
      }

      if (type === "file") {
        const file = projectFiles.find((entry) => entry.name === label);
        if (file) {
          setActiveTab(file.tab);
          setHighlightedFileId(file.id);
        }
      }
      // type === "user" intentionally has no navigation action.
    },
    [projectFiles, setActiveTab, tasks],
  );

  const handleTaskHighlightDone = useCallback(() => {
    setHighlightedTaskId(null);
  }, []);

  useEffect(() => {
    if (highlightedFileId == null) {
      return;
    }
    // Delay to allow tab switch + render to complete before querying refs.
    const timeout = setTimeout(() => {
      const element = fileRowRefs.current[highlightedFileId];
      if (element) {
        safeScrollIntoView(element, { behavior: "smooth", block: "center" });
        element.classList.remove("file-row-flash");
        void element.offsetWidth;
        element.classList.add("file-row-flash");
      }
    }, 50);
    const clearTimer = setTimeout(() => {
      setHighlightedFileId(null);
    }, 1650);
    return () => {
      clearTimeout(timeout);
      clearTimeout(clearTimer);
    };
  }, [highlightedFileId]);

  useEffect(() => {
    if (!pendingHighlight) {
      return;
    }
    if (pendingHighlight.projectId && pendingHighlight.projectId !== projectId) {
      return;
    }

    if (pendingHighlight.type === "task" && pendingHighlight.taskId) {
      setHighlightedTaskId(pendingHighlight.taskId);
      onClearPendingHighlight?.();
      return;
    }

    if (pendingHighlight.type === "file" && pendingHighlight.fileName) {
      if (pendingHighlight.fileTab && isProjectFileTab(pendingHighlight.fileTab)) {
        setActiveTab(pendingHighlight.fileTab);
      }
      const file = projectFiles.find(
        (entry) =>
          entry.name === pendingHighlight.fileName
          && (!pendingHighlight.fileTab || entry.tab === pendingHighlight.fileTab),
      ) ?? projectFiles.find((entry) => entry.name === pendingHighlight.fileName);

      if (file) {
        setHighlightedFileId(file.id);
      }
      onClearPendingHighlight?.();
    }
  }, [onClearPendingHighlight, pendingHighlight, projectFiles, projectId, setActiveTab]);

  return {
    highlightedTaskId,
    handleTaskHighlightDone,
    fileRowRefs,
    handleMentionClick,
  };
}
