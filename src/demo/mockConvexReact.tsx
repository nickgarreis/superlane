/**
 * Mock replacement for "convex/react" in demo mode.
 * Vite aliases this module when VITE_DEMO_MODE=true.
 *
 * All hooks return demo seed data; mutations are interactive no-ops
 * that update local state (resets on page reload).
 */
import {
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEMO_BOOTSTRAP,
  DEMO_PROJECTS,
  DEMO_TASKS,
  DEMO_ACTIVITIES,
  DEMO_PROJECT_FILES,
  DEMO_MEMBERS,
  DEMO_ACCOUNT_SETTINGS,
  DEMO_NOTIFICATION_SETTINGS,
  DEMO_COMPANY_SUMMARY,
  DEMO_COMPANY_MEMBERS,
  DEMO_PENDING_INVITATIONS,
  DEMO_BRAND_ASSETS,
  DEMO_PROJECT_COMMENTS,
  DEMO_APPROVAL_READS,
  DEMO_VIEWER,
} from "./demoData";
import type { CollaborationComment } from "../app/types";

// ── Helpers ─────────────────────────────────────────────
const FN_NAME_SYM = Symbol.for("functionName");

function getFnName(ref: unknown): string {
  if (typeof ref === "string") {
    return ref;
  }
  if (!ref || typeof ref !== "object") {
    return "";
  }
  // Convex API refs are Proxies; "in" checks do not surface symbol-based names.
  const maybeName = (ref as Record<symbol, unknown>)[FN_NAME_SYM];
  if (typeof maybeName === "string") {
    return maybeName;
  }
  return "";
}

// ── In-memory store (interactive, resets on reload) ─────
type DemoStore = {
  tasks: typeof DEMO_TASKS;
  projects: typeof DEMO_PROJECTS;
  activities: typeof DEMO_ACTIVITIES;
  files: typeof DEMO_PROJECT_FILES;
  comments: typeof DEMO_PROJECT_COMMENTS;
  approvalReads: typeof DEMO_APPROVAL_READS;
};

type DemoComment = CollaborationComment;
type DemoCommentHistoryRow = {
  id: string;
  parentCommentId: string | null;
  author: DemoComment["author"];
  content: string;
  createdAtEpochMs: number;
  resolved: boolean;
  edited: boolean;
  reactions: NonNullable<DemoComment["reactions"]>;
  replies: DemoCommentHistoryRow[];
};

let _store: DemoStore = {
  tasks: [...DEMO_TASKS],
  projects: { ...DEMO_PROJECTS },
  activities: [...DEMO_ACTIVITIES],
  files: [...DEMO_PROJECT_FILES],
  comments: Object.fromEntries(
    Object.entries(DEMO_PROJECT_COMMENTS).map(([projectId, comments]) => [
      projectId,
      comments.map((comment) => ({ ...comment })),
    ]),
  ),
  approvalReads: [...DEMO_APPROVAL_READS],
};

type Listener = () => void;
const _listeners = new Set<Listener>();

