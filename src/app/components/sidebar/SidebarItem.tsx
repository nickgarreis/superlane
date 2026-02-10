import React, { useRef } from "react";
import { Archive, ArchiveRestore, Undo2 } from "lucide-react";
import { useDrag } from "react-dnd";
import { cn } from "../../../lib/utils";

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

  const [{ isDragging }, drag] = useDrag<{ id?: string; status?: string }, void, { isDragging: boolean }>(() => ({
    type: "PROJECT",
    item: { id: projectId, status: projectStatus },
    canDrag: Boolean(projectId),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [projectId, projectStatus]);

  if (projectId) {
    drag(ref);
  }

  return (
    <div
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={cn(
        "h-[34px] flex items-center px-3 rounded-lg cursor-pointer transition-all duration-150 group select-none relative shrink-0",
        className,
        isActive
          ? "bg-white/[0.08] text-[#E8E8E8] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]"
          : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/[0.04]",
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
      <span className="text-[13px] font-medium truncate flex-1 leading-none pt-0.5">{label}</span>

      {shortcut && (
        <span className="hidden group-hover:flex items-center text-[10px] font-medium text-white/30 border border-white/10 px-1.5 py-0.5 rounded ml-2 transition-colors">
          {shortcut}
        </span>
      )}

      {badge != null && (
        <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#58AFFF]/10 text-[#58AFFF] text-[11px] font-medium ml-2">
          {badge}
        </span>
      )}

      {isDraft && (
        <span className="flex items-center text-[10px] font-medium text-[#58AFFF] bg-[#58AFFF]/10 px-2 py-0.5 rounded-full ml-2 shrink-0 whitespace-nowrap">
          Continue
        </span>
      )}

      {isReview && (
        <span className="flex items-center text-[10px] font-medium text-[#f97316] bg-[#f97316]/10 px-2 py-0.5 rounded-full ml-2 shrink-0 whitespace-nowrap">
          In Review
        </span>
      )}

      {completionDate && (
        <span className="text-[10px] text-white/30 ml-2 shrink-0 whitespace-nowrap">
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
          <Undo2 size={14} className="text-[#E8E8E8]/60" />
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
          <ArchiveRestore size={14} className="text-[#E8E8E8]/60" />
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
          <Archive size={14} className="text-[#E8E8E8]/60" />
        </button>
      )}
    </div>
  );
});
