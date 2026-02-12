import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { renderCommentContent } from "../../MentionTextarea";
import type { MentionEntityType } from "../../mentions/types";
import { ActivityRowShell } from "../ActivityRowShell";
import { isImportantActivity } from "../activityImportance";
import { toMentionToken } from "../activityMentions";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  const projectLabel = activity.projectName?.trim() || "project";
  const reactionMessage = activity.message?.trim() ?? "";
  const mentionLabel =
    activity.targetUserName?.trim()
    || activity.message?.trim()
    || "a teammate";
  switch (activity.action) {
    case "comment_added":
      return `Added a comment in ${projectLabel}`;
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
};

export function CollaborationActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onDismiss,
  onClick,
  mentionMode = "plain",
  onMentionClick,
}: CollaborationActivityRowProps) {
  const projectLabel = activity.projectName?.trim() || "project";
  const reactionMessage = activity.message?.trim() ?? "";
  const projectMention = toMentionToken("file", projectLabel) ?? projectLabel;
  const mentionLabel =
    activity.targetUserName?.trim()
    || activity.message?.trim()
    || "a teammate";
  const teammateMention = toMentionToken("user", mentionLabel) ?? mentionLabel;
  const mentionTitle = (() => {
    switch (activity.action) {
      case "comment_added":
        return `Added a comment in ${projectMention}`;
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
    ? renderCommentContent(mentionTitle, onMentionClick)
    : actionText(activity);

  const contextItems = buildContextItems([
    { label: "Member", value: activity.targetUserName ?? activity.message },
    { label: "Reaction", value: activity.action.startsWith("reaction_") ? activity.message : null },
  ]);
  const commentSnippet =
    activity.action === "comment_added" || activity.action === "comment_edited"
      ? activity.message?.trim() ?? null
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
      isImportant={isImportantActivity(activity)}
      contextItems={contextItems}
    >
      {commentSnippet ? (
        <p className="txt-role-body-sm txt-tone-subtle">
          "{commentSnippet}"
        </p>
      ) : null}
    </ActivityRowShell>
  );
}
