import React, { useRef } from "react";
import { Archive, ArchiveRestore, Undo2 } from "lucide-react";
import { useDrag } from "react-dnd";
import { cn } from "../../../lib/utils";
import {
  SIDEBAR_BADGE_CLASS,
  SIDEBAR_ITEM_ACTIVE_CLASS,
  SIDEBAR_ITEM_BASE_CLASS,
  SIDEBAR_ITEM_IDLE_CLASS,
} from "./sidebarChrome";
export type SidebarItemProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  onIntent?: () => void;
  isActive?: boolean;
  onUnarchive?: () => void;
  onArchive?: () => void;
  onUncomplete?: () => void;
  className?: string;
  shortcut?: string;
  badge?: number | string;
  projectId?: string;
  projectStatus?: string;
  isDraft?: boolean;
  isReview?: boolean;
  completionDate?: string;
};
export const SidebarItem = React.memo(function SidebarItem({
  icon,
  label,
  onClick,
  onIntent,
  isActive,
  onUnarchive,
  onArchive,
  onUncomplete,
  className,
  shortcut,
  badge,
  projectId,
  projectStatus,
  isDraft,
  isReview,
  completionDate,
}: SidebarItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag<
    { id?: string; status?: string },
    void,
    { isDragging: boolean }
  >(
    () => ({
      type: "PROJECT",
      item: { id: projectId, status: projectStatus },
      canDrag: Boolean(projectId),
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    }),
    [projectId, projectStatus],
  );
  if (projectId) {
    drag(ref);
  }
  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={cn(
        SIDEBAR_ITEM_BASE_CLASS,
        className,
        isActive ? SIDEBAR_ITEM_ACTIVE_CLASS : SIDEBAR_ITEM_IDLE_CLASS,
      )}
      onClick={onClick}
      onMouseEnter={onIntent}
      onFocus={onIntent}
      tabIndex={onIntent ? 0 : undefined}
      title={label}
    >
      <div
        className={cn(
          "shrink-0 mr-2.5 text-current transition-opacity [&_svg]:size-4",
          isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100",
        )}
      >
        {icon}
      </div>
      <span className="txt-role-body-md font-medium truncate flex-1 leading-none pt-0.5">
        {label}
      </span>
      {shortcut && (
        <span className="hidden group-hover:flex items-center txt-role-kbd font-medium text-white/30 border border-white/10 px-1.5 py-0.5 rounded ml-2 transition-colors">
          {shortcut}
        </span>
      )}
      {badge != null && (
        <span className={SIDEBAR_BADGE_CLASS}>
          {badge}
        </span>
      )}
      {isDraft && (
        <span className="inline-flex h-[19px] items-center py-[2px] txt-role-kbd font-medium txt-tone-accent ml-2 shrink-0 whitespace-nowrap">
          Draft
        </span>
      )}
      {isReview && (
        <span className="inline-flex h-[19px] items-center py-[2px] txt-role-kbd font-medium txt-tone-muted ml-2 shrink-0 whitespace-nowrap">
          In Review
        </span>
      )}
      {completionDate && (
        <span className="txt-role-kbd text-white/30 ml-2 shrink-0 whitespace-nowrap">
          {completionDate}
        </span>
      )}
      {onUncomplete && (
        <button
          type="button"
          className={cn(
            "transition-opacity p-1 hover:bg-white/10 rounded ml-1 cursor-pointer bg-transparent border-0",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onUncomplete();
          }}
          title="Revert to Active"
        >
          <Undo2 size={14} className="txt-tone-subtle" />
        </button>
      )}
      {onUnarchive && (
        <button
          type="button"
          className={cn(
            "transition-opacity p-1 hover:bg-white/10 rounded ml-2 cursor-pointer bg-transparent border-0",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onUnarchive();
          }}
          title="Unarchive project"
        >
          <ArchiveRestore size={14} className="txt-tone-subtle" />
        </button>
      )}
      {onArchive && (
        <button
          type="button"
          className={cn(
            "transition-opacity p-1 hover:bg-white/10 rounded ml-2 cursor-pointer bg-transparent border-0",
            isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100",
          )}
          onClick={(event) => {
            event.stopPropagation();
            onArchive();
          }}
          title="Archive project"
        >
          <Archive size={14} className="txt-tone-subtle" />
        </button>
      )}
    </div>
  );
});
