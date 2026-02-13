/**
 * Demo seed data — resets on page reload.
 * All IDs are stable strings so components can reference them.
 */

import profileDemoImageUrl from "../../profile_demo.jpg";
import type {
  CollaborationComment,
  CommentReaction,
  ProjectData,
  ProjectDraftData,
  ProjectFileData,
  ReviewComment,
  Task,
  ViewerIdentity,
  Workspace,
  WorkspaceActivity,
  WorkspaceMember,
} from "../app/types";

const DEMO_PROFILE_IMAGE_URL = profileDemoImageUrl;

// ── Viewer ──────────────────────────────────────────────
export const DEMO_VIEWER: ViewerIdentity = {
  userId: "demo-user-001",
  workosUserId: "wos-demo-001",
  name: "Nick Garreis",
  email: "nick@superlane.de",
  avatarUrl: DEMO_PROFILE_IMAGE_URL,
  role: "owner",
};

// ── Workspace ───────────────────────────────────────────
export const DEMO_WORKSPACE: Workspace = {
  id: "demo-workspace",
  slug: "demo-workspace",
  name: "Superlane Demo",
  plan: "pro",
  logo: undefined,
  logoColor: "#6366f1",
  logoText: "SD",
};

export const DEMO_WORKSPACES: Workspace[] = [DEMO_WORKSPACE];

// ── Members ─────────────────────────────────────────────
export const DEMO_MEMBERS: WorkspaceMember[] = [
  {
    userId: "demo-user-001",
    workosUserId: "wos-demo-001",
    name: "Nick Garreis",
    email: "nick@superlane.de",
    avatarUrl: DEMO_PROFILE_IMAGE_URL,
    role: "owner",
    isViewer: true,
  },
  {
    userId: "demo-user-002",
    workosUserId: "wos-demo-002",
    name: "Sarah Chen",
    email: "sarah@acme.com",
    avatarUrl: null,
    role: "admin",
    isViewer: false,
  },
  {
    userId: "demo-user-003",
    workosUserId: "wos-demo-003",
    name: "Max Weber",
    email: "max@acme.com",
    avatarUrl: null,
    role: "member",
    isViewer: false,
  },
  {
    userId: "demo-user-004",
    workosUserId: "wos-demo-004",
    name: "Lisa Park",
    email: "lisa@acme.com",
    avatarUrl: null,
    role: "member",
    isViewer: false,
  },
];

const membersById = new Map(DEMO_MEMBERS.map((member) => [member.userId, member]));
const getMember = (userId: string): WorkspaceMember =>
  membersById.get(userId) ?? DEMO_MEMBERS[0];

// ── Status helpers ──────────────────────────────────────
const statusStyles = {
  Draft: {
    label: "Draft",
    color: "var(--status-draft)",
    bgColor: "var(--status-draft-soft)",
    dotColor: "var(--status-draft-dot)",
  },
  Review: {
    label: "Review",
    color: "var(--status-review)",
    bgColor: "var(--status-review-soft)",
    dotColor: "var(--status-review-dot)",
  },
  Active: {
    label: "Active",
    color: "var(--status-active)",
    bgColor: "var(--status-active-soft)",
    dotColor: "var(--status-active-dot)",
  },
  Completed: {
    label: "Completed",
    color: "var(--status-completed)",
    bgColor: "var(--status-completed-soft)",
    dotColor: "var(--status-completed-dot)",
  },
} as const;

type DemoStatusLabel = keyof typeof statusStyles;

type DemoProjectSeed = {
  id: string;
  name: string;
  description: string;
  creatorUserId: string;
  status: DemoStatusLabel;
  previousStatus?: DemoStatusLabel;
  category: string;
  scope: string;
  deadlineOffsetDays: number;
  archived: boolean;
  archivedOffsetDays?: number;
  completedOffsetDays?: number;
  lastApprovedOffsetDays?: number;
  draftData?: ProjectDraftData;
};

const now = Date.now();
const DAY = 86_400_000;

