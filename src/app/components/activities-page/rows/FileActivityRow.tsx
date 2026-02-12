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

export function FileActivityRow({ activity }: { activity: WorkspaceActivity }) {
  return (
    <ActivityRowShell
      kind="file"
      iconLabel="F"
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
    >
      {activity.fileTab ? (
        <p className="txt-role-body-sm txt-tone-subtle">{activity.fileTab}</p>
      ) : null}
    </ActivityRowShell>
  );
}
