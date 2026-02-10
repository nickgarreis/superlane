import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  CornerDownRight,
  MoreHorizontal,
  Pencil,
  SmilePlus,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/utils";
import type { CollaborationComment } from "../../types";
import {
  MentionTextarea,
  MentionItem as MentionItemType,
  renderCommentContent,
} from "../MentionTextarea";
import { ReactionPicker } from "./ReactionPicker";
import { DeniedAction } from "../permissions/DeniedAction";
import { getCommentAuthorDeniedReason } from "../../lib/permissionRules";

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

// ── Comment Item (stable top-level component) ─────────────────────
interface CommentItemViewProps {
  comment: CollaborationComment;
  currentUserId: string | null;
  currentUserName: string;
  currentUserAvatar?: string;
  isReply?: boolean;
  isTopLevel?: boolean;
  mentionItems: MentionItemType[];
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  performanceStyle?: React.CSSProperties;
}

interface CommentItemInteractionStateProps {
  replyingTo: string | null;
  editingComment: string | null;
  editValue: string;
  activeReactionPicker: string | null;
  activeMoreMenu: string | null;
  collapsedThreads: Set<string>;
  replyValue: string;
}

interface CommentItemInteractionHandlerProps {
  onSetReplyingTo: (id: string | null) => void;
  onSetReplyValue: (val: string) => void;
  onSetEditingComment: (id: string | null) => void;
  onSetEditValue: (val: string) => void;
  onSetActiveReactionPicker: (id: string | null) => void;
  onSetActiveMoreMenu: (id: string | null) => void;
  onReply: (parentId: string, e?: React.FormEvent) => void;
  onEditComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
  onResolve: (commentId: string) => void;
  onToggleReaction: (commentId: string, emoji: string) => void;
  onToggleThread: (id: string) => void;
}

type CommentItemProps = CommentItemViewProps & CommentItemInteractionStateProps & CommentItemInteractionHandlerProps;

