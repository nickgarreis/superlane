import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type FormEvent,
  type RefObject,
  type SetStateAction,
  type UIEvent,
} from "react";
import type { Id } from "../../../../convex/_generated/dataModel";
import { reportUiError } from "../../lib/errors";
import { useGlobalEventListener } from "../../lib/hooks/useGlobalEventListener";

type MutationFn<TArgs extends Record<string, unknown>, TResult = unknown> = (
  args: TArgs,
) => Promise<TResult>;
type ReactionSummaryEntry = {
  emoji: string;
  users: string[];
  userIds: string[];
};
type ToggleResolvedMutationResult = {
  resolved?: boolean;
};

type UseChatSidebarCommentActionsArgs = {
  activeProjectId: string;
  inputValue: string;
  setInputValue: (value: string) => void;
  replyValue: string;
  setReplyValue: (value: string) => void;
  setReplyingTo: (value: string | null) => void;
  editValue: string;
  setEditValue: (value: string) => void;
  setEditingComment: (value: string | null) => void;
  setCollapsedThreads: Dispatch<SetStateAction<Set<string>>>;
  setActiveReactionPicker: (value: string | null) => void;
  setActiveMoreMenu: (value: string | null) => void;
  activeReactionPicker: string | null;
  activeMoreMenu: string | null;
  threadsPaginationStatus: "LoadingFirstPage" | "CanLoadMore" | "LoadingMore" | "Exhausted";
  loadMoreThreads: (numItems: number) => void;
  scrollRef: RefObject<HTMLDivElement>;
  loadRepliesForParent: (parentCommentId: string, force?: boolean) => Promise<void>;
  refreshRepliesForComment: (commentId: string) => void;
  onCommentResolved?: (args: { commentId: string; resolved?: boolean | undefined }) => boolean;
  onCommentEdited?: (args: {
    commentId: string;
    content: string;
    updatedAtEpochMs?: number;
  }) => boolean;
  onCommentDeleted?: (args: {
    removedCommentId: string;
    parentCommentId: string | null;
  }) => boolean;
  onCommentReactionUpdated?: (args: {
    commentId: string;
    reactionSummary: ReactionSummaryEntry[];
  }) => boolean;
  createCommentMutation: MutationFn<{
    projectPublicId: string;
    content: string;
    parentCommentId?: Id<"projectComments">;
  }>;
  updateCommentMutation: MutationFn<{ commentId: Id<"projectComments">; content: string }>;
  removeCommentMutation: MutationFn<{ commentId: Id<"projectComments"> }>;
  toggleResolvedMutation: MutationFn<
    { commentId: Id<"projectComments"> },
    ToggleResolvedMutationResult
  >;
  toggleReactionMutation: MutationFn<{ commentId: Id<"projectComments">; emoji: string }>;
};