const DEMO_PROJECT_SEEDS: DemoProjectSeed[] = [
  // 4 active projects (one with fresh approval for sidebar "Approved" tag)
  {
    id: "proj-client-portal",
    name: "Client Portal Redesign",
    description:
      "Full UX overhaul of the client-facing portal with improved navigation, file management, and real-time collaboration features.",
    creatorUserId: "demo-user-001",
    status: "Active",
    category: "Custom",
    scope: "UX Audit + UI Production",
    deadlineOffsetDays: 18,
    archived: false,
  },
  {
    id: "proj-email-templates",
    name: "Email Template System",
    description:
      "Design a modular email template system for transactional and marketing emails that maintains brand consistency.",
    creatorUserId: "demo-user-004",
    status: "Active",
    category: "Email Design",
    scope: "Template Library",
    deadlineOffsetDays: 12,
    archived: false,
  },
  {
    id: "proj-retainer-analytics",
    name: "Retention Dashboard Revamp",
    description:
      "Refine retention analytics surfaces with clearer KPI hierarchy, cohort filters, and executive-level exports.",
    creatorUserId: "demo-user-002",
    status: "Active",
    previousStatus: "Review",
    category: "Product Design",
    scope: "Dashboard UX + Data Visuals",
    deadlineOffsetDays: 16,
    archived: false,
    lastApprovedOffsetDays: 1,
  },
  {
    id: "proj-social-campaign",
    name: "Q2 Social Campaign Toolkit",
    description:
      "Build a reusable campaign toolkit for paid social including post variants, ad cards, and story templates.",
    creatorUserId: "demo-user-003",
    status: "Active",
    category: "Custom",
    scope: "Campaign Kit",
    deadlineOffsetDays: 22,
    archived: false,
  },

  // 2 drafts
  {
    id: "proj-onboarding-revamp",
    name: "Onboarding Experience Draft",
    description:
      "Early concept work for onboarding flow simplification with clearer milestone checkpoints and task ownership.",
    creatorUserId: "demo-user-001",
    status: "Draft",
    category: "Product Design",
    scope: "Flow Mapping + Wireframes",
    deadlineOffsetDays: 28,
    archived: false,
    draftData: {
      selectedService: "Product Design",
      projectName: "Onboarding Experience Draft",
      selectedJob: "Flow Redesign",
      description: "Restructure onboarding into milestone-driven steps.",
      isAIEnabled: true,
      deadlineEpochMs: now + 28 * DAY,
      lastStep: 3,
    },
  },
  {
    id: "proj-event-microsite",
    name: "Annual Event Microsite",
    description:
      "Draft information architecture and visual concept for the annual customer event microsite.",
    creatorUserId: "demo-user-002",
    status: "Draft",
    category: "Custom",
    scope: "IA + Visual Concept",
    deadlineOffsetDays: 24,
    archived: false,
    draftData: {
      selectedService: "Custom",
      projectName: "Annual Event Microsite",
      selectedJob: "Microsite",
      description: "Event agenda, speaker highlights, and registration flow.",
      isAIEnabled: false,
      deadlineEpochMs: now + 24 * DAY,
      lastStep: 2,
    },
  },

  // 4 completed (non-archived)
  {
    id: "proj-mobile-kit",
    name: "Mobile UI Kit",
    description:
      "Comprehensive mobile UI component library with iOS and Android patterns.",
    creatorUserId: "demo-user-002",
    status: "Completed",
    previousStatus: "Active",
    category: "Product Design",
    scope: "Component Library",
    deadlineOffsetDays: -4,
    archived: false,
    completedOffsetDays: 1,
  },
  {
    id: "proj-brand-refresh",
    name: "Brand Refresh Rollout",
    description:
      "Cross-channel rollout package for refreshed brand tokens, typography, and motion principles.",
    creatorUserId: "demo-user-004",
    status: "Completed",
    previousStatus: "Active",
    category: "Branding",
    scope: "Brand System",
    deadlineOffsetDays: -7,
    archived: false,
    completedOffsetDays: 3,
  },
  {
    id: "proj-design-audit",
    name: "Design System Audit",
    description:
      "Audit and remediation plan for design system consistency across product squads.",
    creatorUserId: "demo-user-003",
    status: "Completed",
    previousStatus: "Active",
    category: "Custom",
    scope: "Audit + Remediation",
    deadlineOffsetDays: -11,
    archived: false,
    completedOffsetDays: 5,
  },
  {
    id: "proj-performance-landing",
    name: "Performance Landing Pages",
    description:
      "Conversion-focused landing page set with performance optimizations and content variants.",
    creatorUserId: "demo-user-001",
    status: "Completed",
    previousStatus: "Active",
    category: "Custom",
    scope: "Landing Page System",
    deadlineOffsetDays: -14,
    archived: false,
    completedOffsetDays: 8,
  },

  // 6 archived
  {
    id: "proj-arch-legacy-portal",
    name: "Legacy Portal Cleanup",
    description:
      "Sunset visual debt and consolidate stale components from the legacy portal implementation.",
    creatorUserId: "demo-user-001",
    status: "Completed",
    previousStatus: "Active",
    category: "Web Design",
    scope: "Cleanup + Decommission",
    deadlineOffsetDays: -20,
    archived: true,
    completedOffsetDays: 12,
    archivedOffsetDays: 9,
  },
  {
    id: "proj-arch-sales-deck",
    name: "Enterprise Sales Deck",
    description:
      "Enterprise-ready sales deck with vertical variants and pricing narratives.",
    creatorUserId: "demo-user-002",
    status: "Completed",
    previousStatus: "Active",
    category: "Presentation",
    scope: "Deck + Storytelling",
    deadlineOffsetDays: -22,
    archived: true,
    completedOffsetDays: 14,
    archivedOffsetDays: 10,
  },
  {
    id: "proj-arch-investor-room",
    name: "Investor Data Room Visuals",
    description:
      "Internal investor update templates and board summary visuals.",
    creatorUserId: "demo-user-003",
    status: "Completed",
    previousStatus: "Active",
    category: "Presentation",
    scope: "Internal Reporting",
    deadlineOffsetDays: -25,
    archived: true,
    completedOffsetDays: 16,
    archivedOffsetDays: 11,
  },
  {
    id: "proj-arch-help-center",
    name: "Help Center IA Refresh",
    description:
      "Information architecture update for support docs and onboarding help center pathways.",
    creatorUserId: "demo-user-004",
    status: "Completed",
    previousStatus: "Active",
    category: "Web Design",
    scope: "IA + Taxonomy",
    deadlineOffsetDays: -26,
    archived: true,
    completedOffsetDays: 17,
    archivedOffsetDays: 12,
  },
  {
    id: "proj-arch-field-toolkit",
    name: "Field Enablement Toolkit",
    description:
      "Collateral package for field teams with printable one-pagers and editable templates.",
    creatorUserId: "demo-user-001",
    status: "Active",
    previousStatus: "Review",
    category: "Custom",
    scope: "Template Suite",
    deadlineOffsetDays: -18,
    archived: true,
    archivedOffsetDays: 13,
  },
  {
    id: "proj-arch-internal-wiki",
    name: "Internal Wiki Restructure",
    description:
      "Reorganize design wiki architecture and handoff documentation templates.",
    creatorUserId: "demo-user-002",
    status: "Active",
    previousStatus: "Review",
    category: "Custom",
    scope: "Knowledge Base",
    deadlineOffsetDays: -15,
    archived: true,
    archivedOffsetDays: 14,
  },
];

