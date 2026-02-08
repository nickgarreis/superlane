import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CornerDownRight,
  ChevronDown,
  ChevronRight,
  Check,
  CheckCheck,
  MessageSquare,
  Send,
  Pencil,
  Trash2,
  SmilePlus,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import imgNickGarreis from "figma:asset/8ff76ab4f0991c684214e12b050fc8cc11b7f7f8.png";
import { ProjectData } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import {
  MentionTextarea,
  MentionItem as MentionItemType,
  renderCommentContent,
} from "./MentionTextarea";

interface Reaction {
  emoji: string;
  users: string[];
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: string;
  replies: Comment[];
  resolved?: boolean;
  reactions?: Reaction[];
  edited?: boolean;
}

const REACTION_OPTIONS = ["👍", "❤️", "👀", "🎉", "💡", "✅"];

const CURRENT_USER = "Nick Garreis";

// Mock workspace members for @ mentions
const WORKSPACE_MEMBERS = [
  { id: "u1", name: "Nick Garreis", role: "Owner" },
  { id: "u2", name: "Sarah Chen", role: "Designer" },
  { id: "u3", name: "Mike Ross", role: "Developer" },
  { id: "u4", name: "Emily Zhang", role: "PM" },
  { id: "u5", name: "Alex Rivera", role: "Developer" },
  { id: "u6", name: "Jordan Lee", role: "QA" },
];

const PROJECT_COMMENTS: Record<string, Comment[]> = {
  "website-redesign": [
    {
      id: "1",
      author: { name: "Sarah Chen", avatar: imgNickGarreis },
      content:
        "Can we double check the contrast ratios on the dark mode toggle? I think it might be a bit too low for accessibility standards.",
      timestamp: "2 hours ago",
      reactions: [{ emoji: "👍", users: ["Mike Ross"] }],
      replies: [
        {
          id: "1-1",
          author: { name: "Mike Ross", avatar: imgNickGarreis },
          content:
            "Good catch. I'll run a Lighthouse audit and adjust the colors if needed.",
          timestamp: "1 hour ago",
          replies: [],
        },
        {
          id: "1-2",
          author: { name: "Nick Garreis", avatar: imgNickGarreis },
          content:
            "Let's aim for WCAG AA at minimum. The current ratio is around 3.8:1 — needs to be 4.5:1.",
          timestamp: "45 min ago",
          replies: [],
        },
      ],
    },
    {
      id: "2",
      author: { name: "Mike Ross", avatar: imgNickGarreis },
      content:
        "The animation on the sidebar feels super smooth now. Great job!",
      timestamp: "4 hours ago",
      reactions: [
        { emoji: "❤️", users: ["Sarah Chen", "Nick Garreis"] },
        { emoji: "🎉", users: ["Sarah Chen"] },
      ],
      replies: [],
    },
    {
      id: "3",
      author: { name: "Sarah Chen", avatar: imgNickGarreis },
      content:
        "Updated the color tokens in the design system — please pull latest from Figma.",
      timestamp: "Yesterday",
      resolved: true,
      replies: [
        {
          id: "3-1",
          author: { name: "Nick Garreis", avatar: imgNickGarreis },
          content: "Done, everything synced.",
          timestamp: "Yesterday",
          replies: [],
        },
      ],
    },
  ],
};

// ── Reaction Picker (stable top-level component) ──────────────────
function ReactionPicker({
  commentId,
  isOpen,
  onToggleReaction,
}: {
  commentId: string;
  isOpen: boolean;
  onToggleReaction: (commentId: string, emoji: string) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.1 }}
          className="absolute left-0 bottom-full mb-1 bg-[#1E1F20] border border-white/10 rounded-lg shadow-xl shadow-black/40 flex items-center gap-0.5 p-1 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {REACTION_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => onToggleReaction(commentId, emoji)}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-[14px] cursor-pointer"
            >
              {emoji}
            </button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Comment Item (stable top-level component) ─────────────────────
