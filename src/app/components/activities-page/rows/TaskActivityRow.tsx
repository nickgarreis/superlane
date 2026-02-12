import React from "react";
import { cn } from "../../../../lib/utils";
import { formatTaskDueDate } from "../../../lib/dates";
import type { WorkspaceActivity } from "../../../types";
import { renderCommentContent } from "../../MentionTextarea";
import type { MentionEntityType } from "../../mentions/types";
import { ActivityRowShell } from "../ActivityRowShell";
import { isImportantActivity } from "../activityImportance";
import { toMentionToken } from "../activityMentions";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const MS_IN_DAY = 24 * 60 * 60 * 1000;

const getTaskTitle = (activity: WorkspaceActivity) => {
  const taskTitle = activity.taskTitle?.trim();
  return taskTitle && taskTitle.length > 0 ? taskTitle : "Untitled task";
};

const parseEpochMs = (value: string | null) => {
  if (!value) {
    return null;
  }
  const epochMs = Number(value);
  return Number.isFinite(epochMs) ? epochMs : null;
};

const toLocalDateStartEpochMs = (epochMs: number) => {
  const date = new Date(epochMs);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
};

const getUrgencyBadge = (dueDateEpochMs: number | null) => {
  if (dueDateEpochMs == null) {
    return {
      label: "No due date",
      toneClass: "txt-tone-faint",
    };
  }

  const todayEpochMs = toLocalDateStartEpochMs(Date.now());
  const dueDateStartEpochMs = toLocalDateStartEpochMs(dueDateEpochMs);
  const deltaDays = Math.round((dueDateStartEpochMs - todayEpochMs) / MS_IN_DAY);

  if (deltaDays < 0) {
    return {
      label: `Overdue by ${Math.abs(deltaDays)}d`,
      toneClass: "txt-tone-danger",
    };
  }
  if (deltaDays === 0) {
    return {
      label: "Due today",
      toneClass: "txt-tone-warning",
    };
  }
  if (deltaDays === 1) {
    return {
      label: "Due tomorrow",
      toneClass: "txt-tone-accent",
    };
  }
  if (deltaDays <= 7) {
    return {
      label: `Due in ${deltaDays}d`,
      toneClass: "txt-tone-accent",
    };
  }
  return {
    label: "Scheduled",
    toneClass: "txt-tone-muted",
  };
};

const getDueDateShiftSummary = (
  fromDueDateEpochMs: number | null,
  toDueDateEpochMs: number | null,
) => {
  if (fromDueDateEpochMs == null && toDueDateEpochMs == null) {
    return "Due date remains unset";
  }
  if (fromDueDateEpochMs == null && toDueDateEpochMs != null) {
    return "Added a due date";
  }
  if (fromDueDateEpochMs != null && toDueDateEpochMs == null) {
    return "Removed the due date";
  }

  const fromDueDateStartEpochMs = toLocalDateStartEpochMs(fromDueDateEpochMs as number);
  const toDueDateStartEpochMs = toLocalDateStartEpochMs(toDueDateEpochMs as number);
  const shiftDays = Math.round(
    (toDueDateStartEpochMs - fromDueDateStartEpochMs) / MS_IN_DAY,
  );
  if (shiftDays > 0) {
    return `Moved ${shiftDays} day${shiftDays === 1 ? "" : "s"} later`;
  }
  if (shiftDays < 0) {
    const absoluteShiftDays = Math.abs(shiftDays);
    return `Moved ${absoluteShiftDays} day${absoluteShiftDays === 1 ? "" : "s"} earlier`;
  }
  return "Updated within the same date";
};

const actionText = (activity: WorkspaceActivity) => {
  const taskTitle = getTaskTitle(activity);
  switch (activity.action) {
    case "created":
      return `Created task ${taskTitle}`;
    case "completed":
      return `Completed task ${taskTitle}`;
    case "reopened":
      return `Reopened task ${taskTitle}`;
    case "deleted":
      return `Deleted task ${taskTitle}`;
    case "assignee_changed":
      return `Updated assignee on ${taskTitle}`;
    case "due_date_changed":
      return `Updated due date for ${taskTitle}`;
    case "moved_project":
      return `Moved ${taskTitle} to ${activity.projectName ?? "another project"}`;
    default:
      return `${activity.action.replace(/_/g, " ")} task ${taskTitle}`;
  }
};

type TaskActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
  mentionMode?: "plain" | "inbox";
  onMentionClick?: (type: MentionEntityType, label: string) => void;
};

export function TaskActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onDismiss,
  onClick,
  mentionMode = "plain",
  onMentionClick,
}: TaskActivityRowProps) {
  const taskTitle = getTaskTitle(activity);
  const taskMention = toMentionToken("task", taskTitle) ?? taskTitle;
  const assigneeLabel =
    activity.targetUserName?.trim()
    || activity.toValue?.trim()
    || "Unassigned";
  const assigneeMention = toMentionToken("user", assigneeLabel) ?? assigneeLabel;
  const projectLabel = activity.projectName?.trim() || "another project";
  const projectMention = toMentionToken("file", projectLabel) ?? projectLabel;
  const mentionTitle = (() => {
    switch (activity.action) {
      case "created":
        return `Created task ${taskMention}`;
      case "completed":
        return `Completed task ${taskMention}`;
      case "reopened":
        return `Reopened task ${taskMention}`;
      case "deleted":
        return `Deleted task ${taskMention}`;
      case "assignee_changed":
        return `Updated assignee on ${taskMention} to ${assigneeMention}`;
      case "due_date_changed":
        return `Updated due date for ${taskMention}`;
      case "moved_project":
        return `Moved ${taskMention} to ${projectMention}`;
      default:
        return `${activity.action.replace(/_/g, " ")} task ${taskMention}`;
    }
  })();
  const title = mentionMode === "inbox"
    ? renderCommentContent(mentionTitle, onMentionClick)
    : actionText(activity);

  const previousDueDateEpochMs = parseEpochMs(activity.fromValue);
  const nextDueDateEpochMs = parseEpochMs(activity.toValue);
  const urgencyBadge = getUrgencyBadge(nextDueDateEpochMs);
  const previousDueDateLabel = formatTaskDueDate(previousDueDateEpochMs);
  const nextDueDateLabel = formatTaskDueDate(nextDueDateEpochMs);
  const assigneeFrom = activity.fromValue?.trim() || "Unassigned";
  const assigneeTo = assigneeLabel;
  const contextItems = buildContextItems([
    { label: "Task", value: taskTitle },
    { label: "Assignee", value: activity.action === "assignee_changed" ? assigneeTo : null },
    { label: "Due", value: activity.action === "due_date_changed" ? nextDueDateLabel : null },
  ]);

  return (
    <ActivityRowShell
      kind="task"
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
      {activity.action === "due_date_changed" ? (
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 txt-role-body-sm txt-tone-subtle">
          <span className="txt-tone-faint">From</span>
          <span className="txt-tone-muted">{previousDueDateLabel}</span>
          <span className="txt-tone-faint">To</span>
          <span className="txt-tone-primary">{nextDueDateLabel}</span>
          <span className="txt-tone-faint">•</span>
          <span>{getDueDateShiftSummary(previousDueDateEpochMs, nextDueDateEpochMs)}</span>
          <span className="txt-tone-faint">•</span>
          <span className={cn("txt-role-kbd uppercase tracking-wide", urgencyBadge.toneClass)}>
            {urgencyBadge.label}
          </span>
        </div>
      ) : null}

      {activity.action === "assignee_changed" ? (
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 txt-role-body-sm txt-tone-subtle">
          <span className="txt-tone-faint">Assignee</span>
          <span className="txt-tone-muted">{assigneeFrom}</span>
          <span className="txt-tone-faint">to</span>
          <span className="txt-tone-primary">{assigneeTo}</span>
          <span className="txt-tone-faint">•</span>
          <span className="txt-tone-muted">{taskTitle}</span>
        </p>
      ) : null}
    </ActivityRowShell>
  );
}
