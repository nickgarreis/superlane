import React from "react";
import type { WorkspaceActivity } from "../../../types";
import { renderCommentContent } from "../../MentionTextarea";
import type { MentionEntityType } from "../../mentions/types";
import { ActivityRowShell } from "../ActivityRowShell";
import { isImportantActivity } from "../activityImportance";
import { toMentionToken } from "../activityMentions";
import {
  buildContextItems,
  formatActivityMessage,
  formatActivityMeta,
  type ActivityContextItem,
} from "../activityFormatting";

const actionText = (activity: WorkspaceActivity) => {
  const assetLabel = activity.fileName?.trim() || "asset";
  switch (activity.action) {
    case "workspace_general_updated":
      return "Updated workspace settings";
    case "workspace_logo_updated":
      return "Updated workspace logo";
    case "workspace_logo_removed":
      return "Removed workspace logo";
    case "brand_asset_uploaded":
      return `Uploaded brand asset ${assetLabel}`;
    case "brand_asset_removed":
      return `Removed brand asset ${assetLabel}`;
    case "organization_membership_sync":
      return "Synced organization members";
    default:
      return activity.action.replace(/_/g, " ");
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
  onDismiss?: () => void;
  onClick?: () => void;
  mentionMode?: "plain" | "inbox";
  onMentionClick?: (type: MentionEntityType, label: string) => void;
};

export function WorkspaceActivityRow({
  activity,
  showReadState,
  onMarkRead,
  onDismiss,
  onClick,
  mentionMode = "plain",
  onMentionClick,
}: WorkspaceActivityRowProps) {
  const kind = activity.kind === "organization" ? "organization" : "workspace";
  const assetLabel = activity.fileName?.trim() || "asset";
  const assetMention = toMentionToken("file", assetLabel) ?? assetLabel;
  const workspaceSettingsMention =
    toMentionToken("file", "workspace settings") ?? "workspace settings";
  const workspaceLogoMention =
    toMentionToken("file", "workspace logo") ?? "workspace logo";
  const organizationMembersMention =
    toMentionToken("file", "organization members") ?? "organization members";
  const mentionTitle = (() => {
    switch (activity.action) {
      case "workspace_general_updated":
        return `Updated ${workspaceSettingsMention}`;
      case "workspace_logo_updated":
        return `Updated ${workspaceLogoMention}`;
      case "workspace_logo_removed":
        return `Removed ${workspaceLogoMention}`;
      case "brand_asset_uploaded":
        return `Uploaded brand asset ${assetMention}`;
      case "brand_asset_removed":
        return `Removed brand asset ${assetMention}`;
      case "organization_membership_sync":
        return `Synced ${organizationMembersMention}`;
      default:
        return activity.action.replace(/_/g, " ");
    }
  })();
  const title = mentionMode === "inbox"
    ? renderCommentContent(mentionTitle, onMentionClick)
    : actionText(activity);

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
      {formattedMessage.plainText ? (
        <p className="txt-role-body-sm txt-tone-subtle [overflow-wrap:anywhere]">
          {formattedMessage.plainText}
        </p>
      ) : null}
    </ActivityRowShell>
  );
}
