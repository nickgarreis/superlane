import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  const targetName = activity.targetUserName ?? "member";
  switch (activity.action) {
    case "member_invited":
      return `Invited ${targetName}`;
    case "member_joined":
      return `${targetName} joined workspace`;
    case "member_removed":
      return `Removed ${targetName}`;
    case "member_role_changed":
      return `Changed ${targetName} role to ${activity.targetRole ?? activity.toValue ?? "member"}`;
    default:
      return `${activity.action} ${targetName}`;
  }
};

type MembershipActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onClick?: () => void;
};

export function MembershipActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onClick,
}: MembershipActivityRowProps) {
  const normalizedTargetName = activity.targetUserName?.trim() ?? "";
  const targetLabel = normalizedTargetName.length > 0 ? normalizedTargetName : "Member";
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
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      kindIcon={memberTypeIcon}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onClick={onClick}
      contextItems={contextItems}
    />
  );
}