interface CommentItemProps {
  comment: Comment;
  isReply?: boolean;
  isTopLevel?: boolean;
  mentionItems: MentionItemType[];
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  // State values passed down
  replyingTo: string | null;
  editingComment: string | null;
  editValue: string;
  activeReactionPicker: string | null;
  activeMoreMenu: string | null;
  collapsedThreads: Set<string>;
  // Callbacks
  onSetReplyingTo: (id: string | null) => void;
  onSetReplyValue: (val: string) => void;
  replyValue: string;
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

function CommentItem({
  comment,
  isReply = false,
  isTopLevel = false,
  mentionItems,
  onMentionClick,
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
  const isOwn = comment.author.name === CURRENT_USER;
  const isEditing = editingComment === comment.id;
  const isCollapsed = collapsedThreads.has(comment.id);
  const replyCount = comment.replies.length;
  const hasReplies = replyCount > 0;

  // Position state for the portaled more-menu
  const [menuPos, setMenuPos] = useState<{ top: number; left: number } | null>(
    null
  );

  // Shared props to pass recursively to nested CommentItems
  const sharedProps = {
    mentionItems,
    onMentionClick,
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
  };

  return (
    <div className={cn("group/comment relative")}>
      <div
        className={cn(
          "relative flex items-start gap-2.5 py-2.5 px-3 rounded-xl transition-colors duration-150",
          "hover:bg-white/[0.02]"
        )}
      >
        {/* Avatar */}
        <div className="shrink-0 pt-0.5">
          <div className="w-[26px] h-[26px] rounded-full overflow-hidden bg-[#222] ring-1 ring-white/[0.06]">
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-full h-full object-cover"
            />
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
                  const isActive = reaction.users.includes(CURRENT_USER);
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
                className="text-[11px] text-white/30 hover:text-white/60 flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded hover:bg-white/[0.04] cursor-pointer opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150"
              >
                <CornerDownRight className="w-3 h-3" />
                Reply
              </button>

              {/* Resolve (only top-level) */}
              {isTopLevel && (
                <button
                  onClick={() => onResolve(comment.id)}
                  className={cn(
                    "text-[11px] flex items-center gap-1 transition-colors px-1.5 py-0.5 rounded cursor-pointer opacity-0 group-hover/comment:opacity-100 transition-opacity duration-150",
                    comment.resolved
                      ? "text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/[0.06]"
                      : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"
                  )}
                >
                  {comment.resolved ? (
                    <CheckCheck className="w-3 h-3" />
                  ) : (
                    <Check className="w-3 h-3" />
                  )}
                  {comment.resolved ? "Resolved" : "Resolve"}
                </button>
              )}

              {/* More menu for own comments */}
              {isOwn && (
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
                      <img
                        src={imgNickGarreis}
                        alt="You"
                        className="w-full h-full object-cover"
                      />
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
                      {...sharedProps}
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
              {...sharedProps}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Chat Sidebar ──────────────────────────────────────────────────
interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: ProjectData;
  allProjects: Record<string, ProjectData>;
  onSwitchProject?: (view: string) => void;
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  allFiles?: Array<{ id: number | string; name: string; type: string }>;
}

export function ChatSidebar({
  isOpen,
  onClose,
  activeProject,
  allProjects,
  onSwitchProject,
  onMentionClick,
  allFiles,
}: ChatSidebarProps) {
  const [projectComments, setProjectComments] =
    useState<Record<string, Comment[]>>(PROJECT_COMMENTS);
  const [inputValue, setInputValue] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyValue, setReplyValue] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [collapsedThreads, setCollapsedThreads] = useState<Set<string>>(
    new Set()
  );
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [showResolvedThreads, setShowResolvedThreads] = useState(false);
  const [activeReactionPicker, setActiveReactionPicker] = useState<
    string | null
  >(null);
  const [activeMoreMenu, setActiveMoreMenu] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);

  const inputRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentComments = projectComments[activeProject.id] || [];
  const unresolvedComments = currentComments.filter((c) => !c.resolved);
  const resolvedComments = currentComments.filter((c) => c.resolved);

  const totalThreadCount = currentComments.length;
  const resolvedCount = resolvedComments.length;

  // Build mention items from active project data
  const mentionItems: MentionItemType[] = useMemo(() => {
    const items: MentionItemType[] = [];

    // Add tasks
    if (activeProject.tasks) {
      activeProject.tasks.forEach((task) => {
        items.push({
          type: "task",
          id: task.id,
          label: task.title,
          meta: task.completed ? "Done" : task.dueDate,
          completed: task.completed,
        });
      });
    }

    // Add files from all tabs (assets, contracts, attachments)
    if (allFiles) {
      allFiles.forEach((file) => {
        items.push({
          type: "file",
          id: String(file.id),
          label: file.name,
          meta: file.type,
        });
      });
    }

    // Add workspace members for @ mentions
    WORKSPACE_MEMBERS.forEach((member) => {
      items.push({
        type: "user",
        id: member.id,
        label: member.name,
        meta: member.role,
      });
    });

    return items;
  }, [activeProject.tasks, allFiles]);

  // Close menus on outside click
  useEffect(() => {
    if (activeReactionPicker || activeMoreMenu) {
      const handler = () => {
        setActiveReactionPicker(null);
        setActiveMoreMenu(null);
      };
      const timer = setTimeout(() => {
        document.addEventListener("click", handler);
      }, 0);
      return () => {
        clearTimeout(timer);
        document.removeEventListener("click", handler);
      };
    }
  }, [activeReactionPicker, activeMoreMenu]);

  const handleAddComment = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!inputValue.trim()) return;

      const newComment: Comment = {
        id: Date.now().toString(),
        author: { name: CURRENT_USER, avatar: imgNickGarreis },
        content: inputValue.trim(),
        timestamp: "Just now",
        replies: [],
        reactions: [],
      };

      setProjectComments((prev) => ({
        ...prev,
        [activeProject.id]: [
          newComment,
          ...(prev[activeProject.id] || []),
        ],
      }));
      setInputValue("");
      setTimeout(
        () => scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" }),
        100
      );
    },
    [inputValue, activeProject.id]
  );

