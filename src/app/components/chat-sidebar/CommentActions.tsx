import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  CheckCheck,
  CornerDownRight,
  MoreHorizontal,
  Pencil,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { Z_LAYERS } from "../../lib/zLayers";
import type { CollaborationComment } from "../../types";
import { DeniedAction } from "../permissions/DeniedAction";
import {
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "../ui/menuChrome";
import { GHOST_ICON_BUTTON_CLASS } from "../ui/controlChrome";
import { ReactionPicker } from "./ReactionPicker";
type CommentActionsProps = {
  comment: CollaborationComment;
  currentUserId: string | null;
  currentUserName: string;
  isOwn: boolean;
  isTopLevel: boolean;
  commentAuthorDeniedReason: string | null;
  replyingTo: string | null;
  activeReactionPicker: string | null;
  activeMoreMenu: string | null;
  onSetReplyingTo: (id: string | null) => void;
  onSetActiveReactionPicker: (id: string | null) => void;
  onSetActiveMoreMenu: (id: string | null) => void;
  onSetEditingComment: (id: string | null) => void;
  onSetEditValue: (value: string) => void;
  onDeleteComment: (id: string) => void;
  onResolve: (id: string) => void;
  onToggleReaction: (id: string, emoji: string) => void;
};
export function CommentActions({
  comment,
  currentUserId,
  currentUserName,
  isOwn,
  isTopLevel,
  commentAuthorDeniedReason,
  replyingTo,
  activeReactionPicker,
  activeMoreMenu,
  onSetReplyingTo,
  onSetActiveReactionPicker,
  onSetActiveMoreMenu,
  onSetEditingComment,
  onSetEditValue,
  onDeleteComment,
  onResolve,
  onToggleReaction,
}: CommentActionsProps) {
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null,
  );
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeMoreMenu !== comment.id || !menuPos) {
      return;
    }
    const handleScroll = () => {
      onSetActiveMoreMenu(null);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("scroll", handleScroll, {
      capture: true,
      passive: true,
    });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, [activeMoreMenu, comment.id, menuPos, onSetActiveMoreMenu]);
  useEffect(() => {
    if (activeMoreMenu !== comment.id) {
      return;
    }
    let cleanupClickListener: (() => void) | null = null;
    const timeoutId = window.setTimeout(() => {
      const handleDocumentClick = (event: MouseEvent) => {
        const target = event.target;
        if (!(target instanceof Node)) {
          return;
        }
        if (menuRef.current?.contains(target)) {
          return;
        }
        onSetActiveMoreMenu(null);
      };
      document.addEventListener("click", handleDocumentClick);
      cleanupClickListener = () => {
        document.removeEventListener("click", handleDocumentClick);
      };
    }, 0);
    return () => {
      window.clearTimeout(timeoutId);
      cleanupClickListener?.();
    };
  }, [activeMoreMenu, comment.id, onSetActiveMoreMenu]);
  return (
    <>
      <div className="flex items-center gap-1 mt-2 flex-wrap">
        {comment.reactions?.map((reaction) => {
          const isActive = currentUserId
            ? (reaction.userIds ?? []).includes(currentUserId)
            : reaction.users.includes(currentUserName);
          return (
            <button
              key={reaction.emoji}
              onClick={() => onToggleReaction(comment.id, reaction.emoji)}
              className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md txt-role-body-sm transition-all cursor-pointer select-none",
                isActive
                  ? "bg-blue-500/15 border border-blue-500/20 text-blue-300"
                  : "bg-surface-muted-soft border border-border-soft text-text-muted-medium hover:bg-surface-hover-soft",
              )}
            >
              <span>{reaction.emoji}</span>
              <span className="txt-role-kbd">{reaction.users.length}</span>
            </button>
          );
        })}
        <div className="relative opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150">
          <button
            onClick={(event) => {
              event.stopPropagation();
              onSetActiveReactionPicker(
                activeReactionPicker === comment.id ? null : comment.id,
              );
            }}
            className="w-6 h-6 rounded-md bg-surface-muted-soft border border-border-soft flex items-center justify-center hover:bg-surface-hover-soft transition-all cursor-pointer"
          >
            <SmilePlus className="w-3 h-3 text-text-muted-medium" />
          </button>
          <ReactionPicker
            commentId={comment.id}
            isOpen={activeReactionPicker === comment.id}
            onToggleReaction={onToggleReaction}
          />
        </div>
        <button
          onClick={() =>
            onSetReplyingTo(replyingTo === comment.id ? null : comment.id)
          }
          className="txt-role-meta text-text-muted-medium hover:txt-tone-primary flex items-center gap-1 transition-all px-1.5 py-0.5 rounded hover:bg-surface-hover-soft cursor-pointer opacity-0 group-hover/comment:opacity-100 duration-150"
        >
          <CornerDownRight className="w-3 h-3" /> Reply
        </button>
        {isTopLevel && (
          <DeniedAction
            denied={!isOwn}
            reason={commentAuthorDeniedReason}
            tooltipAlign="right"
          >
            <button
              onClick={() => {
                if (!isOwn) {
                  return;
                }
                onResolve(comment.id);
              }}
              className={cn(
                "txt-role-meta flex items-center gap-1 transition px-1.5 py-0.5 rounded opacity-0 group-hover/comment:opacity-100 duration-150",
                isOwn ? "cursor-pointer" : "cursor-not-allowed",
                comment.resolved
                  ? isOwn
                    ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/[0.06]"
                    : "text-emerald-400/35"
                  : isOwn
                    ? "text-text-muted-medium hover:txt-tone-primary hover:bg-surface-hover-soft"
                    : "text-text-muted-weak",
              )}
            >
              {comment.resolved ? (
                <CheckCheck className="w-3 h-3" />
              ) : (
                <Check className="w-3 h-3" />
              )}
              {comment.resolved ? "Resolved" : "Resolve"}
            </button>
          </DeniedAction>
        )}
        {isOwn ? (
          <div className="relative ml-auto opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150">
            <button
              onClick={(event) => {
                event.stopPropagation();
                if (activeMoreMenu === comment.id) {
                  onSetActiveMoreMenu(null);
                  return;
                }
                const rect = event.currentTarget.getBoundingClientRect();
                setMenuPos({ top: rect.bottom + 4, left: rect.right - 120 });
                onSetActiveMoreMenu(comment.id);
              }}
              className={cn(
                "p-0.5 text-text-muted-weak hover:text-text-muted-medium cursor-pointer",
                GHOST_ICON_BUTTON_CLASS,
              )}
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <DeniedAction
            denied
            reason={commentAuthorDeniedReason}
            tooltipAlign="right"
          >
            <div className="relative ml-auto opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150">
              <button
                type="button"
                className="text-text-muted-weak p-0.5 rounded cursor-not-allowed"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </div>
          </DeniedAction>
        )}
      </div>
      {isOwn &&
        createPortal(
          <AnimatePresence>
            {activeMoreMenu === comment.id && menuPos && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.1 }}
                style={{
                  position: "fixed",
                  top: menuPos.top,
                  left: menuPos.left,
                  zIndex: Z_LAYERS.popover,
                }}
                className={cn("w-[140px]", MENU_SURFACE_CLASS)}
                onClick={(event: React.MouseEvent<HTMLDivElement>) =>
                  event.stopPropagation()
                }
              >
                <button
                  onClick={() => {
                    onSetEditingComment(comment.id);
                    onSetEditValue(comment.content);
                    onSetActiveMoreMenu(null);
                  }}
                  className={cn(MENU_ITEM_CLASS, "txt-tone-muted")}
                >
                  <Pencil className="w-3.5 h-3.5 shrink-0 text-text-muted-medium" />
                  <span className="group-hover:text-white transition-colors">
                    Edit
                  </span>
                </button>
                <button
                  onClick={() => {
                    onDeleteComment(comment.id);
                    onSetActiveMoreMenu(null);
                  }}
                  className={cn(MENU_ITEM_CLASS, "text-red-400/75")}
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span className="group-hover:text-red-300 transition-colors">
                    Delete
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
