import React, { useRef, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQuery } from "convex/react";
import {
  X,
  ChevronDown,
  CheckCheck,
  MessageSquare,
  Send,
} from "lucide-react";
import { cn } from "../../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import type { CollaborationComment, ProjectData, ViewerIdentity, WorkspaceMember } from "../../types";
import type { AppView } from "../../lib/routing";
import { ProjectLogo } from "../ProjectLogo";
import { formatTaskDueDate } from "../../lib/dates";
import {
  MentionTextarea,
  MentionItem as MentionItemType,
} from "../MentionTextarea";
import { CommentItem } from "./CommentItem";
import { ProjectDropdown } from "./ProjectDropdown";
import { useChatSidebarState } from "./useChatSidebarState";

const formatRoleLabel = (role: WorkspaceMember["role"]) =>
  role.charAt(0).toUpperCase() + role.slice(1);

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";


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

  const inputRef = useRef<HTMLDivElement>(null);
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
          console.error(error);
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
          console.error(error);
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
        console.error(error);
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
          console.error(error);
        });
    },
    [editValue, updateCommentMutation, setEditingComment, setEditValue]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      void removeCommentMutation({ commentId: commentId as Id<"projectComments"> }).catch((error) => {
        console.error(error);
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
          console.error(error);
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="absolute top-0 right-0 bottom-0 w-[420px] bg-bg-surface border-l border-white/[0.05] shadow-2xl z-50 flex flex-col overflow-hidden pointer-events-auto"
        >
          {/* ── Header ──────────────────────────────────── */}
          <div className="shrink-0 px-4 h-[57px] flex items-center border-b border-white/[0.05] bg-bg-surface relative z-20">
            <div className="flex items-center w-full pr-10">
              <ProjectDropdown
                activeProject={activeProject}
                sortedProjects={sortedProjects}
                isOpen={isDropdownOpen}
                onOpenChange={setIsDropdownOpen}
                onSwitchProject={onSwitchProject}
              />

              {/* Thread count badge */}
              {totalThreadCount > 0 && (
                <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/25 select-none mr-2">
                  <MessageSquare className="w-3 h-3" />
                  <span>{totalThreadCount}</span>
                </div>
              )}
            </div>

            <button
              onClick={onClose}
              className="absolute top-1/2 -translate-y-1/2 right-3 p-2 hover:bg-white/5 rounded-lg text-white/30 hover:text-white/60 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* ── Composer ──────────────────────────────────── */}
          <div className="shrink-0 px-4 pt-4 pb-3 border-b border-white/[0.04]">
            <form onSubmit={handleAddComment}>
              <div
                className={cn(
                  "flex items-start gap-2.5 rounded-xl p-3 transition-all duration-200 border",
                  inputFocused
                    ? "bg-white/[0.03] border-white/[0.08]"
                    : "bg-transparent border-transparent hover:bg-white/[0.02]"
                )}
              >
                <div className="shrink-0 pt-0.5">
                  <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
                    {currentUserAvatar ? (
                      <img
                        src={currentUserAvatar}
                        alt={currentUserName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-white/10 flex items-center justify-center text-[10px] font-medium text-white/80">
                        {getInitials(currentUserName)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <MentionTextarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={setInputValue}
                    items={mentionItems}
                    onFocus={() => setInputFocused(true)}
                    onBlur={() => setInputFocused(false)}
                    placeholder="Leave a comment... (@ to mention)"
                    className="w-full bg-transparent border-none p-0 text-[13.5px] text-[#E8E8E8] placeholder:text-white/20 focus:outline-none resize-none leading-[1.5] min-h-[22px]"
                    rows={1}
                    onKeyDown={(e) => {
                      if (
                        e.key === "Enter" &&
                        (e.metaKey || e.ctrlKey)
                      ) {
                        e.preventDefault();
                        handleAddComment();
                      }
                    }}
                    onMentionClick={onMentionClick}
                  />
                  <AnimatePresence>
                    {(inputValue.trim() || inputFocused) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.12 }}
                        className="flex items-center justify-between mt-2 overflow-hidden"
                      >
                        <span className="text-[10px] text-white/15 select-none">
                          ⌘Enter to send · @ to mention
                        </span>
                        <button
                          type="submit"
                          disabled={!inputValue.trim()}
                          className={cn(
                            "flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] transition-all cursor-pointer",
                            inputValue.trim()
                              ? "bg-white/90 text-bg-base hover:bg-white"
                              : "bg-white/[0.06] text-white/20 cursor-not-allowed"
                          )}
                        >
                          <Send className="w-3 h-3" />
                          Send
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </form>
          </div>

          {/* ── Comments List ────────────────────────────── */}
          <div
            ref={scrollRef}
            className="chat-comment-list flex-1 overflow-y-auto px-1.5 pb-8"
            style={shouldOptimizeCommentRows
              ? ({ contentVisibility: "auto", containIntrinsicSize: "900px" } as const)
              : undefined}
          >
            {currentComments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-8">
                <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-4">
                  <MessageSquare className="w-5 h-5 text-white/15" />
                </div>
                <p className="text-[13px] text-white/25 mb-1">
                  No comments yet
                </p>
                <p className="text-[12px] text-white/12 max-w-[200px]">
                  Start a conversation about {activeProject.name}
                </p>
              </div>
            ) : (
              <>
                {/* Unresolved threads */}
                {unresolvedComments.length > 0 && (
                  <div className="pt-2">
                    {unresolvedCommentItems}
                  </div>
                )}

                {/* Resolved threads */}
                {resolvedCount > 0 && (
                  <div className="mt-2">
                    <button
                      onClick={() =>
                        setShowResolvedThreads(!showResolvedThreads)
                      }
                      className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-white/20 hover:text-white/35 transition-colors cursor-pointer select-none"
                    >
                      <div className="flex-1 h-px bg-white/[0.04]" />
                      <div className="flex items-center gap-1.5 shrink-0">
                        <CheckCheck className="w-3 h-3" />
                        <span>
                          {resolvedCount} resolved{" "}
                          {resolvedCount === 1 ? "thread" : "threads"}
                        </span>
                        <ChevronDown
                          className={cn(
                            "w-3 h-3 transition-transform duration-200",
                            showResolvedThreads && "rotate-180"
                          )}
                        />
                      </div>
                      <div className="flex-1 h-px bg-white/[0.04]" />
                    </button>

                    <AnimatePresence>
                      {showResolvedThreads && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="opacity-50">
                            {resolvedCommentItems}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
