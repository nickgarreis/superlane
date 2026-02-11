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

type MutationFn<TArgs extends Record<string, unknown>> = (args: TArgs) => Promise<unknown>;

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
  createCommentMutation: MutationFn<{
    projectPublicId: string;
    content: string;
    parentCommentId?: Id<"projectComments">;
  }>;
  updateCommentMutation: MutationFn<{ commentId: Id<"projectComments">; content: string }>;
  removeCommentMutation: MutationFn<{ commentId: Id<"projectComments"> }>;
  toggleResolvedMutation: MutationFn<{ commentId: Id<"projectComments"> }>;
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
        .then(() => {
          refreshRepliesForComment(commentId);
        })
        .catch((error) => {
          reportUiError("chatSidebar.toggleResolved", error, { showToast: false });
        });
    },
    [refreshRepliesForComment, toggleResolvedMutation],
  );

  const handleEditComment = useCallback(
    (commentId: string) => {
      if (!editValue.trim()) {
        return;
      }
      void updateCommentMutation({
        commentId: commentId as Id<"projectComments">,
        content: editValue.trim(),
      })
        .then(() => {
          setEditingComment(null);
          setEditValue("");
          refreshRepliesForComment(commentId);
        })
        .catch((error) => {
          reportUiError("chatSidebar.editComment", error, { showToast: false });
        });
    },
    [editValue, refreshRepliesForComment, setEditValue, setEditingComment, updateCommentMutation],
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      void removeCommentMutation({ commentId: commentId as Id<"projectComments"> })
        .then(() => {
          refreshRepliesForComment(commentId);
        })
        .catch((error) => {
          reportUiError("chatSidebar.deleteComment", error, { showToast: false });
        });
    },
    [refreshRepliesForComment, removeCommentMutation],
  );

  const handleToggleReaction = useCallback(
    (commentId: string, emoji: string) => {
      void toggleReactionMutation({ commentId: commentId as Id<"projectComments">, emoji })
        .then(() => {
          setActiveReactionPicker(null);
          refreshRepliesForComment(commentId);
        })
        .catch((error) => {
          reportUiError("chatSidebar.toggleReaction", error, { showToast: false });
        });
    },
    [refreshRepliesForComment, setActiveReactionPicker, toggleReactionMutation],
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
