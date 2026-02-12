import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { ActivityRowShell } from "../ActivityRowShell";
import {
  buildContextItems,
  formatActivityMessage,
  formatActivityMeta,
  type ActivityContextItem,
} from "../activityFormatting";

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

const normalizeOrganizationSyncItems = (items: ActivityContextItem[]) => {
  const valueByLabel = new Map(
    items.map((item) => [item.label.toLowerCase(), item.value]),
  );
  return buildContextItems([
    {
      label: "Imported",
      value: valueByLabel.get("imported memberships") ?? null,
    },
    {
      label: "Synced",
      value: valueByLabel.get("synced workspace members") ?? null,
    },
    {
      label: "Removed",
      value: valueByLabel.get("removed memberships") ?? null,
    },
  ]);
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
  const formattedMessage = formatActivityMessage(activity.message);
  const messageContextItems =
    activity.action === "organization_membership_sync"
      ? normalizeOrganizationSyncItems(formattedMessage.structuredItems)
      : formattedMessage.structuredItems;
  const contextItems = buildContextItems([
    {
      label: "From",
      value: activity.action === "workspace_general_updated" ? activity.fromValue : null,
    },
    {
      label: "To",
      value: activity.action === "workspace_general_updated" ? activity.toValue : null,
    },
    {
      label: "Asset",
      value:
        activity.action === "brand_asset_uploaded" || activity.action === "brand_asset_removed"
          ? activity.fileName
          : null,
    },
    ...messageContextItems.map((item) => ({
      label: item.label,
      value: item.value,
    })),
  ]);

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
      contextItems={contextItems}
    >
      {formattedMessage.plainText ? (
        <p className="txt-role-body-sm txt-tone-subtle [overflow-wrap:anywhere]">
          {formattedMessage.plainText}
        </p>
      ) : null}
    </ActivityRowShell>
  );
}
