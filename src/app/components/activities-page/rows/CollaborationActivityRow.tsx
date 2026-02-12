import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  switch (activity.action) {
    case "comment_added":
      return `Added comment in ${activity.projectName ?? "project"}`;
    case "comment_edited":
      return `Edited comment in ${activity.projectName ?? "project"}`;
    case "comment_deleted":
      return `Deleted comment in ${activity.projectName ?? "project"}`;
    case "mention_added":
      return `Mentioned ${activity.targetUserName ?? activity.message ?? "a teammate"} in a comment`;
    case "reaction_added":
      return `Added reaction ${activity.message ?? ""}`.trim();
    case "reaction_removed":
      return `Removed reaction ${activity.message ?? ""}`.trim();
    default:
      return `${activity.action} in collaboration`;
  }
};

type CollaborationActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onClick?: () => void;
};

export function CollaborationActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onClick,
}: CollaborationActivityRowProps) {
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
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onClick={onClick}
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
