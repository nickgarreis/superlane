import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ProjectLogo } from "../../ProjectLogo";
import { ActivityRowShell } from "../ActivityRowShell";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

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
  const contextItems = buildContextItems([
    { label: "From", value: activity.action === "renamed" ? activity.fromValue : null },
    { label: "To", value: activity.action === "renamed" ? activity.toValue : null },
    { label: "Status", value: activity.action === "created" ? activity.toValue : null },
  ]);

  return (
    <ActivityRowShell
      kind="project"
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      kindIcon={<ProjectLogo size={18} category={activity.projectCategory ?? undefined} />}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onClick={onClick}
      contextItems={contextItems}
    />
  );
}