const buildReviewComments = (
  seed: DemoProjectSeed,
  seedIndex: number,
): ReviewComment[] => {
  const primary = DEMO_MEMBERS[(seedIndex + 1) % DEMO_MEMBERS.length];
  const secondary = DEMO_MEMBERS[(seedIndex + 2) % DEMO_MEMBERS.length];
  return [
    {
      id: `review-${seed.id}-1`,
      author: {
        userId: primary.userId,
        name: primary.name,
        avatar: primary.avatarUrl ?? "",
      },
      content:
        `Layout direction for ${seed.name} is approved. Please keep spacing consistent in the final pass.`,
      timestamp: new Date(now - (seedIndex + 4) * DAY).toISOString(),
    },
    {
      id: `review-${seed.id}-2`,
      author: {
        userId: secondary.userId,
        name: secondary.name,
        avatar: secondary.avatarUrl ?? "",
      },
      content:
        "Ready for handoff once asset naming and section hierarchy are finalized.",
      timestamp: new Date(now - (seedIndex + 2) * DAY).toISOString(),
    },
  ];
};

const styleFor = (status: DemoStatusLabel) => statusStyles[status];

export const DEMO_PROJECTS: Record<string, ProjectData> = Object.fromEntries(
  DEMO_PROJECT_SEEDS.map((seed, seedIndex) => {
    const creator = getMember(seed.creatorUserId);
    const completedAt =
      typeof seed.completedOffsetDays === "number"
        ? now - seed.completedOffsetDays * DAY
        : undefined;
    const archivedAt =
      seed.archived && typeof seed.archivedOffsetDays === "number"
        ? now - seed.archivedOffsetDays * DAY
        : undefined;
    const lastApprovedAt =
      typeof seed.lastApprovedOffsetDays === "number"
        ? now - seed.lastApprovedOffsetDays * DAY
        : undefined;

    const project: ProjectData = {
      id: seed.id,
      name: seed.name,
      description: seed.description,
      creator: {
        userId: creator.userId,
        name: creator.name,
        avatar: creator.avatarUrl ?? "",
      },
      status: styleFor(seed.status),
      previousStatus: seed.previousStatus ? styleFor(seed.previousStatus) : undefined,
      category: seed.category,
      scope: seed.scope,
      deadlineEpochMs: now + seed.deadlineOffsetDays * DAY,
      workspaceId: DEMO_WORKSPACE.id,
      archived: seed.archived,
      archivedAt: archivedAt ?? null,
      completedAt: completedAt ?? null,
      lastApprovedAt: lastApprovedAt ?? null,
      draftData: seed.draftData,
      comments: buildReviewComments(seed, seedIndex),
    };

    return [seed.id, project];
  }),
);

