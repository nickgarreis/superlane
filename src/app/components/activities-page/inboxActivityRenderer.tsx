import type { WorkspaceActivity } from "../../types";
import { buildInboxMentionRenderOptions } from "./inboxMentionRender";
import { CollaborationActivityRow } from "./rows/CollaborationActivityRow";
import { FileActivityRow } from "./rows/FileActivityRow";
import { MembershipActivityRow } from "./rows/MembershipActivityRow";
import { ProjectActivityRow } from "./rows/ProjectActivityRow";
import { TaskActivityRow } from "./rows/TaskActivityRow";
import { WorkspaceActivityRow } from "./rows/WorkspaceActivityRow";

type RenderInboxActivityArgs = {
  showReadState: boolean;
  onMarkActivityRead?: (activityId: string) => void;
  onDismissActivity?: (activityId: string) => void;
  onActivityClick?: (activity: WorkspaceActivity) => void;
  onClose?: () => void;
  workspaceMemberAvatarLookup: ReadonlyMap<string, string>;
};

export const renderInboxActivity = (
  activity: WorkspaceActivity,
  args: RenderInboxActivityArgs,
) => {
  const mentionRenderOptions = buildInboxMentionRenderOptions(
    activity,
    args.workspaceMemberAvatarLookup,
  );
  const onMarkRead = activity.isRead === false && args.onMarkActivityRead
    ? () => args.onMarkActivityRead?.(activity.id)
    : undefined;
  const onDismiss = args.onDismissActivity
    ? () => args.onDismissActivity?.(activity.id)
    : undefined;
  const onMentionClick = args.onActivityClick
    ? () => {
        if (activity.isRead === false) {
          args.onMarkActivityRead?.(activity.id);
        }
        args.onActivityClick?.(activity);
        args.onClose?.();
      }
    : undefined;

  switch (activity.kind) {
    case "project":
      return (
        <ProjectActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
          mentionRenderOptions={mentionRenderOptions}
        />
      );
    case "task":
      return (
        <TaskActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
          mentionRenderOptions={mentionRenderOptions}
        />
      );
    case "collaboration":
      return (
        <CollaborationActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
          mentionRenderOptions={mentionRenderOptions}
        />
      );
    case "file":
      return (
        <FileActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
          mentionRenderOptions={mentionRenderOptions}
        />
      );
    case "membership":
      return (
        <MembershipActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
          mentionRenderOptions={mentionRenderOptions}
        />
      );
    case "workspace":
    case "organization":
    default:
      return (
        <WorkspaceActivityRow
          key={activity.id}
          activity={activity}
          showReadState={args.showReadState}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
          mentionMode="inbox"
          onMentionClick={onMentionClick}
          mentionRenderOptions={mentionRenderOptions}
        />
      );
  }
};
