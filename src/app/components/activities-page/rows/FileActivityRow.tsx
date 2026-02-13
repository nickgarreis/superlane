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
  const fileName = activity.fileName?.trim() || "file";
  switch (activity.action) {
    case "uploaded":
      return `Uploaded file ${fileName}`;
    case "deleted":
      return `Deleted file ${fileName}`;
    case "uploaded_with_conflict":
      return `Uploaded file ${fileName} (name conflict)`;
    case "replaced":
      return `Replaced file ${fileName}`;
    case "upload_failed":
      return `Upload failed for file ${fileName}`;
    default:
      return `${activity.action.replace(/_/g, " ")} file ${fileName}`;
  }
};

type FileActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
  mentionMode?: "plain" | "inbox";
  onMentionClick?: (type: MentionEntityType, label: string) => void;
  mentionRenderOptions?: MentionRenderOptions;
};

export function FileActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onDismiss,
  onClick,
  mentionMode = "plain",
  onMentionClick,
  mentionRenderOptions,
}: FileActivityRowProps) {
  const fileLabel = activity.fileName?.trim() || "file";
  const fileMention = toMentionToken("file", fileLabel) ?? fileLabel;
  const mentionTitle = (() => {
    switch (activity.action) {
      case "uploaded":
        return `Uploaded file ${fileMention}`;
      case "deleted":
        return `Deleted file ${fileMention}`;
      case "uploaded_with_conflict":
        return `Uploaded file ${fileMention} (name conflict)`;
      case "replaced":
        return `Replaced file ${fileMention}`;
      case "upload_failed":
        return `Upload failed for file ${fileMention}`;
      default:
        return `${activity.action.replace(/_/g, " ")} file ${fileMention}`;
    }
  })();
  const title = mentionMode === "inbox"
    ? renderCommentContent(mentionTitle, onMentionClick, mentionRenderOptions)
    : actionText(activity);

  const contextItems = buildContextItems([
    { label: "File", value: activity.fileName },
    { label: "Tab", value: activity.fileTab },
    { label: "Error", value: activity.action === "upload_failed" ? activity.errorCode : null },
  ]);

  return (
    <ActivityRowShell
      kind="file"
      title={title}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onDismiss={onDismiss}
      onClick={onClick}
      isInboxLayout={mentionMode === "inbox"}
      isImportant={isImportantActivity(activity)}
      contextItems={contextItems}
    >
      {activity.fileTab ? (
        <p className="txt-role-body-sm txt-tone-subtle">
          Uploaded in the {activity.fileTab} tab
        </p>
      ) : null}
    </ActivityRowShell>
  );
}
