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
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-full top-0 ml-2 w-[190px] bg-[#1E1F20] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-30">
            <div className="py-1">
            {!isCompleted && !isArchived && onComplete && (
              <DeniedAction
                denied={!canManageProjectLifecycle}
                reason={lifecycleDeniedReason}
                tooltipAlign="right"
              >
                <button
                  type="button"
                  disabled={!canManageProjectLifecycle}
                  className={cn(
                    "w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 transition-colors group relative",
                    canManageProjectLifecycle
                      ? "cursor-pointer hover:bg-white/5"
                      : "cursor-not-allowed opacity-60",
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
                      "w-4 h-4 transition-colors shrink-0",
                      canManageProjectLifecycle
                        ? "txt-tone-success"
                        : "text-white/25",
                    )}
                  />
                  <span
                    className={cn(
                      canManageProjectLifecycle
                        ? "txt-tone-muted group-hover:text-white"
                        : "text-white/25",
                    )}
                  >
                    Complete
                  </span>
                </button>
              </DeniedAction>
            )}
            {!isArchived && isCompleted && onUncomplete && (
              <DeniedAction
                denied={!canManageProjectLifecycle}
                reason={lifecycleDeniedReason}
                tooltipAlign="right"
              >
                <button
                  type="button"
                  disabled={!canManageProjectLifecycle}
                  className={cn(
                    "w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 transition-colors group relative",
                    canManageProjectLifecycle
                      ? "cursor-pointer hover:bg-white/5"
                      : "cursor-not-allowed opacity-60",
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
                      "w-4 h-4 transition-colors shrink-0",
                      canManageProjectLifecycle
                        ? "text-white/60"
                        : "text-white/25",
                    )}
                  />
                  <span
                    className={cn(
                      canManageProjectLifecycle
                        ? "txt-tone-muted group-hover:text-white"
                        : "text-white/25",
                    )}
                  >
                    Revert to Active
                  </span>
                </button>
              </DeniedAction>
            )}
            {!isCompleted && (
              <DeniedAction
                denied={!canManageProjectLifecycle}
                reason={lifecycleDeniedReason}
                tooltipAlign="right"
              >
                <button
                  type="button"
                  disabled={!canManageProjectLifecycle}
                  className={cn(
                    "w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 transition-colors group relative",
                    canManageProjectLifecycle
                      ? "cursor-pointer hover:bg-white/5"
                      : "cursor-not-allowed opacity-60",
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
                        "w-4 h-4 transition-colors shrink-0",
                        canManageProjectLifecycle
                          ? "text-white/60"
                          : "text-white/25",
                      )}
                    />
                  ) : (
                    <Archive
                      className={cn(
                        "w-4 h-4 transition-colors shrink-0",
                        canManageProjectLifecycle
                          ? "text-white/60"
                          : "text-white/25",
                      )}
                    />
                  )}
                  <span
                    className={cn(
                      canManageProjectLifecycle
                        ? "txt-tone-muted group-hover:text-white"
                        : "text-white/25",
                    )}
                  >
                    {isArchived ? "Unarchive" : "Archive"}
                  </span>
                </button>
              </DeniedAction>
            )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
