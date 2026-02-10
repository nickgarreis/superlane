import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CollaborationComment, ProjectData, ViewerIdentity, WorkspaceMember } from "../../types";
import type { AppView } from "../../lib/routing";
import { formatTaskDueDate } from "../../lib/dates";
import { reportUiError } from "../../lib/errors";
import type { MentionItem as MentionItemType } from "../mentions/types";
import { CommentItem } from "./CommentItem";
import { useChatSidebarState } from "./useChatSidebarState";
import { ChatSidebarView } from "./ChatSidebarView";

const formatRoleLabel = (role: WorkspaceMember["role"]) =>
  role.charAt(0).toUpperCase() + role.slice(1);

// ── Chat Sidebar ──────────────────────────────────────────────────
interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: ProjectData;
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
  const currentUserName = viewerIdentity.name || "Unknown user";
  const currentUserAvatar = viewerIdentity.avatarUrl || "";
  const currentUserId = viewerIdentity.userId;

  const comments = useQuery(api.comments.listForProject, {
    projectPublicId: activeProject.id,
  });
  const createCommentMutation = useMutation(api.comments.create);
  const updateCommentMutation = useMutation(api.comments.update);
  const removeCommentMutation = useMutation(api.comments.remove);
  const toggleResolvedMutation = useMutation(api.comments.toggleResolved);
  const toggleReactionMutation = useMutation(api.comments.toggleReaction);

  const currentComments = useMemo(
    () => (comments ?? []) as CollaborationComment[],
    [comments],
  );
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

    return {
      unresolvedComments: unresolved,
      resolvedComments: resolved,
    };
  }, [currentComments]);

  const totalThreadCount = currentComments.length;
  const resolvedCount = resolvedComments.length;
  const shouldOptimizeCommentRows = currentComments.length > 40;
  const commentRowStyle = useMemo(
    () => (
      shouldOptimizeCommentRows
        ? ({ contentVisibility: "auto", containIntrinsicSize: "120px" } as const)
        : undefined
    ),
    [shouldOptimizeCommentRows],
  );

  const mentionItemGroups = useMemo(() => {
    const taskItems: MentionItemType[] = (activeProject.tasks ?? []).map((task) => ({
      type: "task",
      id: task.id,
      label: task.title,
      meta: task.completed ? "Done" : formatTaskDueDate(task.dueDateEpochMs),
      completed: task.completed,
    }));

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

    return {
      taskItems,
      fileItems,
      userItems,
    };
  }, [activeProject.tasks, allFiles, workspaceMembers]);

  const mentionItems: MentionItemType[] = useMemo(
    () => [
      ...mentionItemGroups.taskItems,
      ...mentionItemGroups.fileItems,
      ...mentionItemGroups.userItems,
    ],
    [mentionItemGroups],
  );

  // Close menus on outside click
  useEffect(() => {
    if (activeReactionPicker || activeMoreMenu) {
      const handler = () => {
        setActiveReactionPicker(null);
        setActiveMoreMenu(null);
      };
      const handleScroll = () => {
        setActiveMoreMenu(null);
        setActiveReactionPicker(null);
      };
      const scrollContainer = scrollRef.current;
      const timer = setTimeout(() => {
        document.addEventListener("click", handler);
      }, 0);
      window.addEventListener("scroll", handleScroll, { passive: true });
      scrollContainer?.addEventListener("scroll", handleScroll, {
        passive: true,
      });
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handler);
        window.removeEventListener("scroll", handleScroll);
        scrollContainer?.removeEventListener("scroll", handleScroll);
      };
    }
  }, [
    activeReactionPicker,
    activeMoreMenu,
    setActiveMoreMenu,
    setActiveReactionPicker,
  ]);

  const handleAddComment = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim()) return;

      void createCommentMutation({
        projectPublicId: activeProject.id,
        content: inputValue.trim(),
      })
        .then(() => {
          setInputValue("");
          setTimeout(
            () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
            100,
          );
        })
        .catch((error) => {
          reportUiError("chatSidebar.addComment", error, { showToast: false });
        });
    },
    [inputValue, activeProject.id, createCommentMutation, setInputValue]
  );

  const handleReply = useCallback(
    (parentId: string, e?: React.FormEvent) => {
      e?.preventDefault();
      if (!replyValue.trim()) return;

      void createCommentMutation({
        projectPublicId: activeProject.id,
        parentCommentId: parentId as Id<"projectComments">,
        content: replyValue.trim(),
      })
        .then(() => {
          setCollapsedThreads((prev) => {
            const next = new Set(prev);
            next.delete(parentId);
            return next;
          });
          setReplyingTo(null);
          setReplyValue("");
        })
        .catch((error) => {
          reportUiError("chatSidebar.replyComment", error, { showToast: false });
        });
    },
    [
      replyValue,
      activeProject.id,
      createCommentMutation,
      setCollapsedThreads,
      setReplyingTo,
      setReplyValue,
    ]
  );

  const handleResolve = useCallback(
    (commentId: string) => {
      void toggleResolvedMutation({ commentId: commentId as Id<"projectComments"> }).catch((error) => {
        reportUiError("chatSidebar.toggleResolved", error, { showToast: false });
      });
    },
    [toggleResolvedMutation]
  );

  const handleEditComment = useCallback(
    (commentId: string) => {
      if (!editValue.trim()) return;

      void updateCommentMutation({
        commentId: commentId as Id<"projectComments">,
        content: editValue.trim(),
      })
        .then(() => {
          setEditingComment(null);
          setEditValue("");
        })
        .catch((error) => {
          reportUiError("chatSidebar.editComment", error, { showToast: false });
        });
    },
    [editValue, updateCommentMutation, setEditingComment, setEditValue]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      void removeCommentMutation({ commentId: commentId as Id<"projectComments"> }).catch((error) => {
        reportUiError("chatSidebar.deleteComment", error, { showToast: false });
      });
    },
    [removeCommentMutation]
  );

  const handleToggleReaction = useCallback(
    (commentId: string, emoji: string) => {
      void toggleReactionMutation({
        commentId: commentId as Id<"projectComments">,
        emoji,
      })
        .then(() => {
          setActiveReactionPicker(null);
        })
        .catch((error) => {
          reportUiError("chatSidebar.toggleReaction", error, { showToast: false });
        });
    },
    [toggleReactionMutation, setActiveReactionPicker]
  );

  const toggleThread = useCallback((id: string) => {
    setCollapsedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [setCollapsedThreads]);

  const renderComments = useCallback(
    (comments: CollaborationComment[]) =>
      comments.map((comment) => (
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
      )),
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

  const unresolvedCommentItems = useMemo(
    () => renderComments(unresolvedComments),
    [renderComments, unresolvedComments],
  );

  const resolvedCommentItems = useMemo(
    () => renderComments(resolvedComments),
    [renderComments, resolvedComments],
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
      onToggleResolvedThreads={() => setShowResolvedThreads(!showResolvedThreads)}
      scrollRef={scrollRef}
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