// ── Tasks ───────────────────────────────────────────────
const TASK_TITLE_TEMPLATES = [
  "Align project brief and constraints",
  "Prepare design handoff package",
  "Run stakeholder walkthrough",
] as const;

export const DEMO_TASKS: Task[] = DEMO_PROJECT_SEEDS.flatMap((seed, seedIndex) =>
  TASK_TITLE_TEMPLATES.map((title, titleIndex) => {
    const assignee = DEMO_MEMBERS[(seedIndex + titleIndex) % DEMO_MEMBERS.length];
    const immutableProject = seed.archived || seed.status === "Completed";
    const dueDateEpochMs = immutableProject
      ? now - (seedIndex + titleIndex + 1) * DAY
      : now + (seedIndex + titleIndex + 2) * DAY;

    return {
      id: `task-${seed.id}-${titleIndex + 1}`,
      title: `${title} (${seed.name})`,
      projectId: seed.id,
      assignee: {
        userId: assignee.userId,
        name: assignee.name,
        avatar: assignee.avatarUrl ?? "",
      },
      dueDateEpochMs,
      completed: immutableProject ? true : titleIndex === 0,
    };
  }),
);

// ── Files ───────────────────────────────────────────────
const FILE_TEMPLATES = [
  {
    tab: "Assets" as const,
    suffix: "design-source.fig",
    type: "Figma",
    mimeType: "application/figma",
    sizeBytes: 2_200_000,
  },
  {
    tab: "Contract" as const,
    suffix: "scope-and-approvals.pdf",
    type: "PDF",
    mimeType: "application/pdf",
    sizeBytes: 1_460_000,
  },
  {
    tab: "Attachments" as const,
    suffix: "handoff-preview.png",
    type: "Image",
    mimeType: "image/png",
    sizeBytes: 780_000,
  },
] as const;

const slugFromProjectId = (projectId: string) => projectId.replace(/^proj-/, "");

export const DEMO_PROJECT_FILES: ProjectFileData[] = DEMO_PROJECT_SEEDS.flatMap(
  (seed, seedIndex) =>
    FILE_TEMPLATES.map((template, templateIndex) => ({
      id: `file-${seed.id}-${templateIndex + 1}`,
      projectPublicId: seed.id,
      tab: template.tab,
      name: `${slugFromProjectId(seed.id)}-${template.suffix}`,
      type: template.type,
      displayDateEpochMs: now - (seedIndex + templateIndex + 1) * DAY,
      mimeType: template.mimeType,
      sizeBytes: template.sizeBytes + seedIndex * 14_000,
      downloadable: true,
    })),
);

