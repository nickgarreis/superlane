import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { buildContextItems, formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  const fileName = activity.fileName ?? "file";
  switch (activity.action) {
    case "uploaded":
      return `Uploaded ${fileName}`;
    case "deleted":
      return `Deleted ${fileName}`;
    case "uploaded_with_conflict":
      return `Uploaded ${fileName} (name conflict)`;
    case "replaced":
      return `Replaced ${fileName}`;
    case "upload_failed":
      return `Upload failed for ${fileName}`;
    default:
      return `${activity.action} ${fileName}`;
  }
};

type FileActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onClick?: () => void;
};

export function FileActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onClick,
}: FileActivityRowProps) {
  const contextItems = buildContextItems([
    { label: "File", value: activity.fileName },
    { label: "Tab", value: activity.fileTab },
    { label: "Error", value: activity.action === "upload_failed" ? activity.errorCode : null },
  ]);

  return (
    <ActivityRowShell
      kind="file"
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
      {activity.fileTab ? (
        <p className="txt-role-body-sm txt-tone-subtle">
          Uploaded in the {activity.fileTab} tab
        </p>
      ) : null}
    </ActivityRowShell>
  );
}
