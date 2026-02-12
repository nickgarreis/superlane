import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "purge-deleted-files-and-stale-pending-uploads",
  { hourUTC: 3, minuteUTC: 0 },
  internal.files.internalPurgeDeletedFiles,
  {},
);

crons.interval(
  "cleanup-pending-workspace-member-removals",
  { hours: 1 },
  internal.workspaces.internalCleanupPendingWorkspaceMemberRemovals,
  {},
);

crons.interval(
  "backfill-workspace-activity-counts",
  { hours: 1 },
  internal.activities.internalBackfillWorkspaceActivityCounts,
  { maxWorkspaces: 25 },
);

export default crons;