// ── Comments (chat sidebar) ────────────────────────────
const COMMENT_REACTION_POOL: CommentReaction[] = [
  { emoji: "👍", users: ["Sarah Chen"], userIds: ["demo-user-002"] },
  { emoji: "🔥", users: ["Lisa Park"], userIds: ["demo-user-004"] },
  { emoji: "✅", users: ["Nick Garreis"], userIds: ["demo-user-001"] },
];

const buildCommentThread = (
  seed: DemoProjectSeed,
  seedIndex: number,
  threadIndex: number,
): CollaborationComment => {
  const author = DEMO_MEMBERS[(seedIndex + threadIndex) % DEMO_MEMBERS.length];
  const replier = DEMO_MEMBERS[(seedIndex + threadIndex + 1) % DEMO_MEMBERS.length];
  const timestampEpochMs = now - (seedIndex * 8 + threadIndex * 2 + 1) * 3_600_000;
  const replyTimestampEpochMs = timestampEpochMs + 45 * 60_000;

  const threadId = `comment-${seed.id}-${threadIndex + 1}`;
  const replyId = `${threadId}-reply-1`;

  const unresolvedContent = [
    `Kickoff notes for ${seed.name}: the structure is in place and the next pass focuses on content clarity.`,
    `Can we align the final CTA hierarchy for ${seed.name}? I noted two variants that should be merged.`,
    `Uploaded the latest assets for ${seed.name}. Please review naming and export settings before handoff.`,
  ] as const;

  const replyContent = [
    "Looks good. I will consolidate the spacing tokens and push an updated pass this afternoon.",
    "Agreed. I will merge those variants and keep a single conversion-focused CTA pattern.",
    "Confirmed. I reviewed exports and normalized file names across all deliverables.",
  ] as const;

  return {
    id: threadId,
    author: {
      userId: author.userId,
      name: author.name,
      avatar: author.avatarUrl ?? "",
    },
    content: unresolvedContent[threadIndex % unresolvedContent.length],
    timestamp: new Date(timestampEpochMs).toISOString(),
    timestampEpochMs,
    replies: [
      {
        id: replyId,
        author: {
          userId: replier.userId,
          name: replier.name,
          avatar: replier.avatarUrl ?? "",
        },
        content: replyContent[threadIndex % replyContent.length],
        timestamp: new Date(replyTimestampEpochMs).toISOString(),
        timestampEpochMs: replyTimestampEpochMs,
        replies: [],
        resolved: false,
        edited: false,
      },
    ],
    resolved:
      seed.archived || seed.status === "Completed"
        ? threadIndex === 2
        : false,
    edited: threadIndex === 1,
    reactions: [COMMENT_REACTION_POOL[(seedIndex + threadIndex) % COMMENT_REACTION_POOL.length]],
  };
};

export const DEMO_PROJECT_COMMENTS: Record<string, CollaborationComment[]> =
  Object.fromEntries(
    DEMO_PROJECT_SEEDS.map((seed, seedIndex) => [
      seed.id,
      [0, 1, 2].map((threadIndex) =>
        buildCommentThread(seed, seedIndex, threadIndex),
      ),
    ]),
  );

// Legacy export kept for older mock query paths.
export const DEMO_COMMENTS: CollaborationComment[] =
  DEMO_PROJECT_COMMENTS["proj-client-portal"] ?? [];

// ── Activities / Inbox ──────────────────────────────────
const tasksByProjectId = DEMO_TASKS.reduce<Record<string, Task[]>>((acc, task) => {
  if (!task.projectId) {
    return acc;
  }
  if (!acc[task.projectId]) {
    acc[task.projectId] = [];
  }
  acc[task.projectId].push(task);
  return acc;
}, {});

const filesByProjectId = DEMO_PROJECT_FILES.reduce<Record<string, ProjectFileData[]>>(
  (acc, file) => {
    if (!acc[file.projectPublicId]) {
      acc[file.projectPublicId] = [];
    }
    acc[file.projectPublicId].push(file);
    return acc;
  },
  {},
);

