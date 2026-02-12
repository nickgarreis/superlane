import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { formatActivityMeta } from "../activityFormatting";

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
  return (
    <ActivityRowShell
      kind="membership"
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onClick={onClick}
    />
  );
}
