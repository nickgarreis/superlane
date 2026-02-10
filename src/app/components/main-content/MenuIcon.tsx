import React, { useState } from "react";
import { Archive, ArchiveRestore, CheckCircle2, Undo2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import svgPaths from "../../../imports/svg-0erue6fqwq";
import { DeniedAction } from "../permissions/DeniedAction";
import { getProjectLifecycleDeniedReason } from "../../lib/permissionRules";
import type { WorkspaceRole } from "../../types";

export function MenuIcon({
  isArchived,
  isCompleted,
  viewerRole,
  onArchive,
  onUnarchive,
  onDelete,
  onComplete,
  onUncomplete,
}: {
  isArchived?: boolean;
  isCompleted?: boolean;
  viewerRole?: WorkspaceRole | null;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onUncomplete?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const lifecycleDeniedReason = getProjectLifecycleDeniedReason(viewerRole);
  const canManageProjectLifecycle = lifecycleDeniedReason == null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="Toggle menu"
        className="w-9 h-9 rounded-full bg-[#E8E8E8]/[0.06] flex items-center justify-center border border-transparent backdrop-blur-[6px] shrink-0 cursor-pointer hover:bg-[#E8E8E8]/[0.1] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
          <path d={svgPaths.p1100df00} fill="#E8E8E8" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
          <div className="absolute left-full top-0 ml-2 w-[180px] bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden py-1.5 z-30 flex flex-col gap-0.5">
            {!isCompleted && !isArchived && onComplete && (
              <DeniedAction denied={!canManageProjectLifecycle} reason={lifecycleDeniedReason} tooltipAlign="right">
                <button
                  type="button"
                  disabled={!canManageProjectLifecycle}
                  className={cn(
                    "w-[calc(100%-8px)] mx-1 px-2 py-1.5 rounded-lg flex items-center gap-3 transition-colors",
                    canManageProjectLifecycle
                      ? "hover:bg-[#22c55e]/10 cursor-pointer text-[#22c55e] group"
                      : "cursor-not-allowed text-[#22c55e]/45 opacity-60",
                  )}
                  onClick={() => {
                    if (!canManageProjectLifecycle) {
                      return;
                    }
                    onComplete();
                    setIsOpen(false);
                  }}
                >
                  <CheckCircle2
                    className={cn(
                      "w-4 h-4 transition-colors",
                      canManageProjectLifecycle
                        ? "text-[#22c55e]/80 group-hover:text-[#22c55e]"
                        : "text-[#22c55e]/45",
                    )}
                  />
                  <span className="text-[13px] font-medium">Complete</span>
                </button>
              </DeniedAction>
            )}

            {!isArchived && isCompleted && onUncomplete && (
              <DeniedAction denied={!canManageProjectLifecycle} reason={lifecycleDeniedReason} tooltipAlign="right">
                <button
                  type="button"
                  disabled={!canManageProjectLifecycle}
                  className={cn(
                    "w-[calc(100%-8px)] mx-1 px-2 py-1.5 rounded-lg flex items-center gap-3 transition-colors",
                    canManageProjectLifecycle
                      ? "hover:bg-white/5 cursor-pointer text-[#E8E8E8] group"
                      : "cursor-not-allowed text-[#E8E8E8]/35 opacity-60",
                  )}
                  onClick={() => {
                    if (!canManageProjectLifecycle) {
                      return;
                    }
                    onUncomplete();
                    setIsOpen(false);
                  }}
                >
                  <Undo2
                    className={cn(
                      "w-4 h-4 transition-colors",
                      canManageProjectLifecycle
                        ? "text-[#E8E8E8]/60 group-hover:text-white"
                        : "text-[#E8E8E8]/35",
                    )}
                  />
                  <span className="text-[13px] font-medium">Revert to Active</span>
                </button>
              </DeniedAction>
            )}

            {!isCompleted && (
              <DeniedAction denied={!canManageProjectLifecycle} reason={lifecycleDeniedReason} tooltipAlign="right">
                <button
                  type="button"
                  disabled={!canManageProjectLifecycle}
                  className={cn(
                    "w-[calc(100%-8px)] mx-1 px-2 py-1.5 rounded-lg flex items-center gap-3 transition-colors",
                    canManageProjectLifecycle
                      ? "hover:bg-white/5 cursor-pointer text-[#E8E8E8] group"
                      : "cursor-not-allowed text-[#E8E8E8]/35 opacity-60",
                  )}
                  onClick={() => {
                    if (!canManageProjectLifecycle) {
                      return;
                    }
                    if (isArchived) {
                      if (onUnarchive) onUnarchive();
                    } else {
                      if (onArchive) onArchive();
                    }
                    setIsOpen(false);
                  }}
                >
                  {isArchived ? (
                    <ArchiveRestore
                      className={cn(
                        "w-4 h-4 transition-colors",
                        canManageProjectLifecycle
                          ? "text-[#E8E8E8]/60 group-hover:text-white"
                          : "text-[#E8E8E8]/35",
                      )}
                    />
                  ) : (
                    <Archive
                      className={cn(
                        "w-4 h-4 transition-colors",
                        canManageProjectLifecycle
                          ? "text-[#E8E8E8]/60 group-hover:text-white"
                          : "text-[#E8E8E8]/35",
                      )}
                    />
                  )}
                  <span className="text-[13px] font-medium">{isArchived ? "Unarchive" : "Archive"}</span>
                </button>
              </DeniedAction>
            )}
          </div>
        </>
      )}
    </div>
  );
}
