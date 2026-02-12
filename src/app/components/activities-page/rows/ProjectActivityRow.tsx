import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  switch (activity.action) {
    case "created":
      return `Created project ${activity.projectName ?? ""}`.trim();
    case "renamed":
      return `Renamed project from "${activity.fromValue ?? ""}" to "${activity.toValue ?? ""}"`;
    case "archived":
      return `Archived project ${activity.projectName ?? ""}`.trim();
    case "restored":
      return `Restored project ${activity.projectName ?? ""}`.trim();
    case "deleted":
      return `Deleted project ${activity.projectName ?? ""}`.trim();
    default:
      return `${activity.action} on project ${activity.projectName ?? ""}`.trim();
  }
};

type ProjectActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onClick?: () => void;
};

export function ProjectActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onClick,
}: ProjectActivityRowProps) {
  return (
    <ActivityRowShell
      kind="project"
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