function subscribe(listener: Listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

function getSnapshot() {
  return _store;
}

function updateStore(updater: (s: DemoStore) => DemoStore) {
  _store = updater(_store);
  for (const l of _listeners) l();
}

function useDemoStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

const normalizeProjectId = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

const commentTimestamp = (comment: DemoComment): number =>
  typeof comment.timestampEpochMs === "number"
    ? comment.timestampEpochMs
    : Date.now();

const mapCommentToFeedRow = (comment: DemoComment) => ({
  id: comment.id,
  author: comment.author,
  content: comment.content,
  createdAtEpochMs: commentTimestamp(comment),
  resolved: comment.resolved ?? false,
  edited: comment.edited ?? false,
  replyCount: comment.replies.length,
  reactions: comment.reactions ?? [],
});

const mapCommentToHistoryRow = (
  comment: DemoComment,
  parentCommentId: string | null,
): DemoCommentHistoryRow => ({
  id: comment.id,
  parentCommentId,
  author: comment.author,
  content: comment.content,
  createdAtEpochMs: commentTimestamp(comment),
  resolved: comment.resolved ?? false,
  edited: comment.edited ?? false,
  reactions: comment.reactions ?? [],
  replies: comment.replies.map((reply) => mapCommentToHistoryRow(reply, comment.id)),
});

const findCommentById = (
  commentsByProject: DemoStore["comments"],
  targetCommentId: string,
): DemoComment | null => {
  for (const comments of Object.values(commentsByProject)) {
    const stack: DemoComment[] = [...comments];
    while (stack.length > 0) {
      const current = stack.pop();
      if (!current) {
        continue;
      }
      if (current.id === targetCommentId) {
        return current;
      }
      stack.push(...current.replies);
    }
  }
  return null;
};

const unreadActivityCount = (activities: DemoStore["activities"]): number =>
  activities.reduce(
    (count, activity) => count + (activity.isRead === false ? 1 : 0),
    0,
  );

// ── Query router ────────────────────────────────────────
function resolveQuery(name: string, args: unknown, store: DemoStore): unknown {
  // Main bootstrap
  if (name === "dashboard:getWorkspaceBootstrap") return DEMO_BOOTSTRAP;

  // Projects (paginated → raw array returned here, wrapper builds pagination)
  if (name === "projects:listForWorkspace") {
    const a = args as { includeArchived?: boolean } | undefined;
    const includeArchived = a?.includeArchived === true;
    return Object.values(store.projects)
      .filter((p) => (includeArchived ? true : !p.archived))
      .map((p) => ({
        publicId: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        scope: p.scope,
        deadlineEpochMs: p.deadlineEpochMs,
        status: p.status.label,
        previousStatus: p.previousStatus?.label ?? null,
        archived: p.archived ?? false,
        archivedAt: p.archivedAt ?? null,
        completedAt: p.completedAt ?? null,
        lastApprovedAt: p.lastApprovedAt ?? null,
        draftData: p.draftData ?? null,
        attachments: p.attachments ?? [],
        reviewComments: p.comments ?? [],
        creator: p.creator
          ? { userId: p.creator.userId, name: p.creator.name, avatarUrl: p.creator.avatar || null }
          : undefined,
      }));
  }

  // Archived projects
  if (name === "projects:listArchivedForWorkspace") {
    return Object.values(store.projects)
      .filter((p) => p.archived)
      .map((p) => ({
        publicId: p.id,
        name: p.name,
        description: p.description,
        category: p.category,
        scope: p.scope,
        status: p.status.label,
        archived: true,
        archivedAt: p.archivedAt ?? null,
        creator: p.creator
          ? { userId: p.creator.userId, name: p.creator.name, avatarUrl: p.creator.avatar || null }
          : undefined,
      }));
  }

  // Tasks
  if (name === "tasks:listForWorkspace" || name === "tasks:listMutableForWorkspace") {
    return store.tasks.map((t) => ({
      projectPublicId: t.projectId ?? null,
      taskId: t.id,
      title: t.title,
      assignee: t.assignee,
      dueDateEpochMs: t.dueDateEpochMs ?? null,
      completed: t.completed,
    }));
  }

  if (name === "tasks:listForProject") {
    const a = args as { projectPublicId?: string } | undefined;
    const pid = a?.projectPublicId;
    return store.tasks
      .filter((t) => t.projectId === pid)
      .map((t) => ({
        projectPublicId: t.projectId ?? null,
        taskId: t.id,
        title: t.title,
        assignee: t.assignee,
        dueDateEpochMs: t.dueDateEpochMs ?? null,
        completed: t.completed,
      }));
  }

  // Activities
  if (name === "activities:listForWorkspace") {
    return store.activities;
  }

  // Files
  if (name === "files:listForWorkspace") {
    return store.files;
  }
  if (name === "files:listForProjectPaginated") {
    const a = args as { projectPublicId?: string } | undefined;
    const pid = a?.projectPublicId;
    return store.files.filter((f) => f.projectPublicId === pid);
  }

  // Settings
  if (name === "settings:getAccountSettings") return DEMO_ACCOUNT_SETTINGS;
  if (name === "settings:getNotificationPreferences") return DEMO_NOTIFICATION_SETTINGS;
  if (name === "settings:getCompanySettingsSummary") return DEMO_COMPANY_SUMMARY;
  if (name === "settings:listCompanyMembers") return DEMO_COMPANY_MEMBERS;
  if (name === "settings:listPendingInvitations") return DEMO_PENDING_INVITATIONS;
  if (name === "settings:listBrandAssets") return DEMO_BRAND_ASSETS;
  if (name === "settings:getBrandAssetDownloadUrl") {
    const a = args as { brandAssetId?: string } | undefined;
    const asset = DEMO_BRAND_ASSETS.find((entry) => entry.id === a?.brandAssetId);
    return { downloadUrl: asset?.downloadUrl ?? null };
  }

  // Collaboration
  if (name === "collaboration:listWorkspaceMembers") return DEMO_MEMBERS;

  // Comments
  if (name === "comments:listForProject") {
    const a = args as { projectPublicId?: string } | undefined;
    const projectId = normalizeProjectId(a?.projectPublicId);
    const comments = projectId ? (store.comments[projectId] ?? []) : [];
    return comments.map((c) => ({
      _id: c.id,
      authorUserId: c.author.userId,
      authorName: c.author.name,
      authorAvatarUrl: c.author.avatar || null,
      content: c.content,
      _creationTime: c.timestampEpochMs ?? Date.now(),
      resolved: c.resolved ?? false,
      edited: c.edited ?? false,
      replyToId: null,
      reactions: c.reactions ?? [],
    }));
  }
  if (name === "comments:listThreadsPaginated") {
    const a = args as { projectPublicId?: string } | undefined;
    const projectId = normalizeProjectId(a?.projectPublicId);
    const comments = projectId ? (store.comments[projectId] ?? []) : [];
    return [...comments]
      .sort((left, right) => commentTimestamp(right) - commentTimestamp(left))
      .map((comment) => mapCommentToFeedRow(comment));
  }
  if (name === "comments:listReplies") {
    const a = args as { parentCommentId?: string } | undefined;
    const parentCommentId =
      typeof a?.parentCommentId === "string" ? a.parentCommentId : null;
    const parentComment =
      parentCommentId == null ? null : findCommentById(store.comments, parentCommentId);
    const page = parentComment
      ? [...parentComment.replies]
          .sort((left, right) => commentTimestamp(left) - commentTimestamp(right))
          .map((comment) => mapCommentToFeedRow(comment))
      : [];
    return {
      page,
      isDone: true,
      continueCursor: "",
    };
  }
  if (name === "comments:listHistoryForProject") {
    const a = args as { projectPublicId?: string } | undefined;
    const projectId = normalizeProjectId(a?.projectPublicId);
    const comments = projectId ? (store.comments[projectId] ?? []) : [];
    return [...comments]
      .sort((left, right) => commentTimestamp(right) - commentTimestamp(left))
      .map((comment) => mapCommentToHistoryRow(comment, null));
  }

  // Inbox unread
  if (name === "activities:getUnreadSummary") {
    return { unreadCount: unreadActivityCount(store.activities) };
  }

  // Project approval reads
  if (
    name === "projects:getApprovalReads" ||
    name === "projects:listApprovalReadsForWorkspace"
  ) {
    return store.approvalReads;
  }

  // Viewer membership
  if (name === "collaboration:getViewerMembership") {
    return { role: "owner", status: "active" };
  }

  // Fallback
  return undefined;
}

type DemoTask = DemoStore["tasks"][number];
type DemoProject = DemoStore["projects"][string];
type DemoProjectStatus = "Draft" | "Review" | "Active" | "Completed";

const PROJECT_STATUS_STYLES: Record<DemoProjectStatus, DemoProject["status"]> = {
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
};

const parseProjectStatus = (value: unknown): DemoProjectStatus | null => {
  if (
    value === "Draft" ||
    value === "Review" ||
    value === "Active" ||
    value === "Completed"
  ) {
    return value;
  }
  return null;
};

const resolveProjectPublicIdFromArgs = (
  args: Record<string, unknown>,
): string | null => normalizeProjectId(args.publicId) ?? normalizeProjectId(args.projectPublicId);

const normalizeTaskProjectId = (value: unknown): string | undefined => {
  if (typeof value !== "string") {
    return undefined;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
};

const normalizeTaskAssignee = (
  value: unknown,
  fallback: DemoTask["assignee"],
): DemoTask["assignee"] => {
  if (!value || typeof value !== "object") {
    return fallback;
  }
  const candidate = value as Record<string, unknown>;
  const name =
    typeof candidate.name === "string" && candidate.name.trim().length > 0
      ? candidate.name
      : fallback.name;
  return {
    userId:
      typeof candidate.userId === "string" && candidate.userId.trim().length > 0
        ? candidate.userId
        : fallback.userId,
    name,
    avatar: typeof candidate.avatar === "string" ? candidate.avatar : fallback.avatar,
  };
};

const normalizeTaskDueDate = (
  value: unknown,
  fallback: number | null,
): number | null => {
  if (value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return fallback;
};

const normalizeOrderedTaskIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const entry of value) {
    if (typeof entry !== "string") {
      continue;
    }
    const taskId = entry.trim();
    if (!taskId || seen.has(taskId)) {
      continue;
    }
    seen.add(taskId);
    normalized.push(taskId);
  }
  return normalized;
};

const reorderDemoTasks = (
  tasks: DemoStore["tasks"],
  orderedTaskIds: string[],
): DemoStore["tasks"] => {
  if (orderedTaskIds.length === 0 || tasks.length === 0) {
    return tasks;
  }
  const taskById = new Map(tasks.map((task) => [task.id, task] as const));
  const ordered: DemoTask[] = [];
  const includedTaskIds = new Set<string>();
  for (const taskId of orderedTaskIds) {
    const task = taskById.get(taskId);
    if (!task) {
      continue;
    }
    ordered.push(task);
    includedTaskIds.add(task.id);
  }
  if (ordered.length === 0) {
    return tasks;
  }
  const remainder = tasks.filter((task) => !includedTaskIds.has(task.id));
  return [...ordered, ...remainder];
};

const normalizeProjectDeadline = (
  value: unknown,
  fallback: number | null,
): number | null => {
  if (value === null) {
    return null;
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  return fallback;
};

// ── Mutation router ─────────────────────────────────────
function resolveMutation(name: string, args: Record<string, unknown>) {
  if (name === "tasks:create") {
    const t = args as { title?: string; projectPublicId?: string; assigneeUserId?: string };
    const newTask = {
      id: `task-${Date.now()}`,
      title: t.title ?? "New task",
      projectId: t.projectPublicId ?? undefined,
      assignee: { userId: DEMO_VIEWER.userId!, name: DEMO_VIEWER.name, avatar: "" },
      dueDateEpochMs: null,
      completed: false,
    };
    updateStore((s) => ({ ...s, tasks: [...s.tasks, newTask] }));
    return newTask.id;
  }

  if (name === "tasks:update") {
    const a = args as { taskId?: string; completed?: boolean; title?: string; dueDateEpochMs?: number | null };
    if (a.taskId) {
      updateStore((s) => ({
        ...s,
        tasks: s.tasks.map((t) =>
          t.id === a.taskId
            ? {
                ...t,
                ...(a.completed !== undefined ? { completed: a.completed } : {}),
                ...(a.title !== undefined ? { title: a.title } : {}),
                ...(a.dueDateEpochMs !== undefined ? { dueDateEpochMs: a.dueDateEpochMs } : {}),
              }
            : t,
        ),
      }));
    }
    return null;
  }

  if (name === "tasks:remove") {
    const a = args as { taskId?: string };
    if (a.taskId) {
      updateStore((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== a.taskId) }));
    }
    return null;
  }

  if (name === "tasks:replaceForProject" || name === "tasks:replaceForWorkspace") {
    // Accept task arrays for drag-and-drop reordering
    return null;
  }

  if (name === "tasks:applyDiff") {
    const creates = Array.isArray(args.creates) ? args.creates : [];
    const updates = Array.isArray(args.updates) ? args.updates : [];
    const orderedTaskIds = normalizeOrderedTaskIds(args.orderedTaskIds);
    const removeTaskIds = new Set<string>(
      (Array.isArray(args.removes) ? args.removes : [])
        .filter((entry): entry is string => typeof entry === "string")
        .map((taskId) => taskId.trim())
        .filter((taskId) => taskId.length > 0),
    );

    let createdCount = 0;
    let updatedCount = 0;
    let removedCount = 0;

    updateStore((s) => {
      const nextTasks = [...s.tasks];
      const taskIndexById = new Map(
        nextTasks.map((task, index) => [task.id, index] as const),
      );

      for (const create of creates) {
        if (!create || typeof create !== "object") {
          continue;
        }
        const payload = create as Record<string, unknown>;
        const taskId =
          typeof payload.id === "string" ? payload.id.trim() : "";
        if (!taskId || taskIndexById.has(taskId)) {
          continue;
        }
        const projectId =
          payload.projectPublicId !== undefined
            ? normalizeTaskProjectId(payload.projectPublicId)
            : normalizeTaskProjectId(payload.projectId);
        nextTasks.push({
          id: taskId,
          title:
            typeof payload.title === "string" && payload.title.trim().length > 0
              ? payload.title
              : "New task",
          projectId,
          assignee: normalizeTaskAssignee(payload.assignee, {
            userId: DEMO_VIEWER.userId ?? undefined,
            name: DEMO_VIEWER.name,
            avatar: "",
          }),
          dueDateEpochMs: normalizeTaskDueDate(payload.dueDateEpochMs, null),
          completed: payload.completed === true,
        });
        taskIndexById.set(taskId, nextTasks.length - 1);
        createdCount += 1;
      }

      for (const update of updates) {
        if (!update || typeof update !== "object") {
          continue;
        }
        const payload = update as Record<string, unknown>;
        const taskId =
          typeof payload.taskId === "string" ? payload.taskId.trim() : "";
        const taskIndex = taskIndexById.get(taskId);
        if (!taskId || taskIndex === undefined) {
          continue;
        }
        const current = nextTasks[taskIndex];
        const nextProjectId =
          payload.projectPublicId !== undefined
            ? normalizeTaskProjectId(payload.projectPublicId)
            : payload.projectId !== undefined
              ? normalizeTaskProjectId(payload.projectId)
              : current.projectId;
        nextTasks[taskIndex] = {
          ...current,
          ...(payload.title !== undefined &&
          typeof payload.title === "string" &&
          payload.title.trim().length > 0
            ? { title: payload.title }
            : {}),
          ...(payload.assignee !== undefined
            ? { assignee: normalizeTaskAssignee(payload.assignee, current.assignee) }
            : {}),
          ...(payload.completed !== undefined
            ? { completed: payload.completed === true }
            : {}),
          ...(payload.dueDateEpochMs !== undefined
            ? {
                dueDateEpochMs: normalizeTaskDueDate(
                  payload.dueDateEpochMs,
                  current.dueDateEpochMs ?? null,
                ),
              }
            : {}),
          ...(payload.projectPublicId !== undefined || payload.projectId !== undefined
            ? { projectId: nextProjectId }
            : {}),
        };
        updatedCount += 1;
      }

      let changedTasks = nextTasks;
      if (removeTaskIds.size > 0) {
        changedTasks = nextTasks.filter((task) => {
          const shouldRemove = removeTaskIds.has(task.id);
          if (shouldRemove) {
            removedCount += 1;
          }
          return !shouldRemove;
        });
      }

      changedTasks = reorderDemoTasks(changedTasks, orderedTaskIds);
      return { ...s, tasks: changedTasks };
    });

    return {
      created: createdCount,
      updated: updatedCount,
      removed: removedCount,
      reordered: orderedTaskIds.length,
    };
  }

  if (name === "tasks:reorder") {
    const orderedTaskIds = normalizeOrderedTaskIds(args.orderedTaskIds);
    updateStore((s) => ({
      ...s,
      tasks: reorderDemoTasks(s.tasks, orderedTaskIds),
    }));
    return {
      reordered: orderedTaskIds.length,
    };
  }

  if (name === "projects:create") {
    const now = Date.now();
    const requestedPublicId = normalizeProjectId(args.publicId);
    const status = parseProjectStatus(args.status) ?? "Draft";
    const projectName =
      typeof args.name === "string" && args.name.trim().length > 0
        ? args.name
        : "Untitled Project";

    let publicId = requestedPublicId ?? `project-${now}`;

    updateStore((s) => {
      if (s.projects[publicId]) {
        const base = publicId;
        let suffix = 2;
        while (s.projects[`${base}-${suffix}`]) {
          suffix += 1;
        }
        publicId = `${base}-${suffix}`;
      }
      const nextProject: DemoProject = {
        id: publicId,
        name: projectName,
        description:
          typeof args.description === "string" ? args.description : "",
        creator: {
          userId: DEMO_VIEWER.userId ?? undefined,
          name: DEMO_VIEWER.name,
          avatar: DEMO_VIEWER.avatarUrl ?? "",
        },
        status: PROJECT_STATUS_STYLES[status],
        category:
          typeof args.category === "string" && args.category.trim().length > 0
            ? args.category
            : "General",
        scope:
          typeof args.scope === "string" && args.scope.trim().length > 0
            ? args.scope
            : undefined,
        deadlineEpochMs: normalizeProjectDeadline(args.deadlineEpochMs, null),
        workspaceId:
          typeof DEMO_BOOTSTRAP.activeWorkspaceSlug === "string"
            ? DEMO_BOOTSTRAP.activeWorkspaceSlug
            : "demo-workspace",
        archived: false,
        archivedAt: null,
        completedAt: status === "Completed" ? now : null,
        lastApprovedAt: null,
        ...(args.draftData !== undefined && args.draftData !== null
          ? { draftData: args.draftData as DemoProject["draftData"] }
          : {}),
        ...(Array.isArray(args.reviewComments)
          ? { comments: args.reviewComments as DemoProject["comments"] }
          : {}),
      };
      return {
        ...s,
        projects: {
          ...s.projects,
          [publicId]: nextProject,
        },
      };
    });

    return { projectId: publicId, publicId };
  }

  if (name === "projects:update") {
    const publicId = resolveProjectPublicIdFromArgs(args);
    if (!publicId) {
      return null;
    }

    updateStore((s) => {
      const project = s.projects[publicId];
      if (!project) {
        return s;
      }
      const now = Date.now();
      const nextStatus = parseProjectStatus(args.status);
      const currentStatus = parseProjectStatus(project.status.label) ?? "Active";
      const shouldUpdateStatus = nextStatus !== null;

      const nextProject: DemoProject = {
        ...project,
        ...(args.name !== undefined && typeof args.name === "string"
          ? { name: args.name }
          : {}),
        ...(args.description !== undefined && typeof args.description === "string"
          ? { description: args.description }
          : {}),
        ...(args.category !== undefined && typeof args.category === "string"
          ? { category: args.category }
          : {}),
        ...(args.scope !== undefined
          ? {
              scope:
                typeof args.scope === "string" && args.scope.trim().length > 0
                  ? args.scope
                  : undefined,
            }
          : {}),
        ...(args.deadlineEpochMs !== undefined
          ? {
              deadlineEpochMs: normalizeProjectDeadline(
                args.deadlineEpochMs,
                project.deadlineEpochMs ?? null,
              ),
            }
          : {}),
        ...(args.draftData !== undefined
          ? {
              draftData:
                args.draftData && typeof args.draftData === "object"
                  ? (args.draftData as DemoProject["draftData"])
                  : undefined,
            }
          : {}),
        ...(args.reviewComments !== undefined
          ? {
              comments: Array.isArray(args.reviewComments)
                ? (args.reviewComments as DemoProject["comments"])
                : [],
            }
          : {}),
        ...(shouldUpdateStatus
          ? {
              status: PROJECT_STATUS_STYLES[nextStatus],
              archived: false,
              archivedAt: null,
              previousStatus: undefined,
              completedAt: nextStatus === "Completed" ? now : null,
              lastApprovedAt:
                currentStatus === "Review" && nextStatus === "Active"
                  ? now
                  : null,
            }
          : {}),
      };

      return {
        ...s,
        projects: {
          ...s.projects,
          [publicId]: nextProject,
        },
      };
    });

    return { publicId };
  }

  if (name === "projects:setStatus") {
    const projectId = resolveProjectPublicIdFromArgs(args);
    const nextStatus = parseProjectStatus(args.status);
    if (projectId && nextStatus) {
      updateStore((s) => {
        const p = s.projects[projectId];
        if (!p) return s;
        const now = Date.now();
        const currentStatus = parseProjectStatus(p.status.label) ?? "Active";
        return {
          ...s,
          projects: {
            ...s.projects,
            [projectId]: {
              ...p,
              previousStatus: undefined,
              status: PROJECT_STATUS_STYLES[nextStatus],
              archived: false,
              archivedAt: null,
              completedAt: nextStatus === "Completed" ? now : null,
              lastApprovedAt:
                currentStatus === "Review" && nextStatus === "Active"
                  ? now
                  : null,
            },
          },
        };
      });
      return { publicId: projectId };
    }
    return null;
  }

  if (name === "projects:archive") {
    const projectId = resolveProjectPublicIdFromArgs(args);
    if (projectId) {
      updateStore((s) => {
        const p = s.projects[projectId];
        if (!p) return s;
        return {
          ...s,
          projects: {
            ...s.projects,
            [projectId]: {
              ...p,
              archived: true,
              archivedAt: Date.now(),
              previousStatus: p.status,
            },
          },
        };
      });
      return { publicId: projectId };
    }
    return null;
  }

  if (name === "projects:unarchive") {
    const projectId = resolveProjectPublicIdFromArgs(args);
    if (projectId) {
      updateStore((s) => {
        const p = s.projects[projectId];
        if (!p) return s;
        return {
          ...s,
          projects: {
            ...s.projects,
            [projectId]: {
              ...p,
              archived: false,
              archivedAt: null,
              status: PROJECT_STATUS_STYLES.Active,
              previousStatus: undefined,
              completedAt: null,
              lastApprovedAt: null,
            },
          },
        };
      });
      return { publicId: projectId };
    }
    return null;
  }

  if (name === "projects:updateReviewComments") {
    const projectId = resolveProjectPublicIdFromArgs(args);
    if (!projectId) {
      return null;
    }
    updateStore((s) => {
      const project = s.projects[projectId];
      if (!project) {
        return s;
      }
      return {
        ...s,
        projects: {
          ...s.projects,
          [projectId]: {
            ...project,
            comments: Array.isArray(args.comments)
              ? (args.comments as DemoProject["comments"])
              : [],
          },
        },
      };
    });
    return { publicId: projectId };
  }

  if (name === "projects:markApprovalSeen") {
    const a = args as { publicId?: string; projectPublicId?: string };
    const projectId = a.publicId ?? a.projectPublicId;
    if (!projectId) {
      return { markedSeen: false, lastSeenApprovedAt: null };
    }
    const project = getSnapshot().projects[projectId];
    if (!project || typeof project.lastApprovedAt !== "number") {
      return { markedSeen: false, lastSeenApprovedAt: null };
    }
    updateStore((s) => {
      const existingIndex = s.approvalReads.findIndex(
        (read) => read.projectPublicId === projectId,
      );
      if (existingIndex === -1) {
        return {
          ...s,
          approvalReads: [
            ...s.approvalReads,
            {
              projectPublicId: projectId,
              lastSeenApprovedAt: project.lastApprovedAt ?? 0,
            },
          ],
        };
      }
      const nextReads = [...s.approvalReads];
      nextReads[existingIndex] = {
        ...nextReads[existingIndex],
        lastSeenApprovedAt: project.lastApprovedAt ?? 0,
      };
      return {
        ...s,
        approvalReads: nextReads,
      };
    });
    return {
      publicId: projectId,
      markedSeen: true,
      lastSeenApprovedAt: project.lastApprovedAt,
    };
  }

  if (name === "projects:remove") {
    const projectId = resolveProjectPublicIdFromArgs(args);
    if (!projectId) {
      return null;
    }
    updateStore((s) => {
      if (!s.projects[projectId]) {
        return s;
      }
      const nextProjects = { ...s.projects };
      delete nextProjects[projectId];
      return {
        ...s,
        projects: nextProjects,
        tasks: s.tasks.filter((task) => task.projectId !== projectId),
        files: s.files.filter((file) => file.projectPublicId !== projectId),
        comments: Object.fromEntries(
          Object.entries(s.comments).filter(
            ([existingProjectId]) => existingProjectId !== projectId,
          ),
        ),
        approvalReads: s.approvalReads.filter(
          (read) => read.projectPublicId !== projectId,
        ),
      };
    });
    return { publicId: projectId };
  }

  if (name === "activities:markActivityRead") {
    const a = args as { activityEventId?: string };
    if (!a.activityEventId) {
      return { unreadCount: unreadActivityCount(getSnapshot().activities) };
    }
    updateStore((s) => ({
      ...s,
      activities: s.activities.map((activity) =>
        activity.id === a.activityEventId
          ? { ...activity, isRead: true }
          : activity,
      ),
    }));
    return { unreadCount: unreadActivityCount(getSnapshot().activities) };
  }

  if (name === "activities:dismissActivity") {
    const a = args as { activityEventId?: string };
    if (!a.activityEventId) {
      return { unreadCount: unreadActivityCount(getSnapshot().activities) };
    }
    updateStore((s) => ({
      ...s,
      activities: s.activities.filter((activity) => activity.id !== a.activityEventId),
    }));
    return { unreadCount: unreadActivityCount(getSnapshot().activities) };
  }

  if (name === "activities:markAllRead") {
    updateStore((s) => ({
      ...s,
      activities: s.activities.map((activity) => ({ ...activity, isRead: true })),
    }));
    return { unreadCount: 0 };
  }

  // Default: no-op
  return null;
}