const activityBase = (
  overrides: Partial<WorkspaceActivity> & {
    id: string;
    kind: WorkspaceActivity["kind"];
    action: string;
    actorUserId: string;
    createdAt: number;
  },
): WorkspaceActivity => {
  const actor = getMember(overrides.actorUserId);
  return {
    id: overrides.id,
    kind: overrides.kind,
    action: overrides.action,
    actorType: "user",
    actorUserId: actor.userId,
    actorName: actor.name,
    actorAvatarUrl: actor.avatarUrl,
    projectPublicId: overrides.projectPublicId ?? null,
    projectName: overrides.projectName ?? null,
    projectCategory: overrides.projectCategory ?? null,
    projectVisibility: "workspace",
    projectOwnerUserId: null,
    taskId: overrides.taskId ?? null,
    taskTitle: overrides.taskTitle ?? null,
    fileName: overrides.fileName ?? null,
    fileTab: overrides.fileTab ?? null,
    targetUserId: overrides.targetUserId ?? null,
    targetUserName: overrides.targetUserName ?? null,
    targetRole: overrides.targetRole ?? null,
    fromValue: overrides.fromValue ?? null,
    toValue: overrides.toValue ?? null,
    message: overrides.message ?? null,
    errorCode: null,
    createdAt: overrides.createdAt,
    isRead: overrides.isRead,
  };
};

const rawActivities = DEMO_PROJECT_SEEDS.slice(0, 12).flatMap((seed, seedIndex) => {
  const project = DEMO_PROJECTS[seed.id];
  const seedTasks = tasksByProjectId[seed.id] ?? [];
  const seedFiles = filesByProjectId[seed.id] ?? [];
  const seedComments = DEMO_PROJECT_COMMENTS[seed.id] ?? [];

  const primaryActor = DEMO_MEMBERS[(seedIndex + 1) % DEMO_MEMBERS.length];
  const secondaryActor = DEMO_MEMBERS[(seedIndex + 2) % DEMO_MEMBERS.length];
  const createdAtBase = now - seedIndex * 2 * 3_600_000;

  const statusEvent = activityBase({
    id: `act-${String(seedIndex * 2 + 1).padStart(3, "0")}`,
    kind: "project",
    action: "status_changed",
    actorUserId: primaryActor.userId,
    projectPublicId: seed.id,
    projectName: seed.name,
    projectCategory: seed.category,
    fromValue: seed.previousStatus ?? "Review",
    toValue: project.status.label,
    createdAt: createdAtBase,
  });

  const secondaryEvent = (() => {
    const cycle = seedIndex % 4;
    if (cycle === 0) {
      const task = seedTasks[0];
      return activityBase({
        id: `act-${String(seedIndex * 2 + 2).padStart(3, "0")}`,
        kind: "task",
        action: "completed",
        actorUserId: secondaryActor.userId,
        projectPublicId: seed.id,
        projectName: seed.name,
        projectCategory: seed.category,
        taskId: task?.id ?? null,
        taskTitle: task?.title ?? "Task updated",
        createdAt: createdAtBase - 45 * 60_000,
      });
    }
    if (cycle === 1) {
      const file = seedFiles[0];
      return activityBase({
        id: `act-${String(seedIndex * 2 + 2).padStart(3, "0")}`,
        kind: "file",
        action: "uploaded",
        actorUserId: secondaryActor.userId,
        projectPublicId: seed.id,
        projectName: seed.name,
        projectCategory: seed.category,
        fileName: file?.name ?? "new-file.fig",
        fileTab: file?.tab ?? "Assets",
        createdAt: createdAtBase - 45 * 60_000,
      });
    }
    if (cycle === 2) {
      const comment = seedComments[0];
      return activityBase({
        id: `act-${String(seedIndex * 2 + 2).padStart(3, "0")}`,
        kind: "collaboration",
        action: "comment_added",
        actorUserId: secondaryActor.userId,
        projectPublicId: seed.id,
        projectName: seed.name,
        projectCategory: seed.category,
        message: comment?.content ?? "Comment added",
        createdAt: createdAtBase - 45 * 60_000,
      });
    }
    return activityBase({
      id: `act-${String(seedIndex * 2 + 2).padStart(3, "0")}`,
      kind: "membership",
      action: "joined",
      actorUserId: secondaryActor.userId,
      targetUserId: secondaryActor.userId,
      targetUserName: secondaryActor.name,
      targetRole: secondaryActor.role,
      createdAt: createdAtBase - 45 * 60_000,
    });
  })();

  return [statusEvent, secondaryEvent];
});

