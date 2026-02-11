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
import type { CollaborationComment } from "../../types";
import { formatTaskDueDate } from "../../lib/dates";
import type { MentionItem as MentionItemType } from "../mentions/types";
import {
  formatRoleLabel,
  mapFeedCommentToUi,
  type CommentFeedRow,
} from "./commentFeed";
import type { ChatSidebarProps } from "./chatSidebar.types";
import { useChatSidebarCommentActions } from "./useChatSidebarCommentActions";
import { useChatSidebarRenderItems } from "./useChatSidebarRenderItems";
import { useChatSidebarState } from "./useChatSidebarState";
import { ChatSidebarView } from "./ChatSidebarView";

type ReactionSummaryEntry = {
  emoji: string;
  users: string[];
  userIds: string[];
};

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
  const repliesByParentIdRef = useRef<Record<string, CollaborationComment[]>>(
    {},
  );
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
    repliesByParentIdRef.current = {};
    initializedCollapsedThreadsRef.current = false;
  }, [activeProject.id]);
  useEffect(() => {
    repliesByParentIdRef.current = repliesByParentId;
  }, [repliesByParentId]);
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
      if (!force && repliesByParentIdRef.current[parentCommentId]) return;
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
    [convex],
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
  const applyRepliesCacheUpdate = useCallback(
    (nextRepliesByParentId: Record<string, CollaborationComment[]>) => {
      repliesByParentIdRef.current = nextRepliesByParentId;
      setRepliesByParentId(nextRepliesByParentId);
    },
    [],
  );
  const patchReplyInCache = useCallback(
    (
      commentId: string,
      patcher: (comment: CollaborationComment) => CollaborationComment,
    ) => {
      const current = repliesByParentIdRef.current;
      for (const [parentId, replies] of Object.entries(current)) {
        const replyIndex = replies.findIndex((reply) => reply.id === commentId);
        if (replyIndex === -1) {
          continue;
        }
        const nextReplies = [...replies];
        nextReplies[replyIndex] = patcher(nextReplies[replyIndex]);
        applyRepliesCacheUpdate({
          ...current,
          [parentId]: nextReplies,
        });
        return true;
      }
      return false;
    },
    [applyRepliesCacheUpdate],
  );
  const handleLocalResolveUpdate = useCallback(
    (args: { commentId: string; resolved?: boolean | undefined }) => {
      if (typeof args.resolved !== "boolean") {
        return false;
      }
      if (
        patchReplyInCache(args.commentId, (comment) => ({
          ...comment,
          resolved: args.resolved,
        }))
      ) {
        return true;
      }
      if (currentCommentsById.has(args.commentId)) {
        return true;
      }
      return false;
    },
    [currentCommentsById, patchReplyInCache],
  );
  const handleLocalEditUpdate = useCallback(
    (args: { commentId: string; content: string }) => {
      if (
        patchReplyInCache(args.commentId, (comment) => ({
          ...comment,
          content: args.content,
          edited: true,
        }))
      ) {
        return true;
      }
      if (currentCommentsById.has(args.commentId)) {
        return true;
      }
      return false;
    },
    [currentCommentsById, patchReplyInCache],
  );
  const handleLocalDeleteUpdate = useCallback(
    (args: { removedCommentId: string; parentCommentId: string | null }) => {
      const current = repliesByParentIdRef.current;
      const targetParentId =
        args.parentCommentId ?? replyParentByReplyId.get(args.removedCommentId) ?? null;
      if (!targetParentId) {
        if (currentCommentsById.has(args.removedCommentId)) {
          return true;
        }
        return false;
      }

      const currentReplies = current[targetParentId] ?? [];
      if (currentReplies.length === 0) {
        void loadRepliesForParent(targetParentId, true).catch(() => undefined);
        return true;
      }
      const nextReplies = currentReplies.filter(
        (reply) => reply.id !== args.removedCommentId,
      );
      if (nextReplies.length === currentReplies.length) {
        void loadRepliesForParent(targetParentId, true).catch(() => undefined);
        return true;
      }
      applyRepliesCacheUpdate({
        ...current,
        [targetParentId]: nextReplies,
      });
      return true;
    },
    [
      applyRepliesCacheUpdate,
      currentCommentsById,
      loadRepliesForParent,
      replyParentByReplyId,
    ],
  );
  const handleLocalReactionUpdate = useCallback(
    (args: { commentId: string; reactionSummary: ReactionSummaryEntry[] }) => {
      if (
        patchReplyInCache(args.commentId, (comment) => ({
          ...comment,
          reactions: args.reactionSummary,
        }))
      ) {
        return true;
      }
      if (currentCommentsById.has(args.commentId)) {
        return true;
      }
      return false;
    },
    [currentCommentsById, patchReplyInCache],
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
    onCommentResolved: handleLocalResolveUpdate,
    onCommentEdited: handleLocalEditUpdate,
    onCommentDeleted: handleLocalDeleteUpdate,
    onCommentReactionUpdated: handleLocalReactionUpdate,
    createCommentMutation,
    updateCommentMutation,
    removeCommentMutation,
    toggleResolvedMutation,
    toggleReactionMutation,
  });
  const { unresolvedCommentItems, resolvedCommentItems } =
    useChatSidebarRenderItems({
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
    });
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
