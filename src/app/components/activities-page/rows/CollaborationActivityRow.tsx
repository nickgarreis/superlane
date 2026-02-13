import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { renderCommentContent } from "../../MentionTextarea";
import { parseMentionToken } from "../../mentions/mentionParser";
import type { MentionEntityType } from "../../mentions/types";
import type { MentionRenderOptions } from "../../mentions/renderCommentContent";
import { ActivityRowShell } from "../ActivityRowShell";
import { isImportantActivity } from "../activityImportance";
import { sanitizeMentionLabel, toMentionToken } from "../activityMentions";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  const projectLabel = activity.projectName?.trim() || "project";
  const actorLabel = activity.actorName?.trim() || "A teammate";
  const reactionMessage = activity.message?.trim() ?? "";
  const mentionLabel =
    activity.targetUserName?.trim()
    || activity.message?.trim()
    || "a teammate";
  switch (activity.action) {
    case "comment_added":
      return `${actorLabel} added a comment in ${projectLabel}`;
    case "comment_edited":
      return `Edited a comment in ${projectLabel}`;
    case "comment_deleted":
      return `Deleted a comment in ${projectLabel}`;
    case "mention_added":
      return `Mentioned ${mentionLabel} in a comment`;
    case "reaction_added":
      return reactionMessage
        ? `Added reaction ${reactionMessage} in ${projectLabel}`
        : `Added a reaction in ${projectLabel}`;
    case "reaction_removed":
      return reactionMessage
        ? `Removed reaction ${reactionMessage} in ${projectLabel}`
        : `Removed a reaction in ${projectLabel}`;
    default:
      return `${activity.action.replace(/_/g, " ")} in collaboration`;
  }
};

type CollaborationActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
  mentionMode?: "plain" | "inbox";
  onMentionClick?: (type: MentionEntityType, label: string) => void;
  mentionRenderOptions?: MentionRenderOptions;
};

export function CollaborationActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onDismiss,
  onClick,
  mentionMode = "plain",
  onMentionClick,
  mentionRenderOptions,
}: CollaborationActivityRowProps) {
  const projectLabel = activity.projectName?.trim() || "project";
  const actorLabel = activity.actorName?.trim() || "A teammate";
  const reactionMessage = activity.message?.trim() ?? "";
  const projectMention = toMentionToken("file", projectLabel) ?? projectLabel;
  const actorMention = toMentionToken("user", actorLabel) ?? actorLabel;
  const mentionLabel =
    activity.targetUserName?.trim()
    || activity.message?.trim()
    || "a teammate";
  const teammateMention = toMentionToken("user", mentionLabel) ?? mentionLabel;
  const mentionTitle = (() => {
    switch (activity.action) {
      case "comment_added":
        return `${actorMention} added a comment in ${projectMention}`;
      case "comment_edited":
        return `Edited a comment in ${projectMention}`;
      case "comment_deleted":
        return `Deleted a comment in ${projectMention}`;
      case "mention_added":
        return `Mentioned ${teammateMention} in a comment`;
      case "reaction_added":
        return reactionMessage
          ? `Added reaction ${reactionMessage} in ${projectMention}`
          : `Added a reaction in ${projectMention}`;
      case "reaction_removed":
        return reactionMessage
          ? `Removed reaction ${reactionMessage} in ${projectMention}`
          : `Removed a reaction in ${projectMention}`;
      default:
        return `${activity.action.replace(/_/g, " ")} in collaboration`;
    }
  })();
  const title = mentionMode === "inbox"
    ? renderCommentContent(mentionTitle, onMentionClick, mentionRenderOptions)
    : actionText(activity);

  const contextItems = buildContextItems([
    { label: "Member", value: activity.targetUserName ?? activity.message },
    { label: "Reaction", value: activity.action.startsWith("reaction_") ? activity.message : null },
  ]);
  const commentSnippet =
    activity.action === "comment_added" || activity.action === "comment_edited"
      ? activity.message?.trim() ?? null
      : null;
  const commentSnippetToken = commentSnippet ? parseMentionToken(commentSnippet) : null;
  const actorMentionLabel = sanitizeMentionLabel(actorLabel)?.toLowerCase() ?? null;
  const commentMentionLabel = commentSnippetToken?.type === "user"
    ? sanitizeMentionLabel(commentSnippetToken.label)?.toLowerCase() ?? null
    : null;
  const hideActorDuplicateSnippet =
    mentionMode === "inbox"
    && activity.action === "comment_added"
    && commentSnippetToken?.type === "user"
    && Boolean(actorMentionLabel)
    && actorMentionLabel === commentMentionLabel;
  const commentSnippetContent = commentSnippet
      ? hideActorDuplicateSnippet
      ? null
      : mentionMode === "inbox"
        ? renderCommentContent(commentSnippet, onMentionClick, mentionRenderOptions)
        : `"${commentSnippet}"`
    : null;

  return (
    <ActivityRowShell
      kind="collaboration"
      title={title}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onDismiss={onDismiss}
      onClick={onClick}
      isInboxLayout={mentionMode === "inbox"}
      isImportant={isImportantActivity(activity)}
      contextItems={contextItems}
    >
      {commentSnippetContent ? (
        <p className="txt-role-body-sm txt-tone-subtle">
          {commentSnippetContent}
        </p>
      ) : null}
    </ActivityRowShell>
  );
}
