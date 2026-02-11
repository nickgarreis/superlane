import { ArrowUpDown, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DeniedAction } from "../permissions/DeniedAction";
import {
  TASK_SORT_OPTIONS,
  type TaskSortBy,
} from "./useWorkspaceTaskFiltering";
import {
  MENU_CHECK_ICON_CLASS,
  MENU_HEADER_CLASS,
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "../ui/menuChrome";
type TasksToolbarProps = {
  taskCount: number;
  hideHeader: boolean;
  canAddTasks: boolean;
  addTaskDisabledMessage: string;
  onStartAdding: () => void;
  isSortOpen: boolean;
  onToggleSort: () => void;
  onCloseSort: () => void;
  sortBy: TaskSortBy;
  onSortSelect: (sortBy: TaskSortBy) => void;
};
export function TasksToolbar({
  taskCount,
  hideHeader,
  canAddTasks,
  addTaskDisabledMessage,
  onStartAdding,
  isSortOpen,
  onToggleSort,
  onCloseSort,
  sortBy,
  onSortSelect,
}: TasksToolbarProps) {
  if (hideHeader) {
    return null;
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <h4 className="txt-role-body-md font-medium txt-tone-subtle uppercase tracking-wider">
          Tasks ({taskCount})
        </h4>
      </div>
      <div className="flex items-center gap-3">
        <DeniedAction
          denied={!canAddTasks}
          reason={addTaskDisabledMessage}
          tooltipAlign="right"
        >
          <button
            type="button"
            onClick={() => {
              if (!canAddTasks) {
                return;
              }
              onStartAdding();
            }}
            aria-disabled={!canAddTasks}
            className={cn(
              "txt-role-body-sm font-medium transition-colors flex items-center gap-1",
              canAddTasks
                ? "txt-tone-accent hover:txt-tone-accent cursor-pointer"
                : "txt-tone-muted opacity-50 cursor-not-allowed",
            )}
          >
            <Plus size={14} /> Add Task
          </button>
        </DeniedAction>
        <div className="relative">
          <button
            onClick={onToggleSort}
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
              isSortOpen
                ? "bg-white/10 txt-tone-primary"
                : "txt-tone-subtle hover:txt-tone-primary hover:bg-white/5",
            )}
            title="Sort tasks"
          >
            <ArrowUpDown size={16} strokeWidth={2} />
          </button>
          {isSortOpen && (
            <div
              className={cn(
                "absolute right-0 top-full mt-2 w-48 p-1 z-50 animate-in fade-in zoom-in-95 duration-100",
                MENU_SURFACE_CLASS,
              )}
            >
              <div className={MENU_HEADER_CLASS}>
                Sort by
              </div>
              {TASK_SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSortSelect(option.id);
                    onCloseSort();
                  }}
                  className={cn(
                    MENU_ITEM_CLASS,
                    sortBy === option.id ? MENU_ITEM_ACTIVE_CLASS : "txt-tone-muted",
                  )}
                >
                  <div
                    className={cn(
                      MENU_CHECK_ICON_CLASS,
                      "flex items-center justify-center transition-opacity",
                      sortBy === option.id ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M9 1L3.5 6.5L1 4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span
                    className={cn(
                      "transition-colors",
                      sortBy === option.id
                        ? "text-white"
                        : "txt-tone-subtle group-hover:text-white",
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
