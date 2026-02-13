/**
 * Demo seed data — resets on page reload.
 * All IDs are stable strings so components can reference them.
 */

import type {
  ProjectData,
  Task,
  WorkspaceActivity,
  ProjectFileData,
  ViewerIdentity,
  Workspace,
  WorkspaceMember,
  CollaborationComment,
} from "../app/types";

// ── Viewer ──────────────────────────────────────────────
export const DEMO_VIEWER: ViewerIdentity = {
  userId: "demo-user-001",
  workosUserId: "wos-demo-001",
  name: "Alex Demo",
  email: "alex@demo.superlane.de",
  avatarUrl: null,
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
    name: "Alex Demo",
    email: "alex@demo.superlane.de",
    avatarUrl: null,
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

const now = Date.now();
const DAY = 86_400_000;

// ── Projects ────────────────────────────────────────────
export const DEMO_PROJECTS: Record<string, ProjectData> = {
  "proj-client-portal": {
    id: "proj-client-portal",
    name: "Client Portal Redesign",
    description:
      "Full UX overhaul of the client-facing portal with improved navigation, file management, and real-time collaboration features.",
    creator: { userId: "demo-user-001", name: "Alex Demo", avatar: "" },
    status: statusStyles.Active,
    category: "Web Design",
    scope: "UX Audit + UI Production",
    deadlineEpochMs: now + 14 * DAY,
    workspaceId: "demo-workspace",
    archived: false,
  },
  "proj-brand-kit": {
    id: "proj-brand-kit",
    name: "Brand Kit Review",
    description:
      "Finalize the visual identity package — updated logo lockups, color accessibility checks, and typography guidance.",
    creator: { userId: "demo-user-002", name: "Sarah Chen", avatar: "" },
    status: statusStyles.Review,
    previousStatus: statusStyles.Active,
    category: "Branding",
    scope: "Logo + Color + Typography",
    deadlineEpochMs: now + 5 * DAY,
    workspaceId: "demo-workspace",
    archived: false,
    comments: [
      {
        id: "rc-1",
        author: { userId: "demo-user-003", name: "Max Weber", avatar: "" },
        content: "Logo lockups look great — the horizontal version needs a bit more breathing room on the left side.",
        timestamp: new Date(now - 2 * DAY).toISOString(),
      },
    ],
  },
  "proj-marketing-site": {
    id: "proj-marketing-site",
    name: "Marketing Site Draft",
    description:
      "Build a draft structure for the new campaign website including wireframes, messaging hierarchy, and content placeholders.",
    creator: { userId: "demo-user-001", name: "Alex Demo", avatar: "" },
    status: statusStyles.Draft,
    category: "Website Design",
    scope: "Wireframes + Copy Draft",
    deadlineEpochMs: now + 21 * DAY,
    workspaceId: "demo-workspace",
    archived: false,
    draftData: {
      selectedService: "Website Design",
      projectName: "Marketing Site Draft",
      selectedJob: "Full Website",
      description: "New campaign landing pages with conversion-optimized layouts.",
      isAIEnabled: false,
      deadlineEpochMs: now + 21 * DAY,
      lastStep: 2,
    },
  },
  "proj-email-templates": {
    id: "proj-email-templates",
    name: "Email Template System",
    description:
      "Design a modular email template system for transactional and marketing emails that maintains brand consistency.",
    creator: { userId: "demo-user-004", name: "Lisa Park", avatar: "" },
    status: statusStyles.Active,
    category: "Email Design",
    scope: "Template Library",
    deadlineEpochMs: now + 10 * DAY,
    workspaceId: "demo-workspace",
    archived: false,
  },
  "proj-mobile-kit": {
    id: "proj-mobile-kit",
    name: "Mobile UI Kit",
    description:
      "Comprehensive mobile UI component library with iOS and Android patterns.",
    creator: { userId: "demo-user-002", name: "Sarah Chen", avatar: "" },
    status: statusStyles.Completed,
    previousStatus: statusStyles.Active,
    category: "Product Design",
    scope: "Component Library",
    deadlineEpochMs: now - 3 * DAY,
    workspaceId: "demo-workspace",
    archived: false,
    completedAt: now - 1 * DAY,
  },
};

// ── Tasks ───────────────────────────────────────────────
export const DEMO_TASKS: Task[] = [
  {
    id: "task-001",
    title: "Finalize navigation structure",
    projectId: "proj-client-portal",
    assignee: { userId: "demo-user-001", name: "Alex Demo", avatar: "" },
    dueDateEpochMs: now + 3 * DAY,
    completed: false,
  },
  {
    id: "task-002",
    title: "Design file upload flow",
    projectId: "proj-client-portal",
    assignee: { userId: "demo-user-003", name: "Max Weber", avatar: "" },
    dueDateEpochMs: now + 5 * DAY,
    completed: false,
  },
  {
    id: "task-003",
    title: "Review color accessibility report",
    projectId: "proj-brand-kit",
    assignee: { userId: "demo-user-002", name: "Sarah Chen", avatar: "" },
    dueDateEpochMs: now + 2 * DAY,
    completed: false,
  },
  {
    id: "task-004",
    title: "Create typography scale document",
    projectId: "proj-brand-kit",
    assignee: { userId: "demo-user-004", name: "Lisa Park", avatar: "" },
    dueDateEpochMs: now + 4 * DAY,
    completed: true,
  },
  {
    id: "task-005",
    title: "Draft homepage wireframe",
    projectId: "proj-marketing-site",
    assignee: { userId: "demo-user-001", name: "Alex Demo", avatar: "" },
    dueDateEpochMs: now + 7 * DAY,
    completed: false,
  },
  {
    id: "task-006",
    title: "Build email header component",
    projectId: "proj-email-templates",
    assignee: { userId: "demo-user-004", name: "Lisa Park", avatar: "" },
    dueDateEpochMs: now + 6 * DAY,
    completed: false,
  },
  {
    id: "task-007",
    title: "Set up notification preferences UI",
    projectId: "proj-client-portal",
    assignee: { userId: "demo-user-002", name: "Sarah Chen", avatar: "" },
    dueDateEpochMs: now + 8 * DAY,
    completed: false,
  },
  {
    id: "task-008",
    title: "Prepare brand guidelines PDF",
    projectId: "proj-brand-kit",
    assignee: { userId: "demo-user-003", name: "Max Weber", avatar: "" },
    dueDateEpochMs: now - 1 * DAY,
    completed: true,
  },
  {
    id: "task-009",
    title: "Create A/B test variants for CTA section",
    projectId: "proj-marketing-site",
    assignee: { userId: "demo-user-003", name: "Max Weber", avatar: "" },
    dueDateEpochMs: now + 12 * DAY,
    completed: false,
  },
  {
    id: "task-010",
    title: "QA email rendering across clients",
    projectId: "proj-email-templates",
    assignee: { userId: "demo-user-001", name: "Alex Demo", avatar: "" },
    dueDateEpochMs: now + 9 * DAY,
    completed: false,
  },
];

// ── Activities ──────────────────────────────────────────
export const DEMO_ACTIVITIES: WorkspaceActivity[] = [
  {
    id: "act-001",
    kind: "project",
    action: "status_changed",
    actorType: "user",
    actorUserId: "demo-user-002",
    actorName: "Sarah Chen",
    actorAvatarUrl: null,
    projectPublicId: "proj-brand-kit",
    projectName: "Brand Kit Review",
    projectCategory: "Branding",
    projectVisibility: "workspace",
    projectOwnerUserId: null,
    taskId: null,
    taskTitle: null,
    fileName: null,
    fileTab: null,
    targetUserId: null,
    targetUserName: null,
    targetRole: null,
    fromValue: "Active",
    toValue: "Review",
    message: null,
    errorCode: null,
    createdAt: now - 2 * 3_600_000,
  },
  {
    id: "act-002",
    kind: "task",
    action: "completed",
    actorType: "user",
    actorUserId: "demo-user-004",
    actorName: "Lisa Park",
    actorAvatarUrl: null,
    projectPublicId: "proj-brand-kit",
    projectName: "Brand Kit Review",
    projectCategory: "Branding",
    projectVisibility: "workspace",
    projectOwnerUserId: null,
    taskId: "task-004",
    taskTitle: "Create typography scale document",
    fileName: null,
    fileTab: null,
    targetUserId: null,
    targetUserName: null,
    targetRole: null,
    fromValue: null,
    toValue: null,
    message: null,
    errorCode: null,
    createdAt: now - 4 * 3_600_000,
  },
  {
    id: "act-003",
    kind: "collaboration",
    action: "comment_added",
    actorType: "user",
    actorUserId: "demo-user-003",
    actorName: "Max Weber",
    actorAvatarUrl: null,
    projectPublicId: "proj-brand-kit",
    projectName: "Brand Kit Review",
    projectCategory: "Branding",
    projectVisibility: "workspace",
    projectOwnerUserId: null,
    taskId: null,
    taskTitle: null,
    fileName: null,
    fileTab: null,
    targetUserId: null,
    targetUserName: null,
    targetRole: null,
    fromValue: null,
    toValue: null,
    message: "Logo lockups look great — the horizontal version needs a bit more breathing room.",
    errorCode: null,
    createdAt: now - 6 * 3_600_000,
  },
  {
    id: "act-004",
    kind: "file",
    action: "uploaded",
    actorType: "user",
    actorUserId: "demo-user-001",
    actorName: "Alex Demo",
    actorAvatarUrl: null,
    projectPublicId: "proj-client-portal",
    projectName: "Client Portal Redesign",
    projectCategory: "Web Design",
    projectVisibility: "workspace",
    projectOwnerUserId: null,
    taskId: null,
    taskTitle: null,
    fileName: "dashboard-wireframe-v2.fig",
    fileTab: "Assets",
    targetUserId: null,
    targetUserName: null,
    targetRole: null,
    fromValue: null,
    toValue: null,
    message: null,
    errorCode: null,
    createdAt: now - 8 * 3_600_000,
  },
  {
    id: "act-005",
    kind: "membership",
    action: "joined",
    actorType: "user",
    actorUserId: "demo-user-004",
    actorName: "Lisa Park",
    actorAvatarUrl: null,
    projectPublicId: null,
    projectName: null,
    projectVisibility: "workspace",
    projectOwnerUserId: null,
    taskId: null,
    taskTitle: null,
    fileName: null,
    fileTab: null,
    targetUserId: "demo-user-004",
    targetUserName: "Lisa Park",
    targetRole: "member",
    fromValue: null,
    toValue: null,
    message: null,
    errorCode: null,
    createdAt: now - 24 * 3_600_000,
  },
];

// ── Files ───────────────────────────────────────────────
export const DEMO_PROJECT_FILES: ProjectFileData[] = [
  {
    id: "file-001",
    projectPublicId: "proj-client-portal",
    tab: "Assets",
    name: "dashboard-wireframe-v2.fig",
    type: "Figma",
    displayDateEpochMs: now - 2 * DAY,
    mimeType: "application/figma",
    sizeBytes: 2_400_000,
    downloadable: true,
  },
  {
    id: "file-002",
    projectPublicId: "proj-client-portal",
    tab: "Assets",
    name: "navigation-flow.png",
    type: "Image",
    displayDateEpochMs: now - 3 * DAY,
    mimeType: "image/png",
    sizeBytes: 890_000,
    downloadable: true,
  },
  {
    id: "file-003",
    projectPublicId: "proj-brand-kit",
    tab: "Assets",
    name: "logo-lockups-final.svg",
    type: "SVG",
    displayDateEpochMs: now - 1 * DAY,
    mimeType: "image/svg+xml",
    sizeBytes: 45_000,
    downloadable: true,
  },
  {
    id: "file-004",
    projectPublicId: "proj-brand-kit",
    tab: "Contract",
    name: "brand-guidelines-v1.pdf",
    type: "PDF",
    displayDateEpochMs: now - 4 * DAY,
    mimeType: "application/pdf",
    sizeBytes: 5_200_000,
    downloadable: true,
  },
  {
    id: "file-005",
    projectPublicId: "proj-email-templates",
    tab: "Assets",
    name: "email-components.fig",
    type: "Figma",
    displayDateEpochMs: now - 1 * DAY,
    mimeType: "application/figma",
    sizeBytes: 1_100_000,
    downloadable: true,
  },
];

// ── Comments (chat sidebar) ────────────────────────────
export const DEMO_COMMENTS: CollaborationComment[] = [
  {
    id: "comment-001",
    author: { userId: "demo-user-003", name: "Max Weber", avatar: "" },
    content: "The new navigation sidebar feels much more intuitive. Love the collapsible sections.",
    timestamp: new Date(now - 5 * 3_600_000).toISOString(),
    timestampEpochMs: now - 5 * 3_600_000,
    replies: [
      {
        id: "comment-001-reply-1",
        author: { userId: "demo-user-001", name: "Alex Demo", avatar: "" },
        content: "Thanks! I added the keyboard shortcuts too — try Cmd+K for search.",
        timestamp: new Date(now - 4 * 3_600_000).toISOString(),
        timestampEpochMs: now - 4 * 3_600_000,
        replies: [],
      },
    ],
    resolved: false,
    reactions: [{ emoji: "👍", users: ["Sarah Chen"], userIds: ["demo-user-002"] }],
  },
  {
    id: "comment-002",
    author: { userId: "demo-user-002", name: "Sarah Chen", avatar: "" },
    content: "Can we schedule a review for the file upload flow? I have some UX feedback.",
    timestamp: new Date(now - 3 * 3_600_000).toISOString(),
    timestampEpochMs: now - 3 * 3_600_000,
    replies: [],
    resolved: false,
  },
  {
    id: "comment-003",
    author: { userId: "demo-user-004", name: "Lisa Park", avatar: "" },
    content: "Typography scale is finalized — uploaded the reference doc to the brand kit project.",
    timestamp: new Date(now - 1 * 3_600_000).toISOString(),
    timestampEpochMs: now - 1 * 3_600_000,
    replies: [],
    resolved: true,
  },
];

// ── Bootstrap response shape ────────────────────────────
export const DEMO_BOOTSTRAP = {
  viewer: {
    id: DEMO_VIEWER.userId,
    workosUserId: DEMO_VIEWER.workosUserId,
    name: DEMO_VIEWER.name,
    email: DEMO_VIEWER.email,
    avatarUrl: DEMO_VIEWER.avatarUrl,
  },
  workspaces: DEMO_WORKSPACES.map((w) => ({
    slug: w.slug,
    name: w.name,
    plan: w.plan,
    logo: w.logo,
    logoColor: w.logoColor,
    logoText: w.logoText,
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
  firstName: "Alex",
  lastName: "Demo",
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