export const DEMO_ACTIVITIES: WorkspaceActivity[] = rawActivities
  .sort((left, right) => right.createdAt - left.createdAt)
  .slice(0, 24)
  .map((activity, index) => ({
    ...activity,
    isRead: index >= 9,
  }));

export const DEMO_APPROVAL_READS: Array<{
  projectPublicId: string;
  lastSeenApprovedAt: number;
}> = [];

// ── Bootstrap response shape ────────────────────────────
export const DEMO_BOOTSTRAP = {
  viewer: {
    id: DEMO_VIEWER.userId,
    workosUserId: DEMO_VIEWER.workosUserId,
    name: DEMO_VIEWER.name,
    email: DEMO_VIEWER.email,
    avatarUrl: DEMO_VIEWER.avatarUrl,
  },
  workspaces: DEMO_WORKSPACES.map((workspace) => ({
    slug: workspace.slug,
    name: workspace.name,
    plan: workspace.plan,
    logo: workspace.logo,
    logoColor: workspace.logoColor,
    logoText: workspace.logoText,
  })),
  activeWorkspace: {
    slug: DEMO_WORKSPACE.slug,
    name: DEMO_WORKSPACE.name,
    plan: DEMO_WORKSPACE.plan,
    logo: DEMO_WORKSPACE.logo,
    logoColor: DEMO_WORKSPACE.logoColor,
    logoText: DEMO_WORKSPACE.logoText,
    workosOrganizationId: "org-demo",
  },
  activeWorkspaceSlug: DEMO_WORKSPACE.slug,
};

// ── Settings ────────────────────────────────────────────
export const DEMO_ACCOUNT_SETTINGS = {
  firstName: "Nick",
  lastName: "Garreis",
  email: DEMO_VIEWER.email,
  avatarUrl: DEMO_VIEWER.avatarUrl,
  linkedIdentityProviders: ["google"],
};

export const DEMO_NOTIFICATION_SETTINGS = {
  events: {
    eventNotifications: true,
    teamActivities: true,
    productUpdates: false,
  },
  exists: true,
};

export const DEMO_COMPANY_SUMMARY = {
  workspace: {
    id: DEMO_WORKSPACE.id,
    slug: DEMO_WORKSPACE.slug,
    name: DEMO_WORKSPACE.name,
    plan: DEMO_WORKSPACE.plan,
    logo: DEMO_WORKSPACE.logo ?? null,
    logoColor: DEMO_WORKSPACE.logoColor ?? null,
    logoText: DEMO_WORKSPACE.logoText ?? null,
    workosOrganizationId: "org-demo",
  },
  capability: {
    hasOrganizationLink: true,
    canManageWorkspaceGeneral: true,
    canManageMembers: true,
    canManageBrandAssets: true,
    canDeleteWorkspace: true,
  },
  viewerRole: "owner",
};

export const DEMO_COMPANY_MEMBERS = DEMO_MEMBERS.map((member) => ({
  userId: member.userId,
  name: member.name,
  email: member.email,
  avatarUrl: member.avatarUrl,
  role: member.role,
  status: "active" as const,
}));

export const DEMO_PENDING_INVITATIONS = [
  {
    invitationId: "inv-demo-001",
    email: "newmember@superlane.demo",
    state: "pending" as const,
    requestedRole: "member" as const,
    expiresAt: new Date(now + 7 * DAY).toISOString(),
  },
];

export const DEMO_BRAND_ASSETS = [
  {
    id: "asset-demo-001",
    name: "Brand Guidelines.pdf",
    type: "PDF",
    mimeType: "application/pdf",
    sizeBytes: 1_520_000,
    displayDateEpochMs: now - 9 * DAY,
    downloadUrl: null,
  },
  {
    id: "asset-demo-002",
    name: "Color Palette.png",
    type: "PNG",
    mimeType: "image/png",
    sizeBytes: 182_000,
    displayDateEpochMs: now - 5 * DAY,
    downloadUrl: null,
  },
];
