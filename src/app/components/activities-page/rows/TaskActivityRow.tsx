import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  switch (activity.action) {
    case "created":
      return `Created task ${activity.taskTitle ?? ""}`.trim();
    case "completed":
      return `Completed task ${activity.taskTitle ?? ""}`.trim();
    case "reopened":
      return `Reopened task ${activity.taskTitle ?? ""}`.trim();
    case "deleted":
      return `Deleted task ${activity.taskTitle ?? ""}`.trim();
    case "assignee_changed":
      return `Changed assignee to ${activity.targetUserName ?? activity.toValue ?? "unassigned"}`;
    case "due_date_changed":
      return `Changed due date from ${activity.fromValue ?? "none"} to ${activity.toValue ?? "none"}`;
    case "moved_project":
      return `Moved task to project ${activity.projectName ?? ""}`.trim();
    default:
      return `${activity.action} task ${activity.taskTitle ?? ""}`.trim();
  }
};

export function TaskActivityRow({ activity }: { activity: WorkspaceActivity }) {
  return (
    <ActivityRowShell
      kind="task"
      iconLabel="T"
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
    />
  );
}
