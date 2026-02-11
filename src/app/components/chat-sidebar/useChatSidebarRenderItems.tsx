import { useCallback, useMemo } from "react";
import type { Virtualizer } from "@tanstack/react-virtual";
import type { CollaborationComment } from "../../types";
import type { MentionItem as MentionItemType } from "../mentions/types";
import { CommentItem } from "./CommentItem";

type UseChatSidebarRenderItemsArgs = {
  unresolvedComments: CollaborationComment[];
  resolvedComments: CollaborationComment[];
  shouldVirtualizeUnresolvedComments: boolean;
  unresolvedCommentVirtualizer: Virtualizer<HTMLDivElement, Element>;
  currentUserId: string | null;
  currentUserName: string;
  currentUserAvatar: string;
  mentionItems: MentionItemType[];
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  commentRowStyle:
    | { contentVisibility: "auto"; containIntrinsicSize: string }
    | undefined;
  replyingTo: string | null;
  setReplyingTo: (value: string | null) => void;
  replyValue: string;
  setReplyValue: (value: string) => void;
  editingComment: string | null;
  setEditingComment: (value: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  activeReactionPicker: string | null;
  setActiveReactionPicker: (value: string | null) => void;
  activeMoreMenu: string | null;
  setActiveMoreMenu: (value: string | null) => void;
  collapsedThreads: Set<string>;
  handleReply: (parentId: string, event?: React.FormEvent) => void;
  handleEditComment: (commentId: string) => void;
  handleDeleteComment: (commentId: string) => void;
  handleResolve: (commentId: string) => void;
  handleToggleReaction: (commentId: string, emoji: string) => void;
  toggleThread: (id: string) => void;
};

type UseChatSidebarRenderItemsResult = {
  unresolvedCommentItems: React.ReactNode;
  resolvedCommentItems: React.ReactNode;
};

export const useChatSidebarRenderItems = ({
  unresolvedComments,
  resolvedComments,
  shouldVirtualizeUnresolvedComments,
  unresolvedCommentVirtualizer,
  currentUserId,
  currentUserName,
  currentUserAvatar,
  mentionItems,
  onMentionClick,
  commentRowStyle,
  replyingTo,
  setReplyingTo,
  replyValue,
  setReplyValue,
  editingComment,
  setEditingComment,
  editValue,
  setEditValue,
  activeReactionPicker,
  setActiveReactionPicker,
  activeMoreMenu,
  setActiveMoreMenu,
  collapsedThreads,
  handleReply,
  handleEditComment,
  handleDeleteComment,
  handleResolve,
  handleToggleReaction,
  toggleThread,
}: UseChatSidebarRenderItemsArgs): UseChatSidebarRenderItemsResult => {
  const renderComment = useCallback(
    (comment: CollaborationComment) => (
      <CommentItem
        key={comment.id}
        comment={comment}
        isTopLevel
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        currentUserAvatar={currentUserAvatar}
        mentionItems={mentionItems}
        onMentionClick={onMentionClick}
        performanceStyle={commentRowStyle}
        replyingTo={replyingTo}
        editingComment={editingComment}
        editValue={editValue}
        activeReactionPicker={activeReactionPicker}
        activeMoreMenu={activeMoreMenu}
        collapsedThreads={collapsedThreads}
        onSetReplyingTo={setReplyingTo}
        onSetReplyValue={setReplyValue}
        replyValue={replyValue}
        onSetEditingComment={setEditingComment}
        onSetEditValue={setEditValue}
        onSetActiveReactionPicker={setActiveReactionPicker}
        onSetActiveMoreMenu={setActiveMoreMenu}
        onReply={handleReply}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onResolve={handleResolve}
        onToggleReaction={handleToggleReaction}
        onToggleThread={toggleThread}
      />
    ),
    [
      activeMoreMenu,
      activeReactionPicker,
      collapsedThreads,
      commentRowStyle,
      currentUserAvatar,
      currentUserId,
      currentUserName,
      editValue,
      editingComment,
      handleDeleteComment,
      handleEditComment,
      handleReply,
      handleResolve,
      handleToggleReaction,
      mentionItems,
      onMentionClick,
      replyValue,
      replyingTo,
      setActiveMoreMenu,
      setActiveReactionPicker,
      setEditValue,
      setEditingComment,
      setReplyValue,
      setReplyingTo,
      toggleThread,
    ],
  );

  const unresolvedCommentItems = useMemo(() => {
    if (!shouldVirtualizeUnresolvedComments) {
      return unresolvedComments.map(renderComment);
    }
    return (
      <div
        style={{
          height: unresolvedCommentVirtualizer.getTotalSize(),
          position: "relative",
        }}
      >
        {unresolvedCommentVirtualizer.getVirtualItems().map((virtualItem) => {
          const comment = unresolvedComments[virtualItem.index];
          if (!comment) {
            return null;
          }
          return (
            <div
              key={comment.id}
              ref={unresolvedCommentVirtualizer.measureElement}
              data-index={virtualItem.index}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {renderComment(comment)}
            </div>
          );
        })}
      </div>
    );
  }, [
    renderComment,
    unresolvedComments,
    unresolvedCommentVirtualizer,
    shouldVirtualizeUnresolvedComments,
  ]);

  const resolvedCommentItems = useMemo(
    () => resolvedComments.map(renderComment),
    [renderComment, resolvedComments],
  );

  return { unresolvedCommentItems, resolvedCommentItems };
};
