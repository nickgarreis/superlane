import type { WorkspaceActivity } from "../../types";

export const formatRelativeActivityTime = (timestampEpochMs: number) => {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestampEpochMs) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(timestampEpochMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatActivityMeta = (activity: WorkspaceActivity) => {
  const parts = [activity.actorName];
  if (activity.projectName) {
    parts.push(activity.projectName);
  }
  parts.push(formatRelativeActivityTime(activity.createdAt));
  return parts.join(" | ");
};
