import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "purge-deleted-files-and-stale-pending-uploads",
  { hourUTC: 3, minuteUTC: 0 },
  internal.files.internalPurgeDeletedFiles,
  {},
);

export default crons;
