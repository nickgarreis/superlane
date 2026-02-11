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
import type { CollaborationComment } from "../../types";
import { DeniedAction } from "../permissions/DeniedAction";
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
                  : "bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:border-white/10",
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
            className="w-6 h-6 rounded-md bg-white/[0.03] border border-white/[0.05] flex items-center justify-center hover:bg-white/[0.06] hover:border-white/10 transition-all cursor-pointer"
          >
            <SmilePlus className="w-3 h-3 text-white/30" />
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
          className="txt-role-meta text-white/30 hover:text-white/60 flex items-center gap-1 transition-all px-1.5 py-0.5 rounded hover:bg-white/[0.04] cursor-pointer opacity-0 group-hover/comment:opacity-100 duration-150"
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
                    ? "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                    : "text-white/20",
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
              className="text-white/20 hover:text-white/50 p-0.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
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
                className="text-white/15 p-0.5 rounded cursor-not-allowed"
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
                }}
                className="bg-[#1E1F20] border border-white/10 rounded-lg shadow-xl shadow-black/40 overflow-hidden py-1 z-[9999] w-[120px]"
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
                  className="w-full px-3 py-1.5 text-left txt-role-body-sm text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button
                  onClick={() => {
                    onDeleteComment(comment.id);
                    onSetActiveMoreMenu(null);
                  }}
                  className="w-full px-3 py-1.5 text-left txt-role-body-sm text-red-400/70 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
