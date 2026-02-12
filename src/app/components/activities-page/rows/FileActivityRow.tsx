import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { formatActivityMeta } from "../activityFormatting";

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
    >
      {activity.fileTab ? (
        <p className="txt-role-body-sm txt-tone-subtle">{activity.fileTab}</p>
      ) : null}
    </ActivityRowShell>
  );
}
