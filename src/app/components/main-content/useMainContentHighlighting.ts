import { toast } from "sonner";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { safeScrollIntoView } from "../../lib/dom";
import type { PendingHighlight } from "../../dashboard/types";
import type { ProjectFileData, ProjectFileTab, Task } from "../../types";
import type { TaskHighlightResult } from "../project-tasks/useTaskHighlight";

const PROJECT_FILE_TABS: readonly ProjectFileTab[] = [
  "Assets",
  "Contract",
  "Attachments",
];

const HIGHLIGHT_POLL_INTERVAL_MS = 50;
const FILE_HIGHLIGHT_DOM_WAIT_TIMEOUT_MS = 2000;
const FILE_HIGHLIGHT_FLASH_DURATION_MS = 1600;
const DATA_RESOLUTION_TIMEOUT_MS = 5000;

const TASK_MISSING_MESSAGE =
  "Task could not be found. It may have been moved or deleted.";
const FILE_MISSING_MESSAGE =
  "File could not be found. It may have been moved or deleted.";

const isProjectFileTab = (value: string): value is ProjectFileTab =>
  (PROJECT_FILE_TABS as readonly string[]).includes(value);

type HighlightIntent =
  | {
      key: string;
      type: "task";
      taskId: string;
    }
  | {
      key: string;
      type: "file";
      fileName: string;
      fileTab?: string;
    };

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
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null,
  );
  const [highlightedFileId, setHighlightedFileId] = useState<string | null>(
    null,
  );

  const fileRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const activeIntentKeyRef = useRef<string | null>(null);
  const activeIntentTypeRef = useRef<"task" | "file" | null>(null);
  const highlightedTaskIntentKeyRef = useRef<string | null>(null);
  const highlightedFileIntentKeyRef = useRef<string | null>(null);
  const dataResolutionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const pendingProjectId = pendingHighlight?.projectId ?? null;
  const pendingHighlightType = pendingHighlight?.type ?? null;
  const pendingTaskId = pendingHighlight?.taskId ?? null;
  const pendingFileName = pendingHighlight?.fileName ?? null;
  const pendingFileTab = pendingHighlight?.fileTab ?? null;

  const pendingIntent = useMemo<HighlightIntent | null>(() => {
    if (!pendingHighlightType || pendingProjectId !== projectId) {
      return null;
    }
    if (pendingHighlightType === "task") {
      const taskId = pendingTaskId?.trim();
      if (!taskId) {
        return null;
      }
      return {
        key: `${projectId}:task:${taskId}`,
        type: "task",
        taskId,
      };
    }
    if (pendingHighlightType === "file") {
      const fileName = pendingFileName?.trim();
      if (!fileName) {
        return null;
      }
      const fileTab = pendingFileTab?.trim();
      return {
        key: `${projectId}:file:${fileTab ?? ""}:${fileName}`,
        type: "file",
        fileName,
        ...(fileTab ? { fileTab } : {}),
      };
    }
    return null;
  }, [
    pendingFileName,
    pendingFileTab,
    pendingHighlightType,
    pendingProjectId,
    pendingTaskId,
    projectId,
  ]);

  const clearDataResolutionTimer = useCallback(() => {
    if (dataResolutionTimerRef.current) {
      clearTimeout(dataResolutionTimerRef.current);
      dataResolutionTimerRef.current = null;
    }
  }, []);

  const finalizeIntent = useCallback(
    (
      status: "applied" | "missing",
      intentType: "task" | "file",
      intentKey: string | null,
    ) => {
      if (
        !intentKey ||
        activeIntentKeyRef.current !== intentKey ||
        activeIntentTypeRef.current !== intentType
      ) {
        return;
      }
      clearDataResolutionTimer();
      activeIntentKeyRef.current = null;
      activeIntentTypeRef.current = null;
      onClearPendingHighlight?.();
      if (status === "missing") {
        toast.error(
          intentType === "task" ? TASK_MISSING_MESSAGE : FILE_MISSING_MESSAGE,
        );
      }
    },
    [clearDataResolutionTimer, onClearPendingHighlight],
  );

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
    },
    [projectFiles, setActiveTab, tasks],
  );

  const handleTaskHighlightDone = useCallback(
    (result: TaskHighlightResult) => {
      const intentKey = highlightedTaskIntentKeyRef.current;
      highlightedTaskIntentKeyRef.current = null;
      finalizeIntent(result.status, "task", intentKey);
      setHighlightedTaskId(null);
    },
    [finalizeIntent],
  );

  useEffect(() => {
    if (!pendingIntent) {
      clearDataResolutionTimer();
      activeIntentKeyRef.current = null;
      activeIntentTypeRef.current = null;
      return;
    }
    if (activeIntentKeyRef.current === pendingIntent.key) {
      return;
    }
    clearDataResolutionTimer();
    activeIntentKeyRef.current = pendingIntent.key;
    activeIntentTypeRef.current = pendingIntent.type;
    dataResolutionTimerRef.current = setTimeout(() => {
      finalizeIntent("missing", pendingIntent.type, pendingIntent.key);
    }, DATA_RESOLUTION_TIMEOUT_MS);
  }, [clearDataResolutionTimer, finalizeIntent, pendingIntent]);

  useEffect(() => {
    if (!pendingIntent || pendingIntent.type !== "task") {
      return;
    }
    if (activeIntentKeyRef.current !== pendingIntent.key || highlightedTaskId) {
      return;
    }
    const hasTargetTask = tasks.some((task) => task.id === pendingIntent.taskId);
    if (!hasTargetTask) {
      return;
    }
    highlightedTaskIntentKeyRef.current = pendingIntent.key;
    setHighlightedTaskId(pendingIntent.taskId);
  }, [highlightedTaskId, pendingIntent, tasks]);

  useEffect(() => {
    if (!pendingIntent || pendingIntent.type !== "file") {
      return;
    }
    if (activeIntentKeyRef.current !== pendingIntent.key || highlightedFileId) {
      return;
    }
    const file =
      projectFiles.find(
        (entry) =>
          entry.name === pendingIntent.fileName &&
          (!pendingIntent.fileTab || entry.tab === pendingIntent.fileTab),
      ) ?? projectFiles.find((entry) => entry.name === pendingIntent.fileName);
    if (!file) {
      return;
    }
    const preferredTab =
      pendingIntent.fileTab && isProjectFileTab(pendingIntent.fileTab)
        ? pendingIntent.fileTab
        : file.tab;
    setActiveTab(preferredTab);
    highlightedFileIntentKeyRef.current = pendingIntent.key;
    setHighlightedFileId(file.id);
  }, [highlightedFileId, pendingIntent, projectFiles, setActiveTab]);

  useEffect(() => {
    if (highlightedFileId == null) {
      return;
    }
    const fileRows = fileRowRefs.current;
    const intentKey = highlightedFileIntentKeyRef.current;
    const startedAt = Date.now();
    let isCancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let clearFlashTimer: ReturnType<typeof setTimeout> | null = null;

    const pollForFileRow = () => {
      if (isCancelled) {
        return;
      }
      const element = fileRows[highlightedFileId];
      if (element) {
        safeScrollIntoView(element, { behavior: "smooth", block: "center" });
        element.classList.remove("file-row-flash");
        void element.offsetWidth;
        element.classList.add("file-row-flash");
        clearFlashTimer = setTimeout(() => {
          element.classList.remove("file-row-flash");
          if (isCancelled) {
            return;
          }
          highlightedFileIntentKeyRef.current = null;
          finalizeIntent("applied", "file", intentKey);
          setHighlightedFileId(null);
        }, FILE_HIGHLIGHT_FLASH_DURATION_MS);
        return;
      }
      if (Date.now() - startedAt >= FILE_HIGHLIGHT_DOM_WAIT_TIMEOUT_MS) {
        highlightedFileIntentKeyRef.current = null;
        finalizeIntent("missing", "file", intentKey);
        setHighlightedFileId(null);
        return;
      }
      pollTimer = setTimeout(pollForFileRow, HIGHLIGHT_POLL_INTERVAL_MS);
    };

    pollTimer = setTimeout(pollForFileRow, HIGHLIGHT_POLL_INTERVAL_MS);
    return () => {
      isCancelled = true;
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
      if (clearFlashTimer) {
        clearTimeout(clearFlashTimer);
      }
      const element = fileRows[highlightedFileId];
      if (element) {
        element.classList.remove("file-row-flash");
      }
    };
  }, [finalizeIntent, highlightedFileId]);

  useEffect(() => {
    return () => {
      clearDataResolutionTimer();
    };
  }, [clearDataResolutionTimer]);

  return {
    highlightedTaskId,
    highlightedFileId,
    handleTaskHighlightDone,
    fileRowRefs,
    handleMentionClick,
  };
}
