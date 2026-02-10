import { ArrowUpDown, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DeniedAction } from "../permissions/DeniedAction";
import { TASK_SORT_OPTIONS, type TaskSortBy } from "./useWorkspaceTaskFiltering";

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
        <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider">Tasks ({taskCount})</h4>
      </div>

      <div className="flex items-center gap-3">
        <DeniedAction denied={!canAddTasks} reason={addTaskDisabledMessage} tooltipAlign="right">
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
              "text-[12px] font-medium transition-colors flex items-center gap-1",
              canAddTasks
                ? "text-[#58AFFF] hover:text-[#58AFFF]/80 cursor-pointer"
                : "text-[#58AFFF]/45 opacity-50 cursor-not-allowed",
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
                ? "bg-white/10 text-[#E8E8E8]"
                : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/5",
            )}
            title="Sort tasks"
          >
            <ArrowUpDown size={16} strokeWidth={2} />
          </button>

          {isSortOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden p-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                Sort by
              </div>
              {TASK_SORT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onSortSelect(option.id);
                    onCloseSort();
                  }}
                  className="w-full px-2 py-1.5 rounded-lg text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3 group"
                >
                  <div
                    className={cn(
                      "w-4 h-4 flex items-center justify-center transition-opacity",
                      sortBy === option.id ? "opacity-100" : "opacity-0",
                    )}
                  >
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M9 1L3.5 6.5L1 4" stroke="#E8E8E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <span
                    className={cn(
                      "transition-colors",
                      sortBy === option.id ? "text-white" : "text-[#E8E8E8]/60 group-hover:text-[#E8E8E8]",
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
