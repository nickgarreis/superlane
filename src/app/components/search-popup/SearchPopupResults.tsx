import { Clock, Search } from "lucide-react";
import {
  startTransition,
  type CSSProperties,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import { SectionLabel, SearchPopupQuickActionItem, SearchPopupResultItem } from "./SearchPopupListItems";
import type { QuickAction, SearchResult } from "./types";

type GroupedSearchResults = {
  projectResults: SearchResult[];
  taskResults: SearchResult[];
  fileResults: SearchResult[];
  actionResults: SearchResult[];
};

type SearchPopupResultsProps = {
  resultsRef: RefObject<HTMLDivElement>;
  longListStyle?: CSSProperties;
  itemPerformanceStyle?: CSSProperties;
  hasSearchQuery: boolean;
  hasResults: boolean;
  query: string;
  grouped: GroupedSearchResults;
  activeIndex: number;
  setActiveIndex: Dispatch<SetStateAction<number>>;
  handleItemClick: (item: SearchResult) => void;
  recentSearches: string[];
  onRecentSearchClick: (value: string) => void;
  recentResults: Array<{ id: string; title: string; type: string }>;
  defaultContent: SearchResult[];
  suggestions: SearchResult[];
  combinedDefaultList: SearchResult[];
  quickActions: QuickAction[];
  actionHandlers: Record<string, () => void>;
};

export function SearchPopupResults({
  resultsRef,
  longListStyle,
  itemPerformanceStyle,
  hasSearchQuery,
  hasResults,
  query,
  grouped,
  activeIndex,
  setActiveIndex,
  handleItemClick,
  recentSearches,
  onRecentSearchClick,
  recentResults,
  defaultContent,
  suggestions,
  combinedDefaultList,
  quickActions,
  actionHandlers,
}: SearchPopupResultsProps) {
  const projectOffset = 0;
  const taskOffset = grouped.projectResults.length;
  const fileOffset = taskOffset + grouped.taskResults.length;
  const actionOffset = fileOffset + grouped.fileResults.length;

  return (
    <div
      ref={resultsRef}
      className="flex-1 overflow-y-auto overflow-x-hidden py-1.5 scrollbar-hide"
      style={longListStyle}
    >
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
                        onRecentSearchClick(search);
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
            {quickActions.map((action, index) => (
              <SearchPopupQuickActionItem
                key={action.id}
                action={action}
                globalIndex={combinedDefaultList.length + index}
                activeIndex={activeIndex}
                setActiveIndex={setActiveIndex}
                onClick={() => {
                  const handler = actionHandlers[action.id];
                  if (typeof handler === "function") {
                    handler();
                  }
                }}
                itemPerformanceStyle={itemPerformanceStyle}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
