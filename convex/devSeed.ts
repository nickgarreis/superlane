import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import { mutation, type MutationCtx } from "./_generated/server";
import { inferFileTypeFromName } from "./lib/filePolicy";
import { syncProjectAttachmentMirror } from "./lib/projectAttachments";

const seedProfileValidator = v.union(v.literal("minimal"), v.literal("full"));
type SeedProfile = "minimal" | "full";

type WorkspaceDoc = Doc<"workspaces">;
type UserDoc = Doc<"users">;
type WorkspaceMemberRole = Doc<"workspaceMembers">["role"];
type WorkspaceMemberStatus = Doc<"workspaceMembers">["status"];
type ProjectStatus = Doc<"projects">["status"];
type FileTab = Doc<"projectFiles">["tab"];

type SeedUserBlueprint = {
  key: string;
  name: string;
  role: WorkspaceMemberRole;
  status: WorkspaceMemberStatus;
};

type ProjectBlueprint = {
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

type TaskBlueprint = {
  title: string;
  projectKey: string | null;
  assigneeKey: string;
  dueOffsetDays: number | null;
  completed: boolean;
};

type FileBlueprint = {
  projectKey: string;
  tab: FileTab;
  name: string;
  mimeType: string;
  content: string;
};

type SeededProject = {
  key: string;
  projectId: Id<"projects">;
  publicId: string;
  status: ProjectStatus;
  archived: boolean;
};

type SeedSummary = {
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

type ResetSummary = {
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

const DEV_SEED_ENABLED_ENV = "DEV_SEED_ENABLED";
const DEFAULT_PROFILE: SeedProfile = "full";
const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const normalizeToken = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "");

const resolveProfile = (profile?: SeedProfile): SeedProfile => profile ?? DEFAULT_PROFILE;

const buildSeedNamespace = (workspaceSlug: string, profile: SeedProfile) => {
  const slugToken = normalizeToken(workspaceSlug) || "workspace";
  return `dev-seed-${slugToken}-${profile}`;
};

const buildProjectPrefix = (namespace: string) => `${namespace}-project-`;
const buildTaskPrefix = (namespace: string) => `${namespace}-task-`;
const buildUserPrefix = (namespace: string) => `${namespace}-user-`;
const buildFilePrefix = (namespace: string) => `${namespace}-file-`;
const buildDraftSessionPrefix = (namespace: string) => `${namespace}-draft-`;
const buildInvitationPrefix = (namespace: string) => `${namespace}-invite-`;
const buildBrandAssetPrefix = (namespace: string) => `${namespace}-brand-asset-`;
const buildOrgMembershipPrefix = (namespace: string) => `${namespace}-org-membership-`;
const buildCommentMarker = (namespace: string) => `[${namespace}]`;

const hasPrefix = (value: string | null | undefined, prefix: string) =>
  typeof value === "string" && value.startsWith(prefix);

const assertDevSeedEnabled = () => {
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

const getWorkspaceBySlug = async (ctx: MutationCtx, workspaceSlug: string) => {
  const workspace = await ctx.db
    .query("workspaces")
    .withIndex("by_slug", (q) => q.eq("slug", workspaceSlug))
    .unique();

  if (!workspace || workspace.deletedAt != null) {
    throw new ConvexError("Workspace not found");
  }

  return workspace;
};

const buildChecksum = (seed: string) => {
  const source = Array.from(seed).map((entry) => entry.charCodeAt(0).toString(16).padStart(2, "0")).join("");
  const normalizedSource = source.length > 0 ? source : "00";
  return normalizedSource.repeat(Math.ceil(64 / normalizedSource.length)).slice(0, 64);
};

const getWorkspaceUsers = async (
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
    rows.filter((row): row is { userId: string; user: UserDoc } => row !== null)
      .map((row) => [row.userId, row.user]),
  );
};

const deleteStorageObjectIfPresent = async (
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

const deleteSeedRows = async (
  ctx: MutationCtx,
  args: { workspace: WorkspaceDoc; profile: SeedProfile; namespace: string },
): Promise<ResetSummary> => {
  const projectPrefix = buildProjectPrefix(args.namespace);
  const taskPrefix = buildTaskPrefix(args.namespace);
  const userPrefix = buildUserPrefix(args.namespace);
  const filePrefix = buildFilePrefix(args.namespace);
  const draftSessionPrefix = buildDraftSessionPrefix(args.namespace);
  const invitationPrefix = buildInvitationPrefix(args.namespace);
  const brandAssetPrefix = buildBrandAssetPrefix(args.namespace);
  const orgMembershipPrefix = buildOrgMembershipPrefix(args.namespace);
  const commentMarker = buildCommentMarker(args.namespace);

  const [projectRows, taskRows, commentRows, reactionRows, fileRows, pendingUploadRows, brandAssetRows, invitationRows, membershipRows] =
    await Promise.all([
      ctx.db
        .query("projects")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("projectComments")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("commentReactions")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("projectFiles")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("pendingFileUploads")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("workspaceBrandAssets")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("workspaceInvitations")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
      ctx.db
        .query("workspaceMembers")
        .withIndex("by_workspaceId", (q) => q.eq("workspaceId", args.workspace._id))
        .collect(),
    ]);

  const seededProjects = projectRows.filter((project) => hasPrefix(project.publicId, projectPrefix));
  const seededProjectPublicIds = new Set(seededProjects.map((project) => project.publicId));
  const seededCommentRows = commentRows.filter((comment) =>
    seededProjectPublicIds.has(comment.projectPublicId)
    || comment.content.includes(commentMarker));
  const seededCommentIds = new Set(seededCommentRows.map((comment) => String(comment._id)));
  const seededReactions = reactionRows.filter((reaction) =>
    seededCommentIds.has(String(reaction.commentId))
    || (reaction.projectPublicId != null && seededProjectPublicIds.has(reaction.projectPublicId)));
  const seededTasks = taskRows.filter((task) =>
    hasPrefix(task.taskId, taskPrefix)
    || (task.projectPublicId != null && seededProjectPublicIds.has(task.projectPublicId)));
  const seededFiles = fileRows.filter((file) =>
    hasPrefix(file.name, filePrefix)
    || seededProjectPublicIds.has(file.projectPublicId));
  const seededPendingUploads = pendingUploadRows.filter((upload) =>
    hasPrefix(upload.draftSessionId, draftSessionPrefix)
    || hasPrefix(upload.name, filePrefix));
  const seededBrandAssets = brandAssetRows.filter((asset) => hasPrefix(asset.name, brandAssetPrefix));
  const seededInvitations = invitationRows.filter((invitation) =>
    hasPrefix(invitation.invitationId, invitationPrefix)
    || hasPrefix(invitation.email, `${args.namespace}-invite+`));

  const workspaceUsersById = await getWorkspaceUsers(ctx, membershipRows);
  const seededMemberships = membershipRows.filter((membership) => {
    const user = workspaceUsersById.get(String(membership.userId));
    return hasPrefix(user?.workosUserId, userPrefix);
  });
  const seededUsers = seededMemberships
    .map((membership) => workspaceUsersById.get(String(membership.userId)))
    .filter((user): user is UserDoc => user !== undefined);

  const seededNotificationPreferences = (
    await Promise.all(
      seededUsers.map((user) =>
        ctx.db
          .query("notificationPreferences")
          .withIndex("by_userId", (q) => q.eq("userId", user._id))
          .unique()),
    )
  ).filter((preference): preference is Doc<"notificationPreferences"> => preference !== null);

  const seededOrganizationMemberships = args.workspace.workosOrganizationId
    ? (
        await ctx.db
          .query("workosOrganizationMemberships")
          .withIndex("by_workosOrganizationId", (q) =>
            q.eq("workosOrganizationId", args.workspace.workosOrganizationId as string))
          .collect()
      ).filter((membership) =>
        hasPrefix(membership.membershipId, orgMembershipPrefix)
        || hasPrefix(membership.workosUserId, userPrefix))
    : [];

  for (const reaction of seededReactions) {
    await ctx.db.delete(reaction._id);
  }
  for (const comment of seededCommentRows) {
    await ctx.db.delete(comment._id);
  }
  for (const task of seededTasks) {
    await ctx.db.delete(task._id);
  }
  for (const file of seededFiles) {
    await deleteStorageObjectIfPresent(ctx, file.storageId);
    await ctx.db.delete(file._id);
  }
  for (const upload of seededPendingUploads) {
    await deleteStorageObjectIfPresent(ctx, upload.storageId);
    await ctx.db.delete(upload._id);
  }
  for (const asset of seededBrandAssets) {
    await deleteStorageObjectIfPresent(ctx, asset.storageId);
    await ctx.db.delete(asset._id);
  }
  for (const invitation of seededInvitations) {
    await ctx.db.delete(invitation._id);
  }
  for (const organizationMembership of seededOrganizationMemberships) {
    await ctx.db.delete(organizationMembership._id);
  }
  for (const project of seededProjects) {
    await ctx.db.delete(project._id);
  }
  for (const preference of seededNotificationPreferences) {
    await ctx.db.delete(preference._id);
  }
  for (const membership of seededMemberships) {
    await ctx.db.delete(membership._id);
  }
  for (const user of seededUsers) {
    await ctx.db.delete(user._id);
  }

  return {
    workspaceSlug: args.workspace.slug,
    profile: args.profile,
    namespace: args.namespace,
    deleted: {
      workosOrganizationMemberships: seededOrganizationMemberships.length,
      invitations: seededInvitations.length,
      reactions: seededReactions.length,
      comments: seededCommentRows.length,
      files: seededFiles.length,
      pendingUploads: seededPendingUploads.length,
      brandAssets: seededBrandAssets.length,
      tasks: seededTasks.length,
      projects: seededProjects.length,
      notificationPreferences: seededNotificationPreferences.length,
      workspaceMembers: seededMemberships.length,
      users: seededUsers.length,
    },
  };
};

const buildUserBlueprints = (profile: SeedProfile): SeedUserBlueprint[] =>
  profile === "minimal"
    ? [
        {
          key: "teammate",
          name: "Seed Teammate",
          role: "member",
          status: "active",
        },
      ]
    : [
        {
          key: "admin",
          name: "Seed Admin",
          role: "admin",
          status: "active",
        },
        {
          key: "designer",
          name: "Seed Designer",
          role: "member",
          status: "active",
        },
        {
          key: "developer",
          name: "Seed Developer",
          role: "member",
          status: "active",
        },
        {
          key: "invitee",
          name: "Seed Invitee",
          role: "member",
          status: "invited",
        },
      ];

const buildProjectBlueprints = (profile: SeedProfile): ProjectBlueprint[] => {
  const shared: ProjectBlueprint[] = [
    {
      key: "active-client-portal",
      name: "Client Portal Refresh",
      description:
        "Redesign the main client portal surfaces with a full UX pass, tighter navigation logic, and reusable UI patterns so account managers can move from briefing to approvals without losing context.",
      category: "Web Design",
      scope: "UX Audit + UI Production",
      creatorKey: "owner",
      status: "Active",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 12,
    },
    {
      key: "review-brand-kit",
      name: "Brand Kit Review",
      description:
        "Finalize the visual identity package with updated logo lockups, color accessibility checks, and typography guidance while gathering stakeholder review notes to close remaining approval blockers.",
      category: "Branding",
      scope: "Logo + Color + Typography",
      creatorKey: profile === "minimal" ? "teammate" : "designer",
      status: "Review",
      previousStatus: "Active",
      archived: false,
      deadlineOffsetDays: 4,
      includeReviewComment: true,
    },
  ];

  if (profile === "minimal") {
    return shared;
  }

  return [
    ...shared,
    {
      key: "draft-marketing-site",
      name: "Marketing Site Draft",
      description:
        "Build a draft structure for the new campaign website including wireframes, messaging hierarchy, and conversion-focused content placeholders so strategy and design can iterate in parallel.",
      category: "Website Design",
      scope: "Wireframes + Copy Draft",
      creatorKey: "admin",
      status: "Draft",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 20,
      includeDraftData: true,
    },
    {
      key: "completed-mobile-kit",
      name: "Mobile UI Kit",
      description:
        "Delivered a production-ready mobile component kit with documented interaction states, spacing tokens, and accessibility notes so product and growth squads can ship consistent in-app experiences.",
      category: "Product design",
      scope: "Components + Tokens",
      creatorKey: "developer",
      status: "Completed",
      previousStatus: "Review",
      archived: true,
      deadlineOffsetDays: -3,
    },
    {
      key: "archived-legacy-site",
      name: "Legacy Site Maintenance",
      description:
        "Archive the legacy maintenance stream that previously handled deprecated landing pages, preserving final references and maintenance notes while preventing new work from entering this lane.",
      category: "Web Design",
      scope: "Maintenance",
      creatorKey: "owner",
      status: "Active",
      previousStatus: null,
      archived: true,
      deadlineOffsetDays: null,
    },
    {
      key: "active-design-system-rollout",
      name: "Design System Rollout",
      description:
        "Roll out the updated design system across product touchpoints with migration checklists, team enablement docs, and component adoption tracking to reduce drift between design and implementation.",
      category: "Product design",
      scope: "System Migration",
      creatorKey: "admin",
      status: "Active",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 16,
    },
    {
      key: "active-onboarding-redesign",
      name: "Onboarding Redesign",
      description:
        "Redesign the first-run onboarding journey with clearer milestones, friendlier guidance, and measurable activation checkpoints so new customers reach first value in fewer steps.",
      category: "UI/UX Design",
      scope: "Flow Redesign",
      creatorKey: "designer",
      status: "Active",
      previousStatus: null,
      archived: false,
      deadlineOffsetDays: 14,
    },
    {
      key: "completed-email-automation",
      name: "Email Automation Visuals",
      description:
        "Completed the visual refresh for lifecycle email automations, including responsive templates, modular content blocks, and QA-approved variants for all critical campaign triggers.",
      category: "Email Design",
      scope: "Template System",
      creatorKey: "designer",
      status: "Completed",
      previousStatus: "Review",
      archived: false,
      deadlineOffsetDays: -2,
    },
    {
      key: "completed-sales-deck-refresh",
      name: "Sales Deck Refresh",
      description:
        "Finished the sales presentation refresh with updated narrative structure, stronger proof-point visuals, and reusable slide modules so the commercial team can tailor decks quickly.",
      category: "Presentation",
      scope: "Story + Slides",
      creatorKey: "admin",
      status: "Completed",
      previousStatus: "Review",
      archived: false,
      deadlineOffsetDays: -4,
    },
    {
      key: "completed-product-tour-assets",
      name: "Product Tour Assets",
      description:
        "Delivered final product tour assets including step-by-step overlays, annotation copy, and visual fallback states that support release communication across web and mobile channels.",
      category: "Product design",
      scope: "Tour Asset Pack",
      creatorKey: "developer",
      status: "Completed",
      previousStatus: "Review",
      archived: false,
      deadlineOffsetDays: -1,
    },
    {
      key: "archived-brand-audit-2024",
      name: "Brand Audit 2024",
      description:
        "Archive the historical brand audit stream from 2024 while keeping benchmark findings and decision context accessible for future strategy planning and cross-channel consistency checks.",
      category: "Branding",
      scope: "Historical Audit",
      creatorKey: "owner",
      status: "Active",
      previousStatus: null,
      archived: true,
      deadlineOffsetDays: null,
    },
    {
      key: "archived-social-campaign-q2",
      name: "Social Campaign Q2",
      description:
        "Archive the Q2 social campaign production lane after completion, preserving approved concepts, format variants, and performance notes so future campaign teams can reuse proven patterns.",
      category: "Social Media",
      scope: "Campaign Archive",
      creatorKey: "admin",
      status: "Active",
      previousStatus: null,
      archived: true,
      deadlineOffsetDays: null,
    },
  ];
};

const buildTaskBlueprints = (
  profile: SeedProfile,
  projectBlueprints: ProjectBlueprint[],
): TaskBlueprint[] => {
  const assigneeKeys = profile === "minimal"
    ? ["owner", "teammate"]
    : ["owner", "admin", "designer", "developer"];
  const tasksPerProject = profile === "minimal" ? 3 : 4;
  const taskLabels = [
    "Define delivery milestones",
    "Prepare design and content iteration",
    "Run internal QA and stakeholder pass",
    "Finalize handoff package",
  ];

  const tasks: TaskBlueprint[] = [];
  for (const [projectIndex, project] of projectBlueprints.entries()) {
    const projectIsClosed = project.status === "Completed" || project.archived;
    const deadlineBase = project.deadlineOffsetDays ?? (projectIndex + 10);

    for (let taskIndex = 0; taskIndex < tasksPerProject; taskIndex += 1) {
      const assigneeKey = assigneeKeys[(projectIndex + taskIndex) % assigneeKeys.length];
      const completed = projectIsClosed ? true : taskIndex === 0;
      const dueOffsetDays = projectIsClosed
        ? null
        : Math.max(1, deadlineBase - (tasksPerProject - taskIndex));

      tasks.push({
        title: `${taskLabels[taskIndex]} - ${project.name}`,
        projectKey: project.key,
        assigneeKey,
        dueOffsetDays,
        completed,
      });
    }
  }

  return tasks;
};

const buildFileContent = (
  mimeType: string,
  projectKey: string,
  variantIndex: number,
) => {
  if (mimeType === "text/csv") {
    return `metric,value\n${projectKey}-${variantIndex},1`;
  }
  return `seed-file-${projectKey}-${variantIndex}`;
};

const buildFileBlueprints = (
  profile: SeedProfile,
  projectBlueprints: ProjectBlueprint[],
): FileBlueprint[] => {
  const fileTemplates: Array<{ tab: FileTab; extension: string; mimeType: string }> = [
    { tab: "Assets", extension: "png", mimeType: "image/png" },
    { tab: "Contract", extension: "pdf", mimeType: "application/pdf" },
    { tab: "Attachments", extension: "txt", mimeType: "text/plain" },
    { tab: "Assets", extension: "csv", mimeType: "text/csv" },
  ];
  const filesPerProject = profile === "minimal" ? 2 : 3;

  const files: FileBlueprint[] = [];
  for (const [projectIndex, project] of projectBlueprints.entries()) {
    for (let fileIndex = 0; fileIndex < filesPerProject; fileIndex += 1) {
      const template = fileTemplates[(projectIndex + fileIndex) % fileTemplates.length];
      const variantIndex = fileIndex + 1;
      files.push({
        projectKey: project.key,
        tab: template.tab,
        name: `${project.key}-${variantIndex}.${template.extension}`,
        mimeType: template.mimeType,
        content: buildFileContent(template.mimeType, project.key, variantIndex),
      });
    }
  }

  return files;
};

const upsertSeedUser = async (
  ctx: MutationCtx,
  args: {
    namespace: string;
    workspace: WorkspaceDoc;
    blueprint: SeedUserBlueprint;
    now: number;
  },
) => {
  const workosUserId = `${buildUserPrefix(args.namespace)}${args.blueprint.key}`;
  const email = `${args.namespace}-${args.blueprint.key}@example.com`;
  const avatarUrl = `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(`${args.namespace}-${args.blueprint.key}`)}`;

  const existing = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q) => q.eq("workosUserId", workosUserId))
    .unique();

  if (existing) {
    await ctx.db.patch(existing._id, {
      email,
      firstName: args.blueprint.name.split(" ")[0] ?? args.blueprint.name,
      lastName: args.blueprint.name.split(" ").slice(1).join(" ") || undefined,
      name: args.blueprint.name,
      avatarUrl,
      updatedAt: args.now,
    });
  } else {
    await ctx.db.insert("users", {
      workosUserId,
      email,
      firstName: args.blueprint.name.split(" ")[0] ?? args.blueprint.name,
      lastName: args.blueprint.name.split(" ").slice(1).join(" ") || undefined,
      name: args.blueprint.name,
      avatarUrl,
      createdAt: args.now,
      updatedAt: args.now,
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q) => q.eq("workosUserId", workosUserId))
    .unique();

  if (!user) {
    throw new ConvexError(`Unable to resolve seeded user ${args.blueprint.key}`);
  }

  const existingMembership = await ctx.db
    .query("workspaceMembers")
    .withIndex("by_workspace_user", (q) => q.eq("workspaceId", args.workspace._id).eq("userId", user._id))
    .unique();

  const membershipPatch = {
    role: args.blueprint.role,
    status: args.blueprint.status,
    pendingRemovalAt: null,
    nameSnapshot: user.name,
    emailSnapshot: user.email ?? "",
    avatarUrlSnapshot: user.avatarUrl ?? null,
    updatedAt: args.now,
  } as const;

  if (existingMembership) {
    await ctx.db.patch(existingMembership._id, membershipPatch);
  } else {
    await ctx.db.insert("workspaceMembers", {
      workspaceId: args.workspace._id,
      userId: user._id,
      joinedAt: args.now,
      createdAt: args.now,
      ...membershipPatch,
    });
  }

  return {
    key: args.blueprint.key,
    role: args.blueprint.role,
    status: args.blueprint.status,
    user,
  };
};

const getNextTaskPosition = async (ctx: MutationCtx, workspaceId: Id<"workspaces">) => {
  const latestTask = await ctx.db
    .query("tasks")
    .withIndex("by_workspace_projectDeletedAt_position", (q) =>
      q.eq("workspaceId", workspaceId).eq("projectDeletedAt", null))
    .order("desc")
    .first();
  return typeof latestTask?.position === "number" ? latestTask.position + 1 : 0;
};

const applySeedRows = async (
  ctx: MutationCtx,
  args: { workspace: WorkspaceDoc; profile: SeedProfile; namespace: string },
): Promise<SeedSummary> => {
  const reset = await deleteSeedRows(ctx, args);

  const now = Date.now();
  const ownerUser = await ctx.db.get(args.workspace.ownerUserId);
  if (!ownerUser) {
    throw new ConvexError("Workspace owner user was not found");
  }

  const userBlueprints = buildUserBlueprints(args.profile);
  const seededUsers = await Promise.all(
    userBlueprints.map((blueprint) =>
      upsertSeedUser(ctx, {
        namespace: args.namespace,
        workspace: args.workspace,
        blueprint,
        now,
      })),
  );

  const peopleByKey = new Map<string, UserDoc>();
  peopleByKey.set("owner", ownerUser);
  for (const entry of seededUsers) {
    peopleByKey.set(entry.key, entry.user);
  }

  const projectBlueprints = buildProjectBlueprints(args.profile);
  const createdProjects: SeededProject[] = [];
  for (const [index, blueprint] of projectBlueprints.entries()) {
    const creator = peopleByKey.get(blueprint.creatorKey) ?? ownerUser;
    const createdAt = now - (projectBlueprints.length - index) * HOUR_MS;
    const deadlineEpochMs = blueprint.deadlineOffsetDays == null
      ? null
      : now + blueprint.deadlineOffsetDays * DAY_MS;
    const completedAt = blueprint.status === "Completed" ? now - DAY_MS : null;
    const archivedAt = blueprint.archived ? now - (12 * HOUR_MS) : null;
    const publicId = `${buildProjectPrefix(args.namespace)}${index + 1}`;

    const projectId = await ctx.db.insert("projects", {
      publicId,
      workspaceId: args.workspace._id,
      creatorUserId: creator._id,
      creatorSnapshotName: creator.name,
      creatorSnapshotAvatarUrl: creator.avatarUrl ?? "",
      name: blueprint.name,
      description: blueprint.description,
      category: blueprint.category,
      scope: blueprint.scope,
      deadlineEpochMs,
      status: blueprint.status,
      previousStatus: blueprint.previousStatus,
      archived: blueprint.archived,
      archivedAt,
      completedAt,
      deletedAt: null,
      createdAt,
      updatedAt: createdAt,
      draftData: blueprint.includeDraftData
        ? {
            selectedService: blueprint.category,
            projectName: blueprint.name,
            selectedJob: blueprint.scope ?? "General scope",
            description: blueprint.description,
            isAIEnabled: false,
            deadlineEpochMs,
            lastStep: 4,
          }
        : null,
      reviewComments: blueprint.includeReviewComment
        ? [
            {
              id: `${args.namespace}-review-comment-${index + 1}`,
              author: {
                userId: String(ownerUser._id),
                name: ownerUser.name,
                avatar: ownerUser.avatarUrl ?? "",
              },
              content: `${buildCommentMarker(args.namespace)} Initial review notes added.`,
              timestamp: new Date(createdAt + HOUR_MS).toISOString(),
            },
          ]
        : [],
    });

    createdProjects.push({
      key: blueprint.key,
      projectId,
      publicId,
      status: blueprint.status,
      archived: blueprint.archived,
    });
  }

  const projectByKey = new Map(createdProjects.map((project) => [project.key, project]));

  let createdTaskCount = 0;
  let nextPosition = await getNextTaskPosition(ctx, args.workspace._id);
  const taskBlueprints = buildTaskBlueprints(args.profile, projectBlueprints);
  for (const [index, blueprint] of taskBlueprints.entries()) {
    const assignee = peopleByKey.get(blueprint.assigneeKey) ?? ownerUser;
    const targetProject = blueprint.projectKey ? projectByKey.get(blueprint.projectKey) ?? null : null;
    const createdAt = now + (index + 1) * 1000;
    const dueDateEpochMs = blueprint.dueOffsetDays == null ? null : now + blueprint.dueOffsetDays * DAY_MS;
    await ctx.db.insert("tasks", {
      workspaceId: args.workspace._id,
      projectId: targetProject?.projectId ?? null,
      projectPublicId: targetProject?.publicId ?? null,
      projectDeletedAt: null,
      taskId: `${buildTaskPrefix(args.namespace)}${index + 1}`,
      title: blueprint.title,
      assignee: {
        userId: String(assignee._id),
        name: assignee.name,
        avatar: assignee.avatarUrl ?? "",
      },
      dueDateEpochMs,
      completed: blueprint.completed,
      position: nextPosition,
      createdAt,
      updatedAt: createdAt,
    });
    nextPosition += 1;
    createdTaskCount += 1;
  }

  const refreshedWorkspace = await ctx.db.get(args.workspace._id);
  if (refreshedWorkspace) {
    const currentNextPosition = refreshedWorkspace.nextTaskPosition;
    if (typeof currentNextPosition !== "number" || currentNextPosition < nextPosition) {
      await ctx.db.patch(args.workspace._id, {
        nextTaskPosition: nextPosition,
        updatedAt: now,
      });
    }
  }

  let createdFileCount = 0;
  const fileBlueprints = buildFileBlueprints(args.profile, projectBlueprints);
  for (const [index, blueprint] of fileBlueprints.entries()) {
    const targetProject = projectByKey.get(blueprint.projectKey);
    if (!targetProject) {
      continue;
    }
    const fileName = `${buildFilePrefix(args.namespace)}${index + 1}-${blueprint.name}`;
    const createdAt = now + (index + 1) * HOUR_MS;

    await ctx.db.insert("projectFiles", {
      workspaceId: args.workspace._id,
      projectId: targetProject.projectId,
      projectPublicId: targetProject.publicId,
      projectDeletedAt: null,
      tab: blueprint.tab,
      name: fileName,
      type: inferFileTypeFromName(fileName),
      mimeType: blueprint.mimeType,
      sizeBytes: blueprint.content.length,
      checksumSha256: buildChecksum(`${args.namespace}-file-${index + 1}`),
      displayDateEpochMs: createdAt,
      source: "upload",
      deletedAt: null,
      purgeAfterAt: null,
      createdAt,
      updatedAt: createdAt,
    });
    createdFileCount += 1;
  }

  for (const project of createdProjects) {
    await syncProjectAttachmentMirror(ctx, {
      _id: project.projectId,
      publicId: project.publicId,
    });
  }

  const commentProject = projectByKey.get("active-client-portal") ?? createdProjects[0];
  if (!commentProject) {
    throw new ConvexError("Unable to seed comments because no projects were created");
  }

  const seededCommentMarker = buildCommentMarker(args.namespace);
  const commentAuthorA = peopleByKey.get("owner") ?? ownerUser;
  const commentAuthorB = peopleByKey.get(args.profile === "minimal" ? "teammate" : "designer") ?? ownerUser;
  const commentAuthorC = peopleByKey.get(args.profile === "minimal" ? "teammate" : "developer") ?? ownerUser;

  const topCommentId = await ctx.db.insert("projectComments", {
    workspaceId: args.workspace._id,
    projectId: commentProject.projectId,
    projectPublicId: commentProject.publicId,
    authorUserId: commentAuthorA._id,
    authorSnapshotName: commentAuthorA.name,
    authorSnapshotAvatarUrl: commentAuthorA.avatarUrl ?? "",
    content: `${seededCommentMarker} Kickoff notes are ready for review.`,
    resolved: false,
    edited: false,
    createdAt: now + 5 * HOUR_MS,
    updatedAt: now + 5 * HOUR_MS,
  });

  await ctx.db.insert("projectComments", {
    workspaceId: args.workspace._id,
    projectId: commentProject.projectId,
    projectPublicId: commentProject.publicId,
    parentCommentId: topCommentId,
    authorUserId: commentAuthorB._id,
    authorSnapshotName: commentAuthorB.name,
    authorSnapshotAvatarUrl: commentAuthorB.avatarUrl ?? "",
    content: `${seededCommentMarker} Added responsive navigation alternatives.`,
    resolved: false,
    edited: false,
    createdAt: now + 6 * HOUR_MS,
    updatedAt: now + 6 * HOUR_MS,
  });

  const resolvedCommentId = await ctx.db.insert("projectComments", {
    workspaceId: args.workspace._id,
    projectId: commentProject.projectId,
    projectPublicId: commentProject.publicId,
    authorUserId: commentAuthorC._id,
    authorSnapshotName: commentAuthorC.name,
    authorSnapshotAvatarUrl: commentAuthorC.avatarUrl ?? "",
    resolvedByUserId: ownerUser._id,
    content: `${seededCommentMarker} Hand-off checklist has been completed.`,
    resolved: true,
    edited: false,
    createdAt: now + 7 * HOUR_MS,
    updatedAt: now + 8 * HOUR_MS,
  });

  await ctx.db.insert("commentReactions", {
    commentId: topCommentId,
    projectPublicId: commentProject.publicId,
    workspaceId: args.workspace._id,
    emoji: "thumbs_up",
    userId: commentAuthorB._id,
    createdAt: now + 6 * HOUR_MS + 5 * 60 * 1000,
  });
  await ctx.db.insert("commentReactions", {
    commentId: resolvedCommentId,
    projectPublicId: commentProject.publicId,
    workspaceId: args.workspace._id,
    emoji: "done",
    userId: commentAuthorA._id,
    createdAt: now + 8 * HOUR_MS + 5 * 60 * 1000,
  });

  let invitationCount = 0;
  if (args.profile === "full") {
    await ctx.db.insert("workspaceInvitations", {
      workspaceId: args.workspace._id,
      workosOrganizationId: args.workspace.workosOrganizationId ?? `${args.namespace}-org`,
      invitationId: `${buildInvitationPrefix(args.namespace)}1`,
      email: `${args.namespace}-invite+1@example.com`,
      state: "pending",
      requestedRole: "member",
      expiresAt: new Date(now + 7 * DAY_MS).toISOString(),
      inviterWorkosUserId: ownerUser.workosUserId,
      createdAt: now,
      updatedAt: now,
    });
    invitationCount = 1;
  }

  const brandAssetCount = 0;

  return {
    workspaceSlug: args.workspace.slug,
    profile: args.profile,
    namespace: args.namespace,
    reset,
    created: {
      users: seededUsers.length,
      workspaceMembers: seededUsers.length,
      projects: createdProjects.length,
      tasks: createdTaskCount,
      files: createdFileCount,
      comments: 3,
      reactions: 2,
      invitations: invitationCount,
      brandAssets: brandAssetCount,
    },
  };
};

const getSeedContext = async (
  ctx: MutationCtx,
  args: { workspaceSlug: string; profile?: SeedProfile },
) => {
  assertDevSeedEnabled();
  const workspace = await getWorkspaceBySlug(ctx, args.workspaceSlug);
  const profile = resolveProfile(args.profile);
  const namespace = buildSeedNamespace(workspace.slug, profile);
  return { workspace, profile, namespace };
};

export const apply = mutation({
  args: {
    workspaceSlug: v.string(),
    profile: v.optional(seedProfileValidator),
  },
  handler: async (ctx, args) => {
    const context = await getSeedContext(ctx, args);
    return applySeedRows(ctx, context);
  },
});

export const reset = mutation({
  args: {
    workspaceSlug: v.string(),
    profile: v.optional(seedProfileValidator),
  },
  handler: async (ctx, args) => {
    const context = await getSeedContext(ctx, args);
    return deleteSeedRows(ctx, context);
  },
});

export const reseed = mutation({
  args: {
    workspaceSlug: v.string(),
    profile: v.optional(seedProfileValidator),
  },
  handler: async (ctx, args) => {
    const context = await getSeedContext(ctx, args);
    return applySeedRows(ctx, context);
  },
});