export const useChatSidebarCommentActions = ({
  activeProjectId,
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
  onCommentResolved,
  onCommentEdited,
  onCommentDeleted,
  onCommentReactionUpdated,
  createCommentMutation,
  updateCommentMutation,
  removeCommentMutation,
  toggleResolvedMutation,
  toggleReactionMutation,
}: UseChatSidebarCommentActionsArgs) => {
  const isLoadingThreadsMoreRef = useRef(false);
  const mountedRef = useRef(true);
  const addCommentScrollTimerRef = useRef<number | null>(null);
  const [outsideClickReady, setOutsideClickReady] = useState(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (addCommentScrollTimerRef.current !== null) {
        window.clearTimeout(addCommentScrollTimerRef.current);
        addCommentScrollTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    isLoadingThreadsMoreRef.current = false;
  }, [activeProjectId]);

  useEffect(() => {
    if (threadsPaginationStatus !== "LoadingMore") {
      isLoadingThreadsMoreRef.current = false;
    }
  }, [threadsPaginationStatus]);

  const handleCommentsScroll = useCallback(
    (event: UIEvent<HTMLDivElement>) => {
      if (isLoadingThreadsMoreRef.current || threadsPaginationStatus !== "CanLoadMore") {
        return;
      }
      const element = event.currentTarget;
      const remaining = element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= 280) {
        isLoadingThreadsMoreRef.current = true;
        loadMoreThreads(50);
      }
    },
    [loadMoreThreads, threadsPaginationStatus],
  );

  const hasOpenMenu = Boolean(activeReactionPicker || activeMoreMenu);
  const handleCloseOpenMenus = useCallback(() => {
    setActiveReactionPicker(null);
    setActiveMoreMenu(null);
  }, [setActiveMoreMenu, setActiveReactionPicker]);

  useEffect(() => {
    if (!hasOpenMenu) {
      setOutsideClickReady(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setOutsideClickReady(true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      setOutsideClickReady(false);
    };
  }, [hasOpenMenu]);

  useGlobalEventListener({
    target: document,
    type: "click",
    listener: handleCloseOpenMenus,
    enabled: hasOpenMenu && outsideClickReady,
  });
  useGlobalEventListener({
    target: window,
    type: "scroll",
    listener: handleCloseOpenMenus,
    enabled: hasOpenMenu,
    options: { passive: true },
  });
  useGlobalEventListener({
    target: scrollRef,
    type: "scroll",
    listener: handleCloseOpenMenus,
    enabled: hasOpenMenu,
    options: { passive: true },
  });

  const handleAddComment = useCallback(
    (event?: FormEvent) => {
      event?.preventDefault();
      if (!inputValue.trim()) {
        return;
      }
      void createCommentMutation({
        projectPublicId: activeProjectId,
        content: inputValue.trim(),
      })
        .then(() => {
          setInputValue("");
          if (addCommentScrollTimerRef.current !== null) {
            window.clearTimeout(addCommentScrollTimerRef.current);
          }
          addCommentScrollTimerRef.current = window.setTimeout(() => {
            addCommentScrollTimerRef.current = null;
            if (!mountedRef.current) {
              return;
            }
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
          }, 100);
        })
        .catch((error) => {
          reportUiError("chatSidebar.addComment", error, { showToast: false });
        });
    },
    [activeProjectId, createCommentMutation, inputValue, scrollRef, setInputValue],
  );

  const handleReply = useCallback(
    (parentId: string, event?: FormEvent) => {
      event?.preventDefault();
      if (!replyValue.trim()) {
        return;
      }
      void createCommentMutation({
        projectPublicId: activeProjectId,
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
          void loadRepliesForParent(parentId, true);
        })
        .catch((error) => {
          reportUiError("chatSidebar.replyComment", error, { showToast: false });
        });
    },
    [activeProjectId, createCommentMutation, loadRepliesForParent, replyValue, setCollapsedThreads, setReplyValue, setReplyingTo],
  );

  const handleResolve = useCallback(
    (commentId: string) => {
      void toggleResolvedMutation({ commentId: commentId as Id<"projectComments"> })
        .then((result) => {
          const resolved =
            typeof result?.resolved === "boolean" ? result.resolved : undefined;
          const handledLocally =
            onCommentResolved?.({
              commentId,
              ...(resolved === undefined ? {} : { resolved }),
            }) ?? false;
          if (!handledLocally) {
            refreshRepliesForComment(commentId);
          }
        })
        .catch((error) => {
          reportUiError("chatSidebar.toggleResolved", error, { showToast: false });
        });
    },
    [onCommentResolved, refreshRepliesForComment, toggleResolvedMutation],
  );

  const handleEditComment = useCallback(
    (commentId: string) => {
      const trimmedEditValue = editValue.trim();
      if (!trimmedEditValue) {
        return;
      }
      void updateCommentMutation({
        commentId: commentId as Id<"projectComments">,
        content: trimmedEditValue,
      })
        .then((result: any) => {
          setEditingComment(null);
          setEditValue("");
          const handledLocally =
            onCommentEdited?.({
              commentId,
              content: trimmedEditValue,
              updatedAtEpochMs:
                typeof result?.updatedAtEpochMs === "number"
                  ? result.updatedAtEpochMs
                  : undefined,
            }) ?? false;
          if (!handledLocally) {
            refreshRepliesForComment(commentId);
          }
        })
        .catch((error) => {
          reportUiError("chatSidebar.editComment", error, { showToast: false });
        });
    },
    [
      editValue,
      onCommentEdited,
      refreshRepliesForComment,
      setEditValue,
      setEditingComment,
      updateCommentMutation,
    ],
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      void removeCommentMutation({ commentId: commentId as Id<"projectComments"> })
        .then((result: any) => {
          if (result?.removed === false) {
            return;
          }
          const removedCommentId =
            typeof result?.removedCommentId === "string"
              ? result.removedCommentId
              : commentId;
          const parentCommentId =
            typeof result?.parentCommentId === "string"
              ? result.parentCommentId
              : null;
          const handledLocally =
            onCommentDeleted?.({ removedCommentId, parentCommentId }) ?? false;
          if (!handledLocally) {
            refreshRepliesForComment(commentId);
          }
        })
        .catch((error) => {
          reportUiError("chatSidebar.deleteComment", error, { showToast: false });
        });
    },
    [onCommentDeleted, refreshRepliesForComment, removeCommentMutation],
  );

  const handleToggleReaction = useCallback(
    (commentId: string, emoji: string) => {
      void toggleReactionMutation({ commentId: commentId as Id<"projectComments">, emoji })
        .then((result: any) => {
          setActiveReactionPicker(null);
          const reactionSummary = Array.isArray(result?.reactionSummary)
            ? (result.reactionSummary.filter(
                (entry: unknown): entry is ReactionSummaryEntry =>
                  typeof entry === "object" &&
                  entry !== null &&
                  typeof (entry as ReactionSummaryEntry).emoji === "string" &&
                  Array.isArray((entry as ReactionSummaryEntry).users) &&
                  Array.isArray((entry as ReactionSummaryEntry).userIds),
              ) as ReactionSummaryEntry[])
            : [];
          const handledLocally =
            onCommentReactionUpdated?.({ commentId, reactionSummary }) ?? false;
          if (!handledLocally) {
            refreshRepliesForComment(commentId);
          }
        })
        .catch((error) => {
          reportUiError("chatSidebar.toggleReaction", error, { showToast: false });
        });
    },
    [
      onCommentReactionUpdated,
      refreshRepliesForComment,
      setActiveReactionPicker,
      toggleReactionMutation,
    ],
  );

  const toggleThread = useCallback(
    (id: string) => {
      let shouldLoadReplies = false;
      setCollapsedThreads((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
          shouldLoadReplies = true;
        } else {
          next.add(id);
        }
        return next;
      });
      if (shouldLoadReplies) {
        void loadRepliesForParent(id);
      }
    },
    [loadRepliesForParent, setCollapsedThreads],
  );

  return {
    handleCommentsScroll,
    handleAddComment,
    handleReply,
    handleResolve,
    handleEditComment,
    handleDeleteComment,
    handleToggleReaction,
    toggleThread,
  };
};
