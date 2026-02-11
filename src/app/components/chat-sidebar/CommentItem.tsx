import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/utils";
import { renderCommentContent } from "../MentionTextarea";
import { getCommentAuthorDeniedReason } from "../../lib/permissionRules";
import type { CommentItemProps } from "./commentItemTypes";
import { CommentActions } from "./CommentActions";
import { CommentThread } from "./CommentThread";
import {
  EditCommentComposer,
  ReplyCommentComposer,
} from "./CommentComposerInline";
const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";
export const CommentItem = React.memo(function CommentItem({
  comment,
  currentUserId,
  currentUserName,
  currentUserAvatar,
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
  const isOwn =
    Boolean(currentUserId) && comment.author.userId === currentUserId;
  const commentAuthorDeniedReason = getCommentAuthorDeniedReason(isOwn);
  const isEditing = editingComment === comment.id;
  const isCollapsed = collapsedThreads.has(comment.id);
  const replyCount = comment.replies.length;
  const hasReplies = replyCount > 0;
  return (
    <div
      className={cn("chat-comment-row group/comment relative")}
      style={performanceStyle}
    >
      <div
        className={cn(
          "relative flex items-start gap-2.5 py-2.5 px-3 rounded-xl transition-colors duration-150",
          "hover:bg-white/[0.02]",
        )}
      >
        <div className="shrink-0 pt-0.5">
          <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/10 flex items-center justify-center txt-role-kbd font-medium text-white/80">
                {getInitials(comment.author.name)}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="txt-role-body-md txt-tone-primary">
              {comment.author.name}
            </span>
            <span className="txt-role-meta text-white/25 select-none">
              {comment.timestamp}
            </span>
            {comment.edited && (
              <span className="txt-role-kbd text-white/20 select-none italic">
                edited
              </span>
            )}
          </div>
          {isEditing ? (
            <EditCommentComposer
              commentId={comment.id}
              editValue={editValue}
              mentionItems={mentionItems}
              onMentionClick={onMentionClick}
              onSetEditValue={onSetEditValue}
              onSetEditingComment={onSetEditingComment}
              onEditComment={onEditComment}
            />
          ) : (
            <div className="txt-role-body-md txt-tone-muted txt-leading-reading whitespace-pre-wrap break-words">
              {renderCommentContent(comment.content, onMentionClick)}
            </div>
          )}
          {!isEditing && (
            <CommentActions
              comment={comment}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              isOwn={isOwn}
              isTopLevel={isTopLevel}
              commentAuthorDeniedReason={commentAuthorDeniedReason}
              replyingTo={replyingTo}
              activeReactionPicker={activeReactionPicker}
              activeMoreMenu={activeMoreMenu}
              onSetReplyingTo={onSetReplyingTo}
              onSetActiveReactionPicker={onSetActiveReactionPicker}
              onSetActiveMoreMenu={onSetActiveMoreMenu}
              onSetEditingComment={onSetEditingComment}
              onSetEditValue={onSetEditValue}
              onDeleteComment={onDeleteComment}
              onResolve={onResolve}
              onToggleReaction={onToggleReaction}
            />
          )}
          <AnimatePresence>
            {replyingTo === comment.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className="overflow-hidden"
              >
                <ReplyCommentComposer
                  commentId={comment.id}
                  currentUserName={currentUserName}
                  currentUserAvatar={currentUserAvatar}
                  mentionItems={mentionItems}
                  onMentionClick={onMentionClick}
                  replyValue={replyValue}
                  onSetReplyingTo={onSetReplyingTo}
                  onSetReplyValue={onSetReplyValue}
                  onReply={onReply}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <CommentThread
        commentId={comment.id}
        isTopLevel={isTopLevel}
        hasReplies={hasReplies}
        replyCount={replyCount}
        isCollapsed={isCollapsed}
        onToggleThread={onToggleThread}
      >
        {comment.replies.map((reply) => (
          <CommentItem
            key={reply.id}
            comment={reply}
            isTopLevel={false}
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
      </CommentThread>
    </div>
  );
});
