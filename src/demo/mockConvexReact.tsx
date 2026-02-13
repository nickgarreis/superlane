/**
 * Mock replacement for "convex/react" in demo mode.
 * Vite aliases this module when VITE_DEMO_MODE=true.
 *
 * All hooks return demo seed data; mutations are interactive no-ops
 * that update local state (resets on page reload).
 */
import {
  createContext,
  useContext,
  useCallback,
  useRef,
  useState,
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
  DEMO_COMMENTS,
  DEMO_VIEWER,
} from "./demoData";

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
  comments: typeof DEMO_COMMENTS;
};

let _store: DemoStore = {
  tasks: [...DEMO_TASKS],
  projects: { ...DEMO_PROJECTS },
  activities: [...DEMO_ACTIVITIES],
  files: [...DEMO_PROJECT_FILES],
  comments: [...DEMO_COMMENTS],
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

// ── Query router ────────────────────────────────────────
function resolveQuery(name: string, args: unknown, store: DemoStore): unknown {
  // Main bootstrap
  if (name === "dashboard:getWorkspaceBootstrap") return DEMO_BOOTSTRAP;

  // Projects (paginated → raw array returned here, wrapper builds pagination)
  if (name === "projects:listForWorkspace") {
    return Object.values(store.projects)
      .filter((p) => !p.archived && p.status.label !== "Completed")
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
        archivedAt: null,
        completedAt: p.completedAt ?? null,
        lastApprovedAt: p.lastApprovedAt ?? null,
        draftData: p.draftData ?? null,
        attachments: p.attachments ?? [],
        reviewComments: p.comments ?? [],
        creator: p.creator
          ? { userId: p.creator.userId, name: p.creator.name, avatarUrl: null }
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
        archivedAt: p.completedAt,
        creator: p.creator
          ? { userId: p.creator.userId, name: p.creator.name, avatarUrl: null }
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
    return store.comments.map((c) => ({
      _id: c.id,
      authorUserId: c.author.userId,
      authorName: c.author.name,
      authorAvatarUrl: null,
      content: c.content,
      _creationTime: c.timestampEpochMs ?? Date.now(),
      resolved: c.resolved ?? false,
      edited: c.edited ?? false,
      replyToId: null,
      reactions: c.reactions ?? [],
    }));
  }
  if (name === "comments:listHistoryForProject") return [];

  // Inbox unread
  if (name === "activities:getUnreadSummary") return { unreadCount: 2 };

  // Project approval reads
  if (
    name === "projects:getApprovalReads" ||
    name === "projects:listApprovalReadsForWorkspace"
  ) {
    return [];
  }

  // Viewer membership
  if (name === "collaboration:getViewerMembership") {
    return { role: "owner", status: "active" };
  }

  // Fallback
  return undefined;
}

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

  if (name === "tasks:reorder" || name === "tasks:applyDiff") {
    return null;
  }

  if (name === "projects:setStatus") {
    const a = args as { projectPublicId?: string; status?: string };
    if (a.projectPublicId && a.status) {
      updateStore((s) => {
        const p = s.projects[a.projectPublicId!];
        if (!p) return s;
        const statusStyles: Record<string, typeof p.status> = {
          Draft: { label: "Draft", color: "var(--status-draft)", bgColor: "var(--status-draft-soft)", dotColor: "var(--status-draft-dot)" },
          Review: { label: "Review", color: "var(--status-review)", bgColor: "var(--status-review-soft)", dotColor: "var(--status-review-dot)" },
          Active: { label: "Active", color: "var(--status-active)", bgColor: "var(--status-active-soft)", dotColor: "var(--status-active-dot)" },
          Completed: { label: "Completed", color: "var(--status-completed)", bgColor: "var(--status-completed-soft)", dotColor: "var(--status-completed-dot)" },
        };
        return {
          ...s,
          projects: {
            ...s.projects,
            [a.projectPublicId!]: {
              ...p,
              previousStatus: p.status,
              status: statusStyles[a.status!] ?? p.status,
              ...(a.status === "Completed" ? { completedAt: Date.now() } : {}),
            },
          },
        };
      });
    }
    return null;
  }

  if (name === "projects:archive") {
    const a = args as { projectPublicId?: string };
    if (a.projectPublicId) {
      updateStore((s) => {
        const p = s.projects[a.projectPublicId!];
        if (!p) return s;
        return {
          ...s,
          projects: {
            ...s.projects,
            [a.projectPublicId!]: { ...p, archived: true },
          },
        };
      });
    }
    return null;
  }

  if (name === "projects:unarchive") {
    const a = args as { projectPublicId?: string };
    if (a.projectPublicId) {
      updateStore((s) => {
        const p = s.projects[a.projectPublicId!];
        if (!p) return s;
        return {
          ...s,
          projects: {
            ...s.projects,
            [a.projectPublicId!]: { ...p, archived: false },
          },
        };
      });
    }
    return null;
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
