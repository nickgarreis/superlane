import React, {
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useConvex, useMutation, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type {
  CollaborationComment,
  ProjectData,
  Task,
  ViewerIdentity,
  WorkspaceMember,
} from "../../types";
import type { AppView } from "../../lib/routing";
import { formatTaskDueDate } from "../../lib/dates";
import type { MentionItem as MentionItemType } from "../mentions/types";
import { CommentItem } from "./CommentItem";
import {
  formatRoleLabel,
  mapFeedCommentToUi,
  type CommentFeedRow,
} from "./commentFeed";
import { useChatSidebarCommentActions } from "./useChatSidebarCommentActions";
import { useChatSidebarState } from "./useChatSidebarState";
import { ChatSidebarView } from "./ChatSidebarView";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: ProjectData;
  activeProjectTasks: Task[];
  allProjects: Record<string, ProjectData>;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  onSwitchProject?: (view: AppView) => void;
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  allFiles?: Array<{ id: number | string; name: string; type: string }>;
}

export function ChatSidebar({
  isOpen,
  onClose,
  activeProject,
  activeProjectTasks,
  allProjects,
  workspaceMembers,
  viewerIdentity,
  onSwitchProject,
  onMentionClick,
  allFiles,
}: ChatSidebarProps) {
  const {
    inputValue,
    setInputValue,
    replyingTo,
    setReplyingTo,
    replyValue,
    setReplyValue,
    isDropdownOpen,
    setIsDropdownOpen,
    collapsedThreads,
    setCollapsedThreads,
    editingComment,
    setEditingComment,
    editValue,
    setEditValue,
    showResolvedThreads,
    setShowResolvedThreads,
    activeReactionPicker,
    setActiveReactionPicker,
    activeMoreMenu,
    setActiveMoreMenu,
    inputFocused,
    setInputFocused,
  } = useChatSidebarState(activeProject.id);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initializedCollapsedThreadsRef = useRef(false);
  const [repliesByParentId, setRepliesByParentId] = useState<
    Record<string, CollaborationComment[]>
  >({});
  const convex = useConvex();
  const currentUserName = viewerIdentity.name || "Unknown user";
  const currentUserAvatar = viewerIdentity.avatarUrl || "";
  const currentUserId = viewerIdentity.userId;
  const {
    results: paginatedThreads,
    status: threadsPaginationStatus,
    loadMore: loadMoreThreads,
  } = usePaginatedQuery(
    api.comments.listThreadsPaginated,
    { projectPublicId: activeProject.id },
    { initialNumItems: 100 },
  );
  const createCommentMutation = useMutation(api.comments.create);
  const updateCommentMutation = useMutation(api.comments.update);
  const removeCommentMutation = useMutation(api.comments.remove);
  const toggleResolvedMutation = useMutation(api.comments.toggleResolved);
  const toggleReactionMutation = useMutation(api.comments.toggleReaction);
  const currentComments = useMemo(
    () =>
      ((paginatedThreads ?? []) as CommentFeedRow[]).map((thread) =>
        mapFeedCommentToUi(thread, repliesByParentId[String(thread.id)] ?? []),
      ),
    [paginatedThreads, repliesByParentId],
  );
  useEffect(() => {
    setRepliesByParentId({});
    initializedCollapsedThreadsRef.current = false;
  }, [activeProject.id]);
  useEffect(() => {
    if (initializedCollapsedThreadsRef.current || currentComments.length === 0) {
      return;
    }
    const threadIdsWithReplies = currentComments
      .filter((comment) => (comment.replyCount ?? 0) > 0)
      .map((comment) => comment.id);
    if (threadIdsWithReplies.length > 0) {
      setCollapsedThreads(new Set(threadIdsWithReplies));
    }
    initializedCollapsedThreadsRef.current = true;
  }, [currentComments, setCollapsedThreads]);
  const { unresolvedComments, resolvedComments } = useMemo(() => {
    const unresolved: CollaborationComment[] = [];
    const resolved: CollaborationComment[] = [];
    for (const comment of currentComments) {
      if (comment.resolved) {
        resolved.push(comment);
      } else {
        unresolved.push(comment);
      }
    }
    return { unresolvedComments: unresolved, resolvedComments: resolved };
  }, [currentComments]);
  const totalThreadCount = useMemo(
    () =>
      currentComments.reduce(
        (sum, comment) => sum + 1 + (comment.replyCount ?? comment.replies.length),
        0,
      ),
    [currentComments],
  );
  const resolvedCount = resolvedComments.length;
  const shouldOptimizeCommentRows = currentComments.length > 40;
  const shouldVirtualizeUnresolvedComments = unresolvedComments.length > 80;
  const commentRowStyle = useMemo(
    () =>
      shouldOptimizeCommentRows
        ? ({
            contentVisibility: "auto",
            containIntrinsicSize: "120px",
          } as const)
        : undefined,
    [shouldOptimizeCommentRows],
  );
  const unresolvedCommentVirtualizer = useVirtualizer({
    count: unresolvedComments.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
    overscan: 8,
  });
  const mentionItemGroups = useMemo(() => {
    const taskItems: MentionItemType[] = activeProjectTasks.map(
      (task) => ({
        type: "task",
        id: task.id,
        label: task.title,
        meta: task.completed ? "Done" : formatTaskDueDate(task.dueDateEpochMs),
        completed: task.completed,
      }),
    );
    const fileItems: MentionItemType[] = (allFiles ?? []).map((file) => ({
      type: "file",
      id: String(file.id),
      label: file.name,
      meta: file.type,
    }));
    const userItems: MentionItemType[] = workspaceMembers.map((member) => ({
      type: "user",
      id: member.userId,
      label: member.name,
      meta: formatRoleLabel(member.role),
    }));
    return { taskItems, fileItems, userItems };
  }, [activeProjectTasks, allFiles, workspaceMembers]);
  const mentionItems: MentionItemType[] = useMemo(
    () => [
      ...mentionItemGroups.taskItems,
      ...mentionItemGroups.fileItems,
      ...mentionItemGroups.userItems,
    ],
    [mentionItemGroups],
  );
  const loadRepliesForParent = useCallback(
    async (parentCommentId: string, force = false) => {
      if (!force && repliesByParentId[parentCommentId]) return;
      const paginated = await convex.query(api.comments.listReplies, {
        parentCommentId: parentCommentId as Id<"projectComments">,
        paginationOpts: {
          cursor: null,
          numItems: 250,
        },
      });
      const mappedReplies = (paginated.page as CommentFeedRow[]).map((reply) =>
        mapFeedCommentToUi(reply, []),
      );
      setRepliesByParentId((prev) => {
        if (!force && prev[parentCommentId]) {
          return prev;
        }
        return {
          ...prev,
          [parentCommentId]: mappedReplies,
        };
      });
    },
    [convex, repliesByParentId],
  );
  const currentCommentsById = useMemo(
    () => new Map(currentComments.map((comment) => [comment.id, comment] as const)),
    [currentComments],
  );
  const replyParentByReplyId = useMemo(() => {
    const parentByReply = new Map<string, string>();
    Object.entries(repliesByParentId).forEach(([parentId, replies]) => {
      replies.forEach((reply) => {
        parentByReply.set(reply.id, parentId);
      });
    });
    return parentByReply;
  }, [repliesByParentId]);
  const refreshRepliesForComment = useCallback(
    (commentId: string) => {
      const parentId = currentCommentsById.has(commentId)
        ? commentId
        : replyParentByReplyId.get(commentId);
      if (!parentId) {
        return;
      }
      void loadRepliesForParent(parentId, true).catch(() => undefined);
    },
    [currentCommentsById, loadRepliesForParent, replyParentByReplyId],
  );
  const {
    handleCommentsScroll,
    handleAddComment,
    handleReply,
    handleResolve,
    handleEditComment,
    handleDeleteComment,
    handleToggleReaction,
    toggleThread,
  } = useChatSidebarCommentActions({
    activeProjectId: activeProject.id,
    inputValue,
    setInputValue,
    replyValue,
    setReplyValue,
    setReplyingTo,
    editValue,
    setEditValue,
    setEditingComment,
    setCollapsedThreads,
    setActiveReactionPicker,
    setActiveMoreMenu,
    activeReactionPicker,
    activeMoreMenu,
    threadsPaginationStatus,
    loadMoreThreads,
    scrollRef,
    loadRepliesForParent,
    refreshRepliesForComment,
    createCommentMutation,
    updateCommentMutation,
    removeCommentMutation,
    toggleResolvedMutation,
    toggleReactionMutation,
  });
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
  const sortedProjects = useMemo(
    () =>
      [...Object.values(allProjects)].sort((a, b) => {
        if (a.archived === b.archived) return 0;
        return a.archived ? 1 : -1;
      }),
    [allProjects],
  );
  return (
    <ChatSidebarView
      isOpen={isOpen}
      onClose={onClose}
      activeProject={activeProject}
      sortedProjects={sortedProjects}
      isDropdownOpen={isDropdownOpen}
      onDropdownOpenChange={setIsDropdownOpen}
      onSwitchProject={onSwitchProject}
      totalThreadCount={totalThreadCount}
      currentComments={currentComments}
      unresolvedComments={unresolvedComments}
      resolvedCommentItems={resolvedCommentItems}
      unresolvedCommentItems={unresolvedCommentItems}
      resolvedCount={resolvedCount}
      showResolvedThreads={showResolvedThreads}
      onToggleResolvedThreads={() =>
        setShowResolvedThreads(!showResolvedThreads)
      }
      scrollRef={scrollRef}
      onCommentsScroll={handleCommentsScroll}
      shouldOptimizeCommentRows={shouldOptimizeCommentRows}
      currentUserName={currentUserName}
      currentUserAvatar={currentUserAvatar}
      inputValue={inputValue}
      onInputValueChange={setInputValue}
      inputFocused={inputFocused}
      onInputFocusChange={setInputFocused}
      mentionItems={mentionItems}
      onMentionClick={onMentionClick}
      onSubmitComment={handleAddComment}
    />
  );
}
