import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ProjectLogo } from "../../ProjectLogo";
import { renderCommentContent } from "../../MentionTextarea";
import type { MentionEntityType } from "../../mentions/types";
import { ActivityRowShell } from "../ActivityRowShell";
import { isImportantActivity } from "../activityImportance";
import { toMentionToken } from "../activityMentions";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const normalizeLabel = (value: string | null | undefined, fallback: string) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
};

const actionText = (activity: WorkspaceActivity) => {
  const projectLabel = normalizeLabel(
    activity.projectName ?? activity.toValue,
    "project",
  );
  switch (activity.action) {
    case "created":
      return `Created project ${projectLabel}`;
    case "renamed":
      return `Renamed project to ${normalizeLabel(activity.toValue, projectLabel)}`;
    case "archived":
      return `Archived project ${projectLabel}`;
    case "restored":
      return `Restored project ${projectLabel}`;
    case "deleted":
      return `Deleted project ${projectLabel}`;
    default:
      return `${activity.action.replace(/_/g, " ")} on project ${projectLabel}`;
  }
};

type ProjectActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
  mentionMode?: "plain" | "inbox";
  onMentionClick?: (type: MentionEntityType, label: string) => void;
};

export function ProjectActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onDismiss,
  onClick,
  mentionMode = "plain",
  onMentionClick,
}: ProjectActivityRowProps) {
  const projectLabel = normalizeLabel(
    activity.projectName ?? activity.toValue,
    "project",
  );
  const projectMention =
    toMentionToken("file", projectLabel) ?? projectLabel;
  const nextProjectMention =
    toMentionToken("file", normalizeLabel(activity.toValue, projectLabel))
    ?? normalizeLabel(activity.toValue, projectLabel);
  const mentionTitle = (() => {
    switch (activity.action) {
      case "created":
        return `Created project ${projectMention}`;
      case "renamed":
        return `Renamed project to ${nextProjectMention}`;
      case "archived":
        return `Archived project ${projectMention}`;
      case "restored":
        return `Restored project ${projectMention}`;
      case "deleted":
        return `Deleted project ${projectMention}`;
      default:
        return `${activity.action.replace(/_/g, " ")} on project ${projectMention}`;
    }
  })();
  const title = mentionMode === "inbox"
    ? renderCommentContent(mentionTitle, onMentionClick)
    : actionText(activity);

  const contextItems = buildContextItems([
    { label: "From", value: activity.action === "renamed" ? activity.fromValue : null },
    { label: "To", value: activity.action === "renamed" ? activity.toValue : null },
    { label: "Status", value: activity.action === "created" ? activity.toValue : null },
  ]);

  return (
    <ActivityRowShell
      kind="project"
      title={title}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      kindIcon={<ProjectLogo size={18} category={activity.projectCategory ?? undefined} />}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onDismiss={onDismiss}
      onClick={onClick}
      isImportant={isImportantActivity(activity)}
      contextItems={contextItems}
    />
  );
}
