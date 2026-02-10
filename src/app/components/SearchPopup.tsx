import React, {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  Search,
  ListChecks,
  Plus,
  Settings,
  Palette,
  Archive,
  CornerDownLeft,
  ChevronUp,
  ChevronDown,
  Clock,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { safeScrollIntoView } from "../lib/dom";
import { SectionLabel, SearchPopupQuickActionItem, SearchPopupResultItem } from "./search-popup/SearchPopupListItems";
import { useSearchPopupData } from "./search-popup/useSearchPopupData";
import type { QuickAction, SearchPopupProps, SearchResult } from "./search-popup/types";

const QUICK_ACTIONS: QuickAction[] = [
  { id: "action-create", label: "Create New Project", icon: <Plus size={15} />, keyword: "create new add project" },
  { id: "action-tasks", label: "Go to Tasks", icon: <ListChecks size={15} />, keyword: "tasks todo list" },
  { id: "action-assets", label: "Go to Brand Assets", icon: <Palette size={15} />, keyword: "brand assets design" },
  { id: "action-archive", label: "Go to Archive", icon: <Archive size={15} />, keyword: "archive archived" },
  { id: "action-settings", label: "Open Settings", icon: <Settings size={15} />, keyword: "settings preferences config" },
];

const MAX_RECENT = 5;

export function SearchPopup({
  isOpen,
  onClose,
  projects,
  files,
  onNavigate,
  onOpenCreateProject,
  onOpenSettings,
  onHighlightNavigate,
}: SearchPopupProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [recentResults, setRecentResults] = useState<Array<{ id: string; title: string; type: string }>>([]);

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

  const handleQueryChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    startTransition(() => {
      setQuery(nextValue);
    });
  }, []);

  useEffect(() => {
    if (!isOpen) {
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
  const shouldOptimizeLongList = currentList.length > 40 || flatResults.length > 40;
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
      const filtered = prev.filter((entry) => entry.toLowerCase() !== value.toLowerCase());
      return [value, ...filtered].slice(0, MAX_RECENT);
    });
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    const totalQuickActions = hasSearchQuery ? 0 : QUICK_ACTIONS.length;
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
      if (!hasSearchQuery && actionIdx >= 0 && actionIdx < QUICK_ACTIONS.length) {
        const action = QUICK_ACTIONS[actionIdx];
        actionHandlers[action.id]();
      }
    }
  }, [
    actionHandlers,
    activeIndex,
    currentList,
    hasSearchQuery,
    trackRecent,
    trackRecentSearch,
    trimmedQuery,
  ]);

  useEffect(() => {
    if (!resultsRef.current) {
      return;
    }
    const activeElement = resultsRef.current.querySelector(`[data-index="${activeIndex}"]`);
    safeScrollIntoView(activeElement, { block: "nearest", behavior: "smooth" });
  }, [activeIndex]);

  const handleItemClick = useCallback((item: SearchResult) => {
    if (item.projectId) {
      trackRecent(item.projectId, item.title, item.type);
    }
    if (hasSearchQuery) {
      trackRecentSearch(trimmedQuery);
    }
    item.action();
  }, [hasSearchQuery, trackRecent, trackRecentSearch, trimmedQuery]);

  const hasResults = flatResults.length > 0;

  const projectOffset = 0;
  const taskOffset = grouped.projectResults.length;
  const fileOffset = taskOffset + grouped.taskResults.length;
  const actionOffset = fileOffset + grouped.fileResults.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[min(20vh,180px)] bg-black/60 backdrop-blur-sm" onClick={onClose}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-[560px] bg-[#1C1D1E] border border-white/[0.06] rounded-2xl shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col max-h-[min(70vh,520px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 h-[52px] shrink-0 border-b border-white/[0.06]">
              <Search size={17} className="text-white/30 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                onKeyDown={handleKeyDown}
                placeholder="Search projects, tasks, files, or actions..."
                className="flex-1 bg-transparent border-none text-[14px] text-[#E8E8E8] placeholder:text-white/25 focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => {
                    startTransition(() => {
                      setQuery("");
                    });
                    inputRef.current?.focus();
                  }}
                  className="p-1 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X size={14} className="text-white/30" />
                </button>
              )}
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-white/25 bg-white/[0.04] rounded border border-white/[0.06] shrink-0 select-none">ESC</kbd>
            </div>

            <div ref={resultsRef} className="flex-1 overflow-y-auto overflow-x-hidden py-1.5 scrollbar-hide" style={longListStyle}>
              {hasSearchQuery ? (
                hasResults ? (
                  <>
                    {grouped.projectResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Projects" count={grouped.projectResults.length} />
                        {grouped.projectResults.map((item, index) => (
                          <SearchPopupResultItem
                            key={item.id}
                            item={item}
                            index={projectOffset + index}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            handleItemClick={handleItemClick}
                            hasSearchQuery={hasSearchQuery}
                            query={query}
                            itemPerformanceStyle={itemPerformanceStyle}
                          />
                        ))}
                      </div>
                    )}
                    {grouped.taskResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Tasks" count={grouped.taskResults.length} />
                        {grouped.taskResults.map((item, index) => (
                          <SearchPopupResultItem
                            key={item.id}
                            item={item}
                            index={taskOffset + index}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            handleItemClick={handleItemClick}
                            hasSearchQuery={hasSearchQuery}
                            query={query}
                            itemPerformanceStyle={itemPerformanceStyle}
                          />
                        ))}
                      </div>
                    )}
                    {grouped.fileResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Files" count={grouped.fileResults.length} />
                        {grouped.fileResults.map((item, index) => (
                          <SearchPopupResultItem
                            key={item.id}
                            item={item}
                            index={fileOffset + index}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            handleItemClick={handleItemClick}
                            hasSearchQuery={hasSearchQuery}
                            query={query}
                            itemPerformanceStyle={itemPerformanceStyle}
                          />
                        ))}
                      </div>
                    )}
                    {grouped.actionResults.length > 0 && (
                      <div className="mb-1">
                        <SectionLabel label="Quick Actions" />
                        {grouped.actionResults.map((item, index) => (
                          <SearchPopupResultItem
                            key={item.id}
                            item={item}
                            index={actionOffset + index}
                            activeIndex={activeIndex}
                            setActiveIndex={setActiveIndex}
                            handleItemClick={handleItemClick}
                            hasSearchQuery={hasSearchQuery}
                            query={query}
                            itemPerformanceStyle={itemPerformanceStyle}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="size-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                      <Search size={18} className="text-white/20" />
                    </div>
                    <p className="text-[13px] text-white/40 mb-1">No results for &ldquo;{query}&rdquo;</p>
                    <p className="text-[11px] text-white/20">Try a project name, task, file, or category</p>
                  </div>
                )
              ) : (
                <>
                  {recentSearches.length > 0 && (
                    <div className="px-4 pt-1 pb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Clock size={11} className="text-white/20 shrink-0" />
                        {recentSearches.map((search, index) => (
                          <button
                            key={`${search}-${index}`}
                            className="text-[11px] text-white/35 hover:text-white/60 bg-white/[0.04] hover:bg-white/[0.07] px-2 py-0.5 rounded-md transition-colors"
                            onClick={() => {
                              startTransition(() => {
                                setQuery(search);
                              });
                            }}
                          >
                            {search}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mb-1">
                    <SectionLabel label={recentResults.length > 0 ? "Recent" : "Projects"} />
                    {defaultContent.map((item, index) => (
                      <SearchPopupResultItem
                        key={item.id}
                        item={item}
                        index={index}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        handleItemClick={handleItemClick}
                        hasSearchQuery={hasSearchQuery}
                        query={query}
                        itemPerformanceStyle={itemPerformanceStyle}
                      />
                    ))}
                  </div>

                  {suggestions.length > 0 && (
                    <div className="mb-1">
                      <SectionLabel label="Suggestions" />
                      {suggestions.map((item, index) => (
                        <SearchPopupResultItem
                          key={item.id}
                          item={item}
                          index={defaultContent.length + index}
                          activeIndex={activeIndex}
                          setActiveIndex={setActiveIndex}
                          handleItemClick={handleItemClick}
                          hasSearchQuery={hasSearchQuery}
                          query={query}
                          itemPerformanceStyle={itemPerformanceStyle}
                        />
                      ))}
                    </div>
                  )}

                  <div className="mb-1">
                    <SectionLabel label="Quick Actions" />
                    {QUICK_ACTIONS.map((action, index) => (
                      <SearchPopupQuickActionItem
                        key={action.id}
                        action={action}
                        globalIndex={combinedDefaultList.length + index}
                        activeIndex={activeIndex}
                        setActiveIndex={setActiveIndex}
                        onClick={() => actionHandlers[action.id]()}
                        itemPerformanceStyle={itemPerformanceStyle}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center gap-4 px-4 h-[36px] shrink-0 border-t border-white/[0.04] bg-white/[0.015]">
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <span className="flex items-center gap-0.5">
                  <kbd className="inline-flex items-center justify-center size-4 rounded bg-white/[0.06] border border-white/[0.06]"><ChevronUp size={9} /></kbd>
                  <kbd className="inline-flex items-center justify-center size-4 rounded bg-white/[0.06] border border-white/[0.06]"><ChevronDown size={9} /></kbd>
                </span>
                navigate
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="inline-flex items-center justify-center h-4 px-1 rounded bg-white/[0.06] border border-white/[0.06]"><CornerDownLeft size={9} /></kbd>
                open
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-white/20">
                <kbd className="px-1 h-4 inline-flex items-center rounded bg-white/[0.06] border border-white/[0.06] text-[9px]">esc</kbd>
                close
              </div>
              {hasSearchQuery && hasResults && (
                <span className="ml-auto text-[10px] text-white/15 tabular-nums">{flatResults.length} result{flatResults.length !== 1 ? "s" : ""}</span>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
