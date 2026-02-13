import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { renderCommentContent } from "../../MentionTextarea";
import type { MentionEntityType } from "../../mentions/types";
import type { MentionRenderOptions } from "../../mentions/renderCommentContent";
import { ActivityRowShell } from "../ActivityRowShell";
import { isImportantActivity } from "../activityImportance";
import { toMentionToken } from "../activityMentions";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  const targetName = activity.targetUserName?.trim() || "Member";
  switch (activity.action) {
    case "member_invited":
      return `Invited ${targetName}`;
    case "member_joined":
      return `${targetName} joined the workspace`;
    case "member_removed":
      return `Removed ${targetName}`;
    case "member_role_changed":
      return `Changed ${targetName} role to ${activity.targetRole ?? activity.toValue ?? "member"}`;
    default:
      return `${activity.action.replace(/_/g, " ")} ${targetName}`;
  }
};

type MembershipActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
  mentionMode?: "plain" | "inbox";
  onMentionClick?: (type: MentionEntityType, label: string) => void;
  mentionRenderOptions?: MentionRenderOptions;
};

export function MembershipActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onDismiss,
  onClick,
  mentionMode = "plain",
  onMentionClick,
  mentionRenderOptions,
}: MembershipActivityRowProps) {
  const normalizedTargetName = activity.targetUserName?.trim() ?? "";
  const targetLabel = normalizedTargetName.length > 0 ? normalizedTargetName : "Member";
  const targetMention = toMentionToken("user", targetLabel) ?? targetLabel;
  const mentionTitle = (() => {
    switch (activity.action) {
      case "member_invited":
        return `Invited ${targetMention}`;
      case "member_joined":
        return `${targetMention} joined the workspace`;
      case "member_removed":
        return `Removed ${targetMention}`;
      case "member_role_changed":
        return `Changed ${targetMention} role to ${activity.targetRole ?? activity.toValue ?? "member"}`;
      default:
        return `${activity.action.replace(/_/g, " ")} ${targetMention}`;
    }
  })();
  const title = mentionMode === "inbox"
    ? renderCommentContent(mentionTitle, onMentionClick, mentionRenderOptions)
    : actionText(activity);

  const fallbackInitial = targetLabel[0]?.toUpperCase() ?? "M";
  const memberTypeIcon = activity.targetUserAvatarUrl ? (
    <img
      src={activity.targetUserAvatarUrl}
      alt={`${targetLabel} profile image`}
      className="h-7 w-7 rounded-full object-cover"
    />
  ) : (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border-soft bg-bg-muted-surface txt-role-body-sm txt-tone-muted">
      {fallbackInitial}
    </span>
  );
  const contextItems = buildContextItems([
    { label: "Member", value: activity.targetUserName },
    { label: "Role", value: activity.targetRole ?? activity.toValue },
    { label: "From", value: activity.action === "member_role_changed" ? activity.fromValue : null },
    { label: "To", value: activity.action === "member_role_changed" ? activity.toValue : null },
  ]);

  return (
    <ActivityRowShell
      kind="membership"
      title={title}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      kindIcon={memberTypeIcon}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onDismiss={onDismiss}
      onClick={onClick}
      isInboxLayout={mentionMode === "inbox"}
      isImportant={isImportantActivity(activity)}
      contextItems={contextItems}
    />
  );
}
