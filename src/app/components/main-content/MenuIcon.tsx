import React, { useState } from "react";
import { Archive, ArchiveRestore, CheckCircle2, Undo2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import svgPaths from "../../../imports/svg-0erue6fqwq";
import { DeniedAction } from "../permissions/DeniedAction";
import { getProjectLifecycleDeniedReason } from "../../lib/permissionRules";
import type { WorkspaceRole } from "../../types";
import { MENU_ITEM_CLASS, MENU_SURFACE_CLASS } from "../ui/menuChrome";
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
        className="w-9 h-9 rounded-full bg-popup-control flex items-center justify-center border border-transparent backdrop-blur-[6px] shrink-0 cursor-pointer hover:bg-popup-control-hover transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg className="w-4 h-4 txt-tone-primary" viewBox="0 0 16 16" fill="none">
          <path d={svgPaths.p1100df00} fill="currentColor" />
        </svg>
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={cn(
              "absolute left-full top-0 ml-2 w-[190px] z-30",
              MENU_SURFACE_CLASS,
            )}
          >
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
                    MENU_ITEM_CLASS,
                    canManageProjectLifecycle
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-60 hover:bg-transparent",
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
                    MENU_ITEM_CLASS,
                    canManageProjectLifecycle
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-60 hover:bg-transparent",
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
                    MENU_ITEM_CLASS,
                    canManageProjectLifecycle
                      ? "cursor-pointer"
                      : "cursor-not-allowed opacity-60 hover:bg-transparent",
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
