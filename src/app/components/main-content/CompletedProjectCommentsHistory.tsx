import React, { useMemo } from "react";
import { cn } from "../../../lib/utils";
import { renderCommentContent } from "../mentions/renderCommentContent";
import type { MentionEntityType } from "../mentions/types";
import { buildMentionUserAvatarLookup } from "../mentions/userAvatarLookup";
import type { WorkspaceMember } from "../../types";

export type CompletedCommentHistoryItem = {
  id: string;
  parentCommentId: string | null;
  author: { userId: string; name: string; avatar: string };
  content: string;
  createdAtEpochMs: number;
  resolved: boolean;
  edited: boolean;
  reactions: Array<{ emoji: string; users: string[]; userIds: string[] }>;
  replies: CompletedCommentHistoryItem[];
};

type CompletedProjectCommentsHistoryProps = {
  comments: CompletedCommentHistoryItem[];
  loading: boolean;
  workspaceMembers: WorkspaceMember[];
  onMentionClick?: (type: MentionEntityType, label: string) => void;
};

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

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

function CommentNode({
  comment,
  depth,
  onMentionClick,
  userAvatarByLabel,
}: {
  comment: CompletedCommentHistoryItem;
  depth: number;
  onMentionClick?: (type: MentionEntityType, label: string) => void;
  userAvatarByLabel: ReturnType<typeof buildMentionUserAvatarLookup>;
}) {
  return (
    <div
      className={cn(
        "rounded-xl px-3 py-2.5",
        depth === 0
          ? "bg-surface-muted-soft/60"
          : "ml-8 border-l border-border-subtle-soft pl-4",
      )}
    >
      <div className="flex items-start gap-2.5">
        <div className="shrink-0 pt-0.5">
          <div className="w-[24px] h-[24px] rounded-full overflow-hidden bg-bg-avatar-fallback ring-1 ring-border-soft">
            {comment.author.avatar ? (
              <img
                src={comment.author.avatar}
                alt={comment.author.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-surface-active-soft flex items-center justify-center txt-role-kbd font-medium txt-tone-primary">
                {getInitials(comment.author.name)}
              </div>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="txt-role-body-md txt-tone-primary">
              {comment.author.name}
            </span>
            <span className="txt-role-meta text-text-muted-weak">
              {formatRelativeCommentTime(comment.createdAtEpochMs)}
            </span>
            {comment.resolved && (
              <span className="inline-flex h-[18px] items-center rounded-full border border-border-soft bg-surface-muted-soft px-1.5 txt-role-kbd [color:var(--text-muted-medium)]">
                Resolved
              </span>
            )}
            {comment.edited && (
              <span className="txt-role-kbd text-text-muted-weak italic">
                Edited
              </span>
            )}
          </div>
          <div className="txt-role-body-md txt-tone-muted whitespace-pre-wrap break-words">
            {renderCommentContent(comment.content, onMentionClick, {
              userAvatarByLabel,
            })}
          </div>
          {comment.reactions.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {comment.reactions.map((reaction) => (
                <span
                  key={`${comment.id}-${reaction.emoji}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border-soft bg-surface-muted-soft px-2 py-0.5 txt-role-kbd [color:var(--text-muted-medium)]"
                  aria-label={`${reaction.emoji} ${reaction.userIds.length}`}
                >
                  <span>{reaction.emoji}</span>
                  <span>{reaction.userIds.length}</span>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {comment.replies.length > 0 && (
        <div className="mt-2.5 space-y-2.5">
          {comment.replies.map((reply) => (
            <CommentNode
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              onMentionClick={onMentionClick}
              userAvatarByLabel={userAvatarByLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CompletedProjectCommentsHistory({
  comments,
  loading,
  workspaceMembers,
  onMentionClick,
}: CompletedProjectCommentsHistoryProps) {
  const userAvatarByLabel = useMemo(
    () =>
      buildMentionUserAvatarLookup(
        workspaceMembers.map((member) => ({
          label: member.name,
          avatarUrl: member.avatarUrl ?? null,
        })),
      ),
    [workspaceMembers],
  );

  return (
    <section className="pt-[45px]">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <h2 className="txt-role-body-md font-medium txt-tone-subtle uppercase tracking-wider">
            Comments history
          </h2>
        </div>
        {!loading && (
          <span className="txt-role-body-sm text-text-muted-weak">
            {comments.length} thread{comments.length === 1 ? "" : "s"}
          </span>
        )}
      </div>
      {loading ? (
        <div className="space-y-2.5">
          <div className="h-[72px] rounded-xl bg-surface-muted-soft animate-pulse" />
          <div className="h-[72px] rounded-xl bg-surface-muted-soft animate-pulse" />
        </div>
      ) : comments.length === 0 ? (
        <div className="rounded-xl px-4 py-6 text-center">
          <p className="txt-role-body-md text-white/20 italic">
            No comment history for this project yet
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {comments.map((comment) => (
            <CommentNode
              key={comment.id}
              comment={comment}
              depth={0}
              onMentionClick={onMentionClick}
              userAvatarByLabel={userAvatarByLabel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