// ── Public API (drop-in for convex/react) ───────────────

export class ConvexReactClient {
  url: string;
  constructor(url: string) {
    this.url = url;
  }
}

// Auth
export function useConvexAuth() {
  return { isAuthenticated: true, isLoading: false };
}

// Client ref (some code calls useConvex().query etc.)
const _mockClient = {
  query: async (queryRef: unknown, args?: unknown) =>
    resolveQuery(getFnName(queryRef), args, getSnapshot()),
  mutation: async (mutationRef: unknown, args: Record<string, unknown> = {}) =>
    resolveMutation(getFnName(mutationRef), args),
  action: async (actionRef: unknown, args: Record<string, unknown> = {}) => {
    const name = getFnName(actionRef);
    if (name === "workspaces:ensureDefaultWorkspace") {
      return { slug: "demo-workspace" };
    }
    if (name === "workspaces:create") {
      return { slug: "new-workspace" };
    }
    if (name === "workspaces:ensureOrganizationLink") {
      return { alreadyLinked: true };
    }
    if (name === "auth:syncCurrentUserLinkedIdentityProviders") {
      return { synced: true, linkedIdentityProviders: ["google"] };
    }
    if (name === "auth:requestPasswordReset") {
      return { accepted: true };
    }
    return resolveMutation(name, args);
  },
};
export function useConvex() {
  return _mockClient as unknown;
}

