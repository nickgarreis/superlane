import type React from "react";
import { motion } from "motion/react";
import { CornerDownLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
type AddTaskRowProps = {
  addTaskRowRef: React.Ref<HTMLDivElement>;
  newTaskTitle: string;
  onTitleChange: (value: string) => void;
  canCreateTask: boolean;
  onAddTask: () => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
};
export function AddTaskRow({
  addTaskRowRef,
  newTaskTitle,
  onTitleChange,
  canCreateTask,
  onAddTask,
  onKeyDown,
}: AddTaskRowProps) {
  return (
    <motion.div
      ref={addTaskRowRef}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      className="overflow-hidden"
    >
      <div className="py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-5 h-5 rounded-full border border-white/20 shrink-0 opacity-50" />
          <input
            autoFocus
            type="text"
            aria-label="New task title"
            value={newTaskTitle}
            onChange={(event) => onTitleChange(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="What needs to be done?"
            className="flex-1 bg-transparent border-none outline-none txt-role-body-lg txt-tone-primary placeholder:text-white/20"
          />
        </div>
        <div className="shrink-0 pl-4">
          <button
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={onAddTask}
            disabled={!canCreateTask}
            className={cn(
              "inline-flex items-center gap-2 h-8 px-2.5 rounded-full border transition-colors",
              canCreateTask
                ? "border-[#58AFFF]/30 bg-[#58AFFF]/10 txt-tone-accent hover:bg-[#58AFFF]/15 cursor-pointer"
                : "border-white/10 bg-white/5 text-white/30 cursor-not-allowed",
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center w-6 h-5 rounded-md border",
                canCreateTask
                  ? "border-[#58AFFF]/35 bg-[#58AFFF]/15 txt-tone-accent"
                  : "border-white/10 bg-white/5 text-white/30",
              )}
            >
              <CornerDownLeft size={11} strokeWidth={2.3} aria-hidden="true" />
            </span>
            <span className="txt-role-body-sm font-medium">Create</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
