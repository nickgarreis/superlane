import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";

export const seedProfileValidator = v.union(v.literal("minimal"), v.literal("full"));
export type SeedProfile = "minimal" | "full";

export type WorkspaceDoc = Doc<"workspaces">;
export type UserDoc = Doc<"users">;
export type WorkspaceMemberRole = Doc<"workspaceMembers">["role"];
export type WorkspaceMemberStatus = Doc<"workspaceMembers">["status"];
export type ProjectStatus = Doc<"projects">["status"];
export type FileTab = Doc<"projectFiles">["tab"];

export type SeedUserBlueprint = {
  key: string;
  name: string;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
};

export type ProjectBlueprint = {
  key: string;
  name: string;
  description: string;
  category: string;
  scope?: string;
  creatorKey: string;
  status: ProjectStatus;
  previousStatus: ProjectStatus | null;
  archived: boolean;
  deadlineOffsetDays: number | null;
  includeDraftData?: boolean;
  includeReviewComment?: boolean;
};

export type TaskBlueprint = {
  title: string;
  projectKey: string | null;
  assigneeKey: string;
  dueOffsetDays: number | null;
  completed: boolean;
};

export type FileBlueprint = {
  projectKey: string;
  tab: FileTab;
  name: string;
  mimeType: string;
  content: string;
};

export type SeededProject = {
  key: string;
  projectId: Id<"projects">;
  publicId: string;
  status: ProjectStatus;
  archived: boolean;
};

export type ResetSummary = {
  workspaceSlug: string;
  profile: SeedProfile;
  namespace: string;
  deleted: {
    workosOrganizationMemberships: number;
    invitations: number;
    reactions: number;
    comments: number;
    files: number;
    pendingUploads: number;
    brandAssets: number;
    tasks: number;
    projects: number;
    notificationPreferences: number;
    workspaceMembers: number;
    users: number;
  };
};

export type SeedSummary = {
  workspaceSlug: string;
  profile: SeedProfile;
  namespace: string;
  reset: ResetSummary;
  created: {
    users: number;
    workspaceMembers: number;
    projects: number;
    tasks: number;
    files: number;
    comments: number;
    reactions: number;
    invitations: number;
    brandAssets: number;
  };
};

export type SeedOperationArgs = {
  workspace: WorkspaceDoc;
  profile: SeedProfile;
  namespace: string;
};

const DEV_SEED_ENABLED_ENV = "DEV_SEED_ENABLED";
const DEFAULT_PROFILE: SeedProfile = "full";

export const DAY_MS = 24 * 60 * 60 * 1000;
export const HOUR_MS = 60 * 60 * 1000;

const normalizeToken = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

export const resolveProfile = (profile?: SeedProfile): SeedProfile => profile ?? DEFAULT_PROFILE;

export const buildSeedNamespace = (workspaceSlug: string, profile: SeedProfile) => {
  const slugToken = normalizeToken(workspaceSlug) || "workspace";
  return `dev-seed-${slugToken}-${profile}`;
};

export const buildProjectPrefix = (namespace: string) => `${namespace}-project-`;
export const buildTaskPrefix = (namespace: string) => `${namespace}-task-`;
export const buildUserPrefix = (namespace: string) => `${namespace}-user-`;
export const buildFilePrefix = (namespace: string) => `${namespace}-file-`;
export const buildDraftSessionPrefix = (namespace: string) => `${namespace}-draft-`;
export const buildInvitationPrefix = (namespace: string) => `${namespace}-invite-`;
export const buildBrandAssetPrefix = (namespace: string) => `${namespace}-brand-asset-`;
export const buildOrgMembershipPrefix = (namespace: string) => `${namespace}-org-membership-`;
export const buildCommentMarker = (namespace: string) => `[${namespace}]`;

export const hasPrefix = (value: string | null | undefined, prefix: string) =>
  typeof value === "string" && value.startsWith(prefix);

export const assertDevSeedEnabled = () => {
  const enabled = (process.env[DEV_SEED_ENABLED_ENV] ?? "").trim().toLowerCase() === "true";
  if (!enabled) {
    throw new ConvexError(
      `Dev seeding is disabled. Run "npx convex env set ${DEV_SEED_ENABLED_ENV} true" for your dev deployment.`,
    );
  }

  const deploymentName = (process.env.CONVEX_DEPLOYMENT ?? "").toLowerCase();
  if (deploymentName.includes("prod")) {
    throw new ConvexError("Dev seed cannot run on a production deployment.");
  }
};

export const getWorkspaceBySlug = async (ctx: MutationCtx, workspaceSlug: string) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
    .unique();

  if (!workspace || workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }

  return workspace;
};

export const buildChecksum = (seed: string) => {
  const source = Array.from(seed)
    .map((entry) => entry.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
  const normalizedSource = source.length > 0 ? source : "00";
  return normalizedSource.repeat(Math.ceil(64 / normalizedSource.length)).slice(0, 64);
};

export const getWorkspaceUsers = async (
  ctx: MutationCtx,
  membershipRows: Doc<"workspaceMembers">[],
) => {
  const seen = new Set<string>();
  const rows = await Promise.all(
    membershipRows.map(async (membership) => {
      const userId = String(membership.userId);
      if (seen.has(userId)) {
        return null;
      }
      seen.add(userId);
      const user = await ctx.db.get(membership.userId);
      return user ? ({ userId, user } as const) : null;
    }),
  );

  return new Map(
    rows
      .filter((row): row is { userId: string; user: UserDoc } => row !== null)
      .map((row) => [row.userId, row.user]),
  );
};

export const deleteStorageObjectIfPresent = async (
  ctx: MutationCtx,
  storageId: Id<"_storage"> | undefined,
) => {
  if (!storageId) {
    return;
  }

  try {
    await ctx.storage.delete(storageId);
  } catch {
    // Best-effort cleanup; stale storage objects are acceptable in dev seeding.
  }
};