  const handleReply = useCallback(
    (parentId: string, e?: React.FormEvent) => {
      e?.preventDefault();
      if (!replyValue.trim()) return;

      const newReply: Comment = {
        id: Date.now().toString(),
        author: { name: CURRENT_USER, avatar: imgNickGarreis },
        content: replyValue.trim(),
        timestamp: "Just now",
        replies: [],
      };

      const addReplyToComment = (commentsList: Comment[]): Comment[] => {
        return commentsList.map((comment) => {
          if (comment.id === parentId) {
            return { ...comment, replies: [...comment.replies, newReply] };
          }
          if (comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            };
          }
          return comment;
        });
      };

      setProjectComments((prev) => ({
        ...prev,
        [activeProject.id]: addReplyToComment(
          prev[activeProject.id] || []
        ),
      }));

      setCollapsedThreads((prev) => {
        const next = new Set(prev);
        next.delete(parentId);
        return next;
      });

      setReplyingTo(null);
      setReplyValue("");
    },
    [replyValue, activeProject.id]
  );

  const handleResolve = useCallback(
    (commentId: string) => {
      setProjectComments((prev) => ({
        ...prev,
        [activeProject.id]: (prev[activeProject.id] || []).map((c) =>
          c.id === commentId ? { ...c, resolved: !c.resolved } : c
        ),
      }));
    },
    [activeProject.id]
  );

  const handleEditComment = useCallback(
    (commentId: string) => {
      if (!editValue.trim()) return;

      const editInList = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.id === commentId) {
            return { ...c, content: editValue.trim(), edited: true };
          }
          return { ...c, replies: editInList(c.replies) };
        });

      setProjectComments((prev) => ({
        ...prev,
        [activeProject.id]: editInList(prev[activeProject.id] || []),
      }));
      setEditingComment(null);
      setEditValue("");
    },
    [editValue, activeProject.id]
  );

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      const deleteFromList = (list: Comment[]): Comment[] =>
        list
          .filter((c) => c.id !== commentId)
          .map((c) => ({ ...c, replies: deleteFromList(c.replies) }));

      setProjectComments((prev) => ({
        ...prev,
        [activeProject.id]: deleteFromList(prev[activeProject.id] || []),
      }));
    },
    [activeProject.id]
  );

  const handleToggleReaction = useCallback(
    (commentId: string, emoji: string) => {
      const toggleInList = (list: Comment[]): Comment[] =>
        list.map((c) => {
          if (c.id === commentId) {
            const reactions = (c.reactions || []).map((r) => ({
              ...r,
              users: [...r.users],
            }));
            const existing = reactions.find((r) => r.emoji === emoji);
            if (existing) {
              if (existing.users.includes(CURRENT_USER)) {
                existing.users = existing.users.filter(
                  (u) => u !== CURRENT_USER
                );
                if (existing.users.length === 0) {
                  return {
                    ...c,
                    reactions: reactions.filter((r) => r.emoji !== emoji),
                  };
                }
              } else {
                existing.users.push(CURRENT_USER);
              }
              return { ...c, reactions };
            } else {
              return {
                ...c,
                reactions: [
                  ...reactions,
                  { emoji, users: [CURRENT_USER] },
                ],
              };
            }
          }
          return { ...c, replies: toggleInList(c.replies) };
        });

      setProjectComments((prev) => ({
        ...prev,
        [activeProject.id]: toggleInList(prev[activeProject.id] || []),
      }));
      setActiveReactionPicker(null);
    },
    [activeProject.id]
  );

  const toggleThread = useCallback((id: string) => {
    setCollapsedThreads((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const sortedProjects = Object.values(allProjects).sort((a, b) => {
    if (a.archived === b.archived) return 0;
    return a.archived ? 1 : -1;
  });

  // Shared props object for CommentItem
  const sharedCommentProps = {
    mentionItems,
    onMentionClick,
    replyingTo,
    editingComment,
    editValue,
    activeReactionPicker,
    activeMoreMenu,
    collapsedThreads,
    onSetReplyingTo: setReplyingTo,
    onSetReplyValue: setReplyValue,
    replyValue,
    onSetEditingComment: setEditingComment,
    onSetEditValue: setEditValue,
    onSetActiveReactionPicker: setActiveReactionPicker,
    onSetActiveMoreMenu: setActiveMoreMenu,
    onReply: handleReply,
    onEditComment: handleEditComment,
    onDeleteComment: handleDeleteComment,
    onResolve: handleResolve,
    onToggleReaction: handleToggleReaction,
    onToggleThread: toggleThread,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
          className="absolute top-0 right-0 bottom-0 w-[420px] bg-[#191A1A] border-l border-white/[0.05] shadow-2xl z-50 flex flex-col overflow-hidden pointer-events-auto"
        >
          {/* ── Header ──────────────────────────────────── */}
          <div className="shrink-0 px-4 h-[57px] flex items-center border-b border-white/[0.05] bg-[#191A1A] relative z-20">
            <div className="flex items-center w-full pr-10">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 text-[#E8E8E8] text-[15px] hover:bg-white/[0.04] px-2 py-1.5 -ml-2 rounded-lg transition-colors group cursor-pointer"
                >
                  <div
                    className={cn(
                      "shrink-0",
                      activeProject.archived && "opacity-60"
                    )}
                  >
                    <ProjectLogo size={18} category={activeProject.category} />
                  </div>
                  <span className="group-hover:text-white transition-colors truncate max-w-[200px]">
                    {activeProject.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 opacity-40 transition-transform duration-200",
                      isDropdownOpen && "rotate-180"
                    )}
                  />
                </button>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -4, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -4, scale: 0.97 }}
                        transition={{ duration: 0.12 }}
                        className="absolute top-full left-0 mt-1 w-[220px] bg-[#1E1F20] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50"
                      >
                        <div className="max-h-[200px] overflow-y-auto py-1">
                          {sortedProjects.map((p) => (
                            <button
                              key={p.id}
                              onClick={() => {
                                if (onSwitchProject)
                                  onSwitchProject(`project:${p.id}`);
                                setIsDropdownOpen(false);
                              }}
                              className={cn(
                                "w-full text-left px-3 py-2 text-[13px] flex items-center gap-2.5 hover:bg-white/5 transition-colors group relative cursor-pointer",
                                activeProject.id === p.id
                                  ? "text-white bg-white/[0.04]"
                                  : "text-[#ada9a3]"
                              )}
                            >
                              <div
                                className={cn(
                                  "shrink-0",
                                  p.archived && "opacity-60"
                                )}
                              >
                                <ProjectLogo size={14} category={p.category} />
                              </div>
                              <span
                                className={cn(
                                  "truncate flex-1",
                                  activeProject.id !== p.id &&
                                    "group-hover:text-white transition-colors"
                                )}
                              >
                                {p.name}
                              </span>
                              {activeProject.id === p.id && (
                                <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              )}
                              {p.archived && (
                                <span className="text-[9px] text-white/25 uppercase tracking-wider shrink-0">
                                  Archived
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

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
                    <img
                      src={imgNickGarreis}
                      alt="Nick"
                      className="w-full h-full object-cover"
                    />
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
                              ? "bg-white/90 text-[#141515] hover:bg-white"
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
            className="flex-1 overflow-y-auto px-1.5 pb-8"
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
                    {unresolvedComments.map((comment) => (
                      <CommentItem
                        key={comment.id}
                        comment={comment}
                        isTopLevel
                        {...sharedCommentProps}
                      />
                    ))}
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
                            {resolvedComments.map((comment) => (
                              <CommentItem
                                key={comment.id}
                                comment={comment}
                                isTopLevel
                                {...sharedCommentProps}
                              />
                            ))}
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