import type { CollaborationComment, WorkspaceMember } from "../../types";

export type CommentFeedRow = {
  id: string;
  author: { userId: string; name: string; avatar: string };
  content: string;
  createdAtEpochMs: number;
  resolved: boolean;
  edited: boolean;
  replyCount: number;
  reactions: Array<{ emoji: string; users: string[]; userIds: string[] }>;
};

export const formatRoleLabel = (role: WorkspaceMember["role"]) =>
  role.charAt(0).toUpperCase() + role.slice(1);

const formatRelativeCommentTime = (timestampEpochMs: number) => {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestampEpochMs) / 1000));
  if (diffSeconds < 60) return "Just now";

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return new Date(timestampEpochMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const mapFeedCommentToUi = (
  comment: CommentFeedRow,
  replies: CollaborationComment[],
): CollaborationComment => ({
  id: String(comment.id),
  author: comment.author,
  content: comment.content,
  timestampEpochMs: comment.createdAtEpochMs,
  timestamp: formatRelativeCommentTime(comment.createdAtEpochMs),
  replyCount: comment.replyCount,
  replies,
  resolved: comment.resolved,
  edited: comment.edited,
  reactions: comment.reactions,
});
