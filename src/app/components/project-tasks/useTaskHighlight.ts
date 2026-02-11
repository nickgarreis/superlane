import { useEffect, type MutableRefObject } from "react";
import { safeScrollIntoView } from "../../lib/dom";
type UseTaskHighlightArgs = {
  highlightedTaskId?: string | null;
  onHighlightDone?: () => void;
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
    const element = taskRowRefs.current[highlightedTaskId];
    if (!element) {
      onHighlightDone?.();
      return;
    }
    safeScrollIntoView(element, { behavior: "smooth", block: "center" });
    element.classList.add("task-row-flash");
    const timer = setTimeout(() => {
      element.classList.remove("task-row-flash");
      onHighlightDone?.();
    }, 1600);
    return () => {
      clearTimeout(timer);
      element.classList.remove("task-row-flash");
    };
  }, [highlightedTaskId, onHighlightDone, taskRowRefs]);
}