export const CommentItem = React.memo(function CommentItem({
  comment,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  isReply = false,
  isTopLevel = false,
  mentionItems,
  onMentionClick,
  performanceStyle,
  replyingTo,
  editingComment,
  editValue,
  activeReactionPicker,
  activeMoreMenu,
  collapsedThreads,
  onSetReplyingTo,
  onSetReplyValue,
  replyValue,
  onSetEditingComment,
  onSetEditValue,
  onSetActiveReactionPicker,
  onSetActiveMoreMenu,
  onReply,
  onEditComment,
  onDeleteComment,
  onResolve,
  onToggleReaction,
  onToggleThread,
}: CommentItemProps) {
  const isOwn = Boolean(currentUserId) && comment.author.userId === currentUserId;
  const commentAuthorDeniedReason = getCommentAuthorDeniedReason(isOwn);
  const isEditing = editingComment === comment.id;
  const isCollapsed = collapsedThreads.has(comment.id);
  const replyCount = comment.replies.length;
  const hasReplies = replyCount > 0;

  // Position state for the portaled more-menu
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );

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

  return (
    <div className={cn("chat-comment-row group/comment relative")} style={performanceStyle}>
      <div
        className={cn(
          "relative flex items-start gap-2.5 py-2.5 px-3 rounded-xl transition-colors duration-150",
          "hover:bg-white/[0.02]"
        )}
      >
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/80">
                {getInitials(comment.author.name)}
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] text-[#E8E8E8]">
              {comment.author.name}
            </span>
            <span className="text-[11px] text-white/25 select-none">
              {comment.timestamp}
            </span>
            {comment.edited && (
              <span className="text-[10px] text-white/20 select-none italic">
                edited
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-1">
              <MentionTextarea
                autoFocus
                value={editValue}
                onChange={onSetEditValue}
                items={mentionItems}
                onMentionClick={onMentionClick}
                className="w-full bg-white/[0.04] border border-white/10 rounded-lg p-2.5 text-[13.5px] text-[#E8E8E8] focus:outline-none focus:border-white/20 leading-relaxed transition-colors"
                style={{ minHeight: 36, maxHeight: 160 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    onEditComment(comment.id);
                  }
                  if (e.key === "Escape") {
                    onSetEditingComment(null);
                    onSetEditValue("");
                  }
                }}
              />
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={() => onEditComment(comment.id)}
                  disabled={!editValue.trim()}
                  className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/15 text-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    onSetEditingComment(null);
                    onSetEditValue("");
                  }}
                  className="px-2.5 py-1 text-[11px] text-white/40 hover:text-white/60 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <span className="text-[10px] text-white/15 ml-auto">
                  ⌘Enter to save · @ to mention
                </span>
              </div>
            </div>
          ) : (
            <div className="text-[13.5px] text-[#E8E8E8]/75 leading-[1.55] whitespace-pre-wrap break-words">
              {renderCommentContent(comment.content, onMentionClick)}
            </div>
          )}

          {/* Reactions + Actions (single row) */}
          {!isEditing && (
            <div className="flex items-center gap-1 mt-2 flex-wrap">
              {/* Existing reaction badges (always visible) */}
              {comment.reactions &&
                comment.reactions.length > 0 &&
                comment.reactions.map((reaction) => {
                  const isActive = currentUserId
                    ? (reaction.userIds ?? []).includes(currentUserId)
                    : reaction.users.includes(currentUserName);
                  return (
                    <button
                      key={reaction.emoji}
                      onClick={() =>
                        onToggleReaction(comment.id, reaction.emoji)
                      }
                      className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[12px] transition-all cursor-pointer select-none",
                        isActive
                          ? "bg-blue-500/15 border border-blue-500/20 text-blue-300"
                          : "bg-white/[0.04] border border-white/[0.06] text-white/50 hover:bg-white/[0.06] hover:border-white/10"
                      )}
                    >
                      <span>{reaction.emoji}</span>
                      <span className="text-[10px]">
                        {reaction.users.length}
                      </span>
                    </button>
                  );
                })}

              {/* Add reaction button */}
              <div className="relative opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetActiveReactionPicker(
                      activeReactionPicker === comment.id
                        ? null
                        : comment.id
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

              {/* Reply */}
              <button
                onClick={() =>
                  onSetReplyingTo(
                    replyingTo === comment.id ? null : comment.id
                  )
                }
                className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-all px-1.5 py-0.5 rounded hover:bg-white/[0.04] cursor-pointer opacity-0 group-hover/comment:opacity-100 duration-150"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>

              {/* Resolve (top-level only, author-restricted) */}
              {isTopLevel && (
                <DeniedAction denied={!isOwn} reason={commentAuthorDeniedReason} tooltipAlign="right">
                  <button
                    onClick={() => {
                      if (!isOwn) {
                        return;
                      }
                      onResolve(comment.id);
                    }}
                    className={cn(
                      "text-[11px] flex items-center gap-1 transition px-1.5 py-0.5 rounded opacity-0 group-hover/comment:opacity-100 duration-150",
                      isOwn
                        ? "cursor-pointer"
                        : "cursor-not-allowed",
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

              {/* More menu for own comments */}
              {isOwn ? (
                <div className="relative ml-auto opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (activeMoreMenu === comment.id) {
                        onSetActiveMoreMenu(null);
                      } else {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setMenuPos({
                          top: rect.bottom + 4,
                          left: rect.right - 120,
                        });
                        onSetActiveMoreMenu(comment.id);
                      }
                    }}
                    className="text-white/20 hover:text-white/50 p-0.5 rounded hover:bg-white/[0.04] transition-colors cursor-pointer"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <DeniedAction denied reason={commentAuthorDeniedReason} tooltipAlign="right">
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
          )}

          {/* Portaled more-menu (escapes overflow-hidden ancestors) */}
          {isOwn &&
            createPortal(
              <AnimatePresence>
                {activeMoreMenu === comment.id && menuPos && (
                  <motion.div
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
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => {
                        onSetEditingComment(comment.id);
                        onSetEditValue(comment.content);
                        onSetActiveMoreMenu(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[12px] text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDeleteComment(comment.id);
                        onSetActiveMoreMenu(null);
                      }}
                      className="w-full px-3 py-1.5 text-left text-[12px] text-red-400/70 hover:bg-red-500/10 hover:text-red-400 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>,
              document.body
            )}

          {/* Reply Form */}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <form
                  onSubmit={(e) => onReply(comment.id, e)}
                  className="mt-3 flex items-start gap-2"
                >
                  <div className="shrink-0 pt-0.5">
                    <div className="w-5 h-5 rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
                      {currentUserAvatar ? (
                        <img
                          src={currentUserAvatar}
                          alt={currentUserName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-[8px] font-medium text-white/80">
                          {getInitials(currentUserName)}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <MentionTextarea
                      autoFocus
                      value={replyValue}
                      onChange={onSetReplyValue}
                      items={mentionItems}
                      placeholder=""
                      className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-[#E8E8E8] placeholder:text-white/20 focus:outline-none focus:border-white/15 leading-relaxed transition-colors"
                      style={{ minHeight: 32, maxHeight: 140 }}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          (e.metaKey || e.ctrlKey)
                        ) {
                          e.preventDefault();
                          onReply(comment.id);
                        }
                        if (e.key === "Escape") {
                          onSetReplyingTo(null);
                          onSetReplyValue("");
                        }
                      }}
                      onMentionClick={onMentionClick}
                    />
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="submit"
                        disabled={!replyValue.trim()}
                        className="px-2.5 py-1 text-[11px] bg-white/10 hover:bg-white/15 text-white rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Reply
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onSetReplyingTo(null);
                          onSetReplyValue("");
                        }}
                        className="text-[11px] text-white/30 hover:text-white/50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <span className="text-[10px] text-white/15 ml-auto">
                        ⌘Enter
                      </span>
                    </div>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Replies (top-level: collapsible) */}
      {hasReplies && isTopLevel && (
        <div className="ml-[38px]">
          <button
            onClick={() => onToggleThread(comment.id)}
            className="flex items-center gap-1.5 text-[11px] text-white/25 hover:text-white/50 transition-colors py-1 px-1.5 rounded cursor-pointer select-none"
          >
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
            <span>
              {replyCount} {replyCount === 1 ? "reply" : "replies"}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="border-l border-white/[0.06] ml-1.5">
                  {comment.replies.map((reply) => (
                    <CommentItem
                      key={reply.id}
                      comment={reply}
                      isReply
                      currentUserId={currentUserId}
                      currentUserName={currentUserName}
                      currentUserAvatar={currentUserAvatar}
                      mentionItems={mentionItems}
                      onMentionClick={onMentionClick}
                      replyingTo={replyingTo}
                      editingComment={editingComment}
                      editValue={editValue}
                      activeReactionPicker={activeReactionPicker}
                      activeMoreMenu={activeMoreMenu}
                      collapsedThreads={collapsedThreads}
                      onSetReplyingTo={onSetReplyingTo}
                      onSetReplyValue={onSetReplyValue}
                      replyValue={replyValue}
                      onSetEditingComment={onSetEditingComment}
                      onSetEditValue={onSetEditValue}
                      onSetActiveReactionPicker={onSetActiveReactionPicker}
                      onSetActiveMoreMenu={onSetActiveMoreMenu}
                      onReply={onReply}
                      onEditComment={onEditComment}
                      onDeleteComment={onDeleteComment}
                      onResolve={onResolve}
                      onToggleReaction={onToggleReaction}
                      onToggleThread={onToggleThread}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Replies for non-top-level (nested, shown directly) */}
      {hasReplies && !isTopLevel && (
        <div className="ml-[38px] border-l border-white/[0.06]">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              isReply
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              currentUserAvatar={currentUserAvatar}
              mentionItems={mentionItems}
              onMentionClick={onMentionClick}
              replyingTo={replyingTo}
              editingComment={editingComment}
              editValue={editValue}
              activeReactionPicker={activeReactionPicker}
              activeMoreMenu={activeMoreMenu}
              collapsedThreads={collapsedThreads}
              onSetReplyingTo={onSetReplyingTo}
              onSetReplyValue={onSetReplyValue}
              replyValue={replyValue}
              onSetEditingComment={onSetEditingComment}
              onSetEditValue={onSetEditValue}
              onSetActiveReactionPicker={onSetActiveReactionPicker}
              onSetActiveMoreMenu={onSetActiveMoreMenu}
              onReply={onReply}
              onEditComment={onEditComment}
              onDeleteComment={onDeleteComment}
              onResolve={onResolve}
              onToggleReaction={onToggleReaction}
              onToggleThread={onToggleThread}
            />
          ))}
        </div>
      )}
    </div>
  );
});
