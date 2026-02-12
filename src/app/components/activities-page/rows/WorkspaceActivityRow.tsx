import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import { formatActivityMeta } from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  switch (activity.action) {
    case "workspace_general_updated":
      return "Updated workspace settings";
    case "workspace_logo_updated":
      return "Updated workspace logo";
    case "workspace_logo_removed":
      return "Removed workspace logo";
    case "brand_asset_uploaded":
      return `Uploaded brand asset ${activity.fileName ?? ""}`.trim();
    case "brand_asset_removed":
      return `Removed brand asset ${activity.fileName ?? ""}`.trim();
    case "organization_membership_sync":
      return "Synced organization membership";
    default:
      return activity.action;
  }
};

type WorkspaceActivityRowProps = {
  activity: WorkspaceActivity;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onClick?: () => void;
};

export function WorkspaceActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onClick,
}: WorkspaceActivityRowProps) {
  const kind = activity.kind === "organization" ? "organization" : "workspace";
  return (
    <ActivityRowShell
      kind={kind}
      title={actionText(activity)}
      meta={formatActivityMeta(activity)}
      actorName={activity.actorName}
      actorAvatarUrl={activity.actorAvatarUrl}
      isRead={activity.isRead}
      showReadState={showReadState}
      onMarkRead={onMarkRead}
      onClick={onClick}
    >
      {activity.message ? (
        <p className="txt-role-body-sm txt-tone-subtle">{activity.message}</p>
      ) : null}
    </ActivityRowShell>
  );
}
