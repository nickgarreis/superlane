import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  switch (activity.action) {
    case "comment_added":
      return `Added comment in ${activity.projectName ?? "project"}`;
    case "comment_edited":
      return `Edited comment in ${activity.projectName ?? "project"}`;
    case "comment_deleted":
      return `Deleted comment in ${activity.projectName ?? "project"}`;
    case "mention_added":
      return `Mentioned ${activity.targetUserName ?? "a teammate"} in a comment`;
    case "reaction_added":
      return `Added reaction ${activity.message ?? ""}`.trim();
    case "reaction_removed":
      return `Removed reaction ${activity.message ?? ""}`.trim();
    default:
      return `${activity.action} in collaboration`;
  }
};

export function CollaborationActivityRow({
  activity,
}: {
  activity: WorkspaceActivity;
}) {
  return (
    <ActivityRowShell
      kind="collaboration"
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
    />
  );
}
