import { useCallback, type Dispatch, type KeyboardEvent, type SetStateAction } from "react";
import type { QuickAction, SearchResult } from "./types";

type UseSearchPopupKeyboardArgs = {
  hasSearchQuery: boolean;
  currentList: SearchResult[];
  quickActions: QuickAction[];
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  actionHandlers: Record<string, () => void>;
  trackRecent: (id: string, title: string, type: string) => void;
  trackRecentSearch: (value: string) => void;
  trimmedQuery: string;
};

export function useSearchPopupKeyboard({
  hasSearchQuery,
  currentList,
  quickActions,
  activeIndex,
  setActiveIndex,
  actionHandlers,
  trackRecent,
  trackRecentSearch,
  trimmedQuery,
}: UseSearchPopupKeyboardArgs) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const totalQuickActions = hasSearchQuery ? 0 : quickActions.length;
    const total = currentList.length + totalQuickActions;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % Math.max(total, 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + Math.max(total, 1)) % Math.max(total, 1));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex < currentList.length) {
        const item = currentList[activeIndex];
        if (item.projectId) {
          trackRecent(item.projectId, item.title, item.type);
        }
        if (hasSearchQuery) {
          trackRecentSearch(trimmedQuery);
        }
        item.action();
        return;
      }

      const actionIdx = activeIndex - currentList.length;
      if (!hasSearchQuery && actionIdx >= 0 && actionIdx < quickActions.length) {
        const action = quickActions[actionIdx];
        const handler = actionHandlers[action.id];
        if (typeof handler === "function") {
          handler();
        }
      }
    }
  }, [
    actionHandlers,
    activeIndex,
    currentList,
    hasSearchQuery,
    quickActions,
    setActiveIndex,
    trackRecent,
    trackRecentSearch,
    trimmedQuery,
  ]);

  return {
    handleKeyDown,
  };
}
