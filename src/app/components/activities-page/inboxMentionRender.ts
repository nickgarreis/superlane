import type { WorkspaceActivity } from "../../types";
import type { MentionRenderOptions } from "../mentions/renderCommentContent";
import { buildMentionUserAvatarLookup } from "../mentions/userAvatarLookup";

export const buildInboxMentionRenderOptions = (
  activity: WorkspaceActivity,
  workspaceMemberAvatarLookup: ReadonlyMap<string, string>,
): MentionRenderOptions | undefined => {
  const activityUserAvatarLookup = buildMentionUserAvatarLookup([
    { label: activity.actorName, avatarUrl: activity.actorAvatarUrl },
    { label: activity.targetUserName, avatarUrl: activity.targetUserAvatarUrl ?? null },
  ]);

  if (
    workspaceMemberAvatarLookup.size === 0
    && activityUserAvatarLookup.size === 0
  ) {
    return undefined;
  }

  const mergedLookup = new Map(workspaceMemberAvatarLookup);
  for (const [normalizedLabel, avatarUrl] of activityUserAvatarLookup.entries()) {
    if (!mergedLookup.has(normalizedLabel)) {
      mergedLookup.set(normalizedLabel, avatarUrl);
    }
  }

  return { userAvatarByLabel: mergedLookup };
};