// Provider — just renders children
export function ConvexProviderWithAuth({
  children,
}: {
  children: ReactNode;
  client?: unknown;
  useAuth?: unknown;
}) {
  return <>{children}</>;
}

export function ConvexProvider({
  children,
}: {
  children: ReactNode;
  client?: unknown;
}) {
  return <>{children}</>;
}

// useQuery
export function useQuery(queryRef: unknown, args?: unknown): unknown {
  const store = useDemoStore();
  const name = getFnName(queryRef);

  // "skip" sentinel → return undefined (loading state, never resolves)
  if (args === "skip") return undefined;

  return resolveQuery(name, args, store);
}

// usePaginatedQuery
export function usePaginatedQuery(
  queryRef: unknown,
  args?: unknown,
  _opts?: { initialNumItems?: number },
) {
  const store = useDemoStore();
  const name = getFnName(queryRef);

  if (args === "skip") {
    return {
      results: [],
      status: "LoadingFirstPage" as const,
      loadMore: () => {},
      isLoading: true,
    };
  }

  const data = resolveQuery(name, args, store);
  const results = Array.isArray(data) ? data : [];

  return {
    results,
    status: "Exhausted" as const,
    loadMore: () => {},
    isLoading: false,
  };
}

// useMutation
export function useMutation(mutationRef: unknown) {
  const name = getFnName(mutationRef);
  return useCallback(
    async (args: Record<string, unknown> = {}) => {
      return resolveMutation(name, args);
    },
    [name],
  );
}

// useAction (same as mutation for demo purposes)
export function useAction(actionRef: unknown) {
  const name = getFnName(actionRef);
  return useCallback(
    async (args: Record<string, unknown> = {}) => {
      // Actions that need specific return values
      if (name === "workspaces:ensureDefaultWorkspace") {
        return { slug: "demo-workspace" };
      }
      if (name === "workspaces:create") {
        return { slug: "new-workspace" };
      }
      if (name === "workspaces:ensureOrganizationLink") {
        return { alreadyLinked: true };
      }
      if (name === "auth:syncCurrentUserLinkedIdentityProviders") {
        return { synced: true, linkedIdentityProviders: ["google"] };
      }
      if (name === "auth:requestPasswordReset") {
        return { accepted: true };
      }
      return resolveMutation(name, args ?? {});
    },
    [name],
  );
}

// Re-export things that some files import from convex/react
export { type ReactNode };
