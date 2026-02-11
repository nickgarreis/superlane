import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Archive,
  ChevronDown,
  ChevronUp,
  CornerDownLeft,
  ListChecks,
  Palette,
  Plus,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeScrollIntoView } from "../lib/dom";
import { useSearchPopupData } from "./search-popup/useSearchPopupData";
import type {
  QuickAction,
  SearchPopupProps,
  SearchResult,
} from "./search-popup/types";
import { SearchPopupInput } from "./search-popup/SearchPopupInput";
import { SearchPopupResults } from "./search-popup/SearchPopupResults";
import { useSearchPopupKeyboard } from "./search-popup/useSearchPopupKeyboard";
const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "action-create",
    label: "Create New Project",
    icon: <Plus size={15} />,
    keyword: "create new add project",
  },
  {
    id: "action-tasks",
    label: "Go to Tasks",
    icon: <ListChecks size={15} />,
    keyword: "tasks todo list",
  },
  {
    id: "action-assets",
    label: "Go to Brand Assets",
    icon: <Palette size={15} />,
    keyword: "brand assets design",
  },
  {
    id: "action-archive",
    label: "Go to Archive",
    icon: <Archive size={15} />,
    keyword: "archive archived",
  },
  {
    id: "action-settings",
    label: "Open Settings",
    icon: <Settings size={15} />,
    keyword: "settings preferences config",
  },
];
const MAX_RECENT = 5;
export function SearchPopup({
  isOpen,
  onClose,
  projects,
  files,
  workspaceFilesPaginationStatus = "Exhausted",
  loadMoreWorkspaceFiles,
  onNavigate,
  onOpenCreateProject,
  onOpenSettings,
  onHighlightNavigate,
}: SearchPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef<boolean>(false);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentResults, setRecentResults] = useState<
    Array<{ id: string; title: string; type: string }>
  >([]);
  const {
    actionHandlers,
    grouped,
    flatResults,
    defaultContent,
    suggestions,
    combinedDefaultList,
    trimmedQuery,
  } = useSearchPopupData({
    projects,
    files,
    query,
    deferredQuery,
    recentResults,
    onClose,
    onNavigate,
    onOpenCreateProject,
    onOpenSettings,
    onHighlightNavigate,
    quickActions: QUICK_ACTIONS,
  });
  const handleQueryChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      startTransition(() => {
        setQuery(nextValue);
      });
    },
    [],
  );
  const handleClearQuery = useCallback(() => {
    startTransition(() => {
      setQuery("");
    });
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (!isOpen) {
      isLoadingRef.current = false;
      return;
    }
    setQuery("");
    setActiveIndex(0);
    const frame = requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [isOpen, onClose]);
  const hasSearchQuery = trimmedQuery.length > 0;
  const currentList = hasSearchQuery ? flatResults : combinedDefaultList;
  const shouldOptimizeLongList =
    currentList.length > 40 || flatResults.length > 40;
  const longListStyle = shouldOptimizeLongList
    ? ({ contentVisibility: "auto", containIntrinsicSize: "520px" } as const)
    : undefined;
  const itemPerformanceStyle = shouldOptimizeLongList
    ? ({ contentVisibility: "auto", containIntrinsicSize: "44px" } as const)
    : undefined;
  useEffect(() => {
    setActiveIndex(0);
  }, [trimmedQuery]);
  const trackRecent = useCallback((id: string, title: string, type: string) => {
    setRecentResults((prev) => {
      const filtered = prev.filter((entry) => entry.id !== id);
      return [{ id, title, type }, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);
  const trackRecentSearch = useCallback((value: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (entry) => entry.toLowerCase() !== value.toLowerCase(),
      );
      return [value, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);
  const { handleKeyDown } = useSearchPopupKeyboard({
    hasSearchQuery,
    currentList,
    quickActions: QUICK_ACTIONS,
    activeIndex,
    setActiveIndex,
    actionHandlers,
    trackRecent,
    trackRecentSearch,
    trimmedQuery,
  });
  useEffect(() => {
    if (workspaceFilesPaginationStatus !== "LoadingMore") {
      isLoadingRef.current = false;
    }
  }, [workspaceFilesPaginationStatus]);
  useEffect(() => {
    if (!resultsRef.current) {
      return;
    }
    const activeElement = resultsRef.current.querySelector(
      `[data-index="${activeIndex}"]`,
    );
    safeScrollIntoView(activeElement, { block: "nearest", behavior: "smooth" });
  }, [activeIndex]);
  const handleItemClick = useCallback(
    (item: SearchResult) => {
      if (item.projectId) {
        trackRecent(item.projectId, item.title, item.type);
      }
      if (hasSearchQuery) {
        trackRecentSearch(trimmedQuery);
      }
      item.action();
    },
    [hasSearchQuery, trackRecent, trackRecentSearch, trimmedQuery],
  );
  const hasResults = flatResults.length > 0;
  const handleResultsScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (
        isLoadingRef.current ||
        !hasSearchQuery ||
        workspaceFilesPaginationStatus !== "CanLoadMore" ||
        !loadMoreWorkspaceFiles
      ) {
        return;
      }
      const element = event.currentTarget;
      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= 220) {
        isLoadingRef.current = true;
        loadMoreWorkspaceFiles(100);
      }
    },
    [hasSearchQuery, loadMoreWorkspaceFiles, workspaceFilesPaginationStatus],
  );
  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[min(20vh,180px)] bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[560px] bg-[#1C1D1E] border border-white/[0.06] rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[min(70vh,520px)]"
            onClick={(event: React.MouseEvent<HTMLDivElement>) =>
              event.stopPropagation()
            }
          >
            <SearchPopupInput
              inputRef={inputRef}
              query={query}
              onQueryChange={handleQueryChange}
              onKeyDown={handleKeyDown}
              onClearQuery={handleClearQuery}
            />
            <SearchPopupResults
              resultsRef={resultsRef}
              longListStyle={longListStyle}
              itemPerformanceStyle={itemPerformanceStyle}
              onScroll={handleResultsScroll}
              hasSearchQuery={hasSearchQuery}
              hasResults={hasResults}
              query={query}
              flatResults={flatResults}
              grouped={grouped}
              activeIndex={activeIndex}
              setActiveIndex={setActiveIndex}
              handleItemClick={handleItemClick}
              recentSearches={recentSearches}
              onRecentSearchClick={setQuery}
              recentResults={recentResults}
              defaultContent={defaultContent}
              suggestions={suggestions}
              combinedDefaultList={combinedDefaultList}
              quickActions={QUICK_ACTIONS}
              actionHandlers={actionHandlers}
            />
            <div className="flex items-center gap-4 px-4 h-[36px] shrink-0 border-t border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-1.5 txt-role-kbd text-white/20">
                <span className="flex items-center gap-0.5">
                  <kbd className="inline-flex items-center justify-center size-4 rounded bg-white/[0.06] border border-white/[0.06]">
                    <ChevronUp size={9} />
                  </kbd>
                  <kbd className="inline-flex items-center justify-center size-4 rounded bg-white/[0.06] border border-white/[0.06]">
                    <ChevronDown size={9} />
                  </kbd>
                </span>
                navigate
              </div>
              <div className="flex items-center gap-1.5 txt-role-kbd text-white/20">
                <kbd className="inline-flex items-center justify-center h-4 px-1 rounded bg-white/[0.06] border border-white/[0.06]">
                  <CornerDownLeft size={9} />
                </kbd>
                open
              </div>
              <div className="flex items-center gap-1.5 txt-role-kbd text-white/20">
                <kbd className="px-1 h-4 inline-flex items-center rounded bg-white/[0.06] border border-white/[0.06] txt-role-micro">
                  esc
                </kbd>
                close
              </div>
              {hasSearchQuery && hasResults && (
                <span className="ml-auto txt-role-kbd text-white/15 tabular-nums">
                  {flatResults.length} result
                  {flatResults.length !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
