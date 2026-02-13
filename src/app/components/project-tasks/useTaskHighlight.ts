import { useEffect, type MutableRefObject } from "react";
import { safeScrollIntoView } from "../../lib/dom";

const TASK_HIGHLIGHT_POLL_INTERVAL_MS = 50;
const TASK_HIGHLIGHT_DOM_WAIT_TIMEOUT_MS = 2000;
const TASK_HIGHLIGHT_FLASH_DURATION_MS = 1600;

export type TaskHighlightResult = {
  status: "applied" | "missing";
};

type UseTaskHighlightArgs = {
  highlightedTaskId?: string | null;
  onHighlightDone?: (result: TaskHighlightResult) => void;
  taskRowRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
};
export function useTaskHighlight({
  highlightedTaskId,
  onHighlightDone,
  taskRowRefs,
}: UseTaskHighlightArgs) {
  useEffect(() => {
    if (!highlightedTaskId) {
      return;
    }
    const taskRows = taskRowRefs.current;
    const startedAt = Date.now();
    let isCancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;
    let clearFlashTimer: ReturnType<typeof setTimeout> | null = null;

    const pollForTaskRow = () => {
      if (isCancelled) {
        return;
      }

      const element = taskRows[highlightedTaskId];
      if (element) {
        safeScrollIntoView(element, { behavior: "smooth", block: "center" });
        element.classList.add("task-row-flash");
        clearFlashTimer = setTimeout(() => {
          element.classList.remove("task-row-flash");
          if (isCancelled) {
            return;
          }
          onHighlightDone?.({ status: "applied" });
        }, TASK_HIGHLIGHT_FLASH_DURATION_MS);
        return;
      }

      if (Date.now() - startedAt >= TASK_HIGHLIGHT_DOM_WAIT_TIMEOUT_MS) {
        onHighlightDone?.({ status: "missing" });
        return;
      }

      pollTimer = setTimeout(
        pollForTaskRow,
        TASK_HIGHLIGHT_POLL_INTERVAL_MS,
      );
    };

    pollTimer = setTimeout(pollForTaskRow, TASK_HIGHLIGHT_POLL_INTERVAL_MS);

    return () => {
      isCancelled = true;
      if (pollTimer) {
        clearTimeout(pollTimer);
      }
      if (clearFlashTimer) {
        clearTimeout(clearFlashTimer);
      }
      const element = taskRows[highlightedTaskId];
      if (element) {
        element.classList.remove("task-row-flash");
      }
    };
  }, [highlightedTaskId, onHighlightDone, taskRowRefs]);
}
