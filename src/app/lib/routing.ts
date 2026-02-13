export type AppView =
  | "tasks"
  | "archive"
  | "completed"
  | "drafts"
  | "pending"
  | `project:${string}`
  | `completed-project:${string}`
  | `archive-project:${string}`
  | `draft-project:${string}`
  | `pending-project:${string}`;
const completedProjectPattern = /^\/completed\/([^/]+)$/;
const archiveProjectPattern = /^\/archive\/([^/]+)$/;
const draftProjectPattern = /^\/drafts\/([^/]+)$/;
const pendingProjectPattern = /^\/pending\/([^/]+)$/;
const projectPattern = /^\/project\/([^/]+)$/;
const safeDecodePathSegment = (value: string): string | null => {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
};
export const viewToPath = (view: AppView): string => {
  if (view === "tasks") {
    return "/tasks";
  }
  if (view === "archive") {
    return "/archive";
  }
  if (view === "completed") {
    return "/completed";
  }
  if (view === "drafts") {
    return "/drafts";
  }
  if (view === "pending") {
    return "/pending";
  }
  if (view.startsWith("completed-project:")) {
    const projectId = view.slice("completed-project:".length);
    return `/completed/${encodeURIComponent(projectId)}`;
  }
  if (view.startsWith("archive-project:")) {
    const projectId = view.slice("archive-project:".length);
    return `/archive/${encodeURIComponent(projectId)}`;
  }
  if (view.startsWith("draft-project:")) {
    const projectId = view.slice("draft-project:".length);
    return `/drafts/${encodeURIComponent(projectId)}`;
  }
  if (view.startsWith("pending-project:")) {
    const projectId = view.slice("pending-project:".length);
    return `/pending/${encodeURIComponent(projectId)}`;
  }
  const projectId = view.slice("project:".length);
  return `/project/${encodeURIComponent(projectId)}`;
};
export const pathToView = (pathname: string): AppView | null => {
  if (pathname === "/tasks") {
    return "tasks";
  }
  if (pathname === "/archive") {
    return "archive";
  }
  if (pathname === "/completed") {
    return "completed";
  }
  if (pathname === "/drafts") {
    return "drafts";
  }
  if (pathname === "/pending") {
    return "pending";
  }
  const completedProjectMatch = pathname.match(completedProjectPattern);
  if (completedProjectMatch) {
    const decodedCompletedProjectId = safeDecodePathSegment(
      completedProjectMatch[1],
    );
    if (decodedCompletedProjectId !== null) {
      return `completed-project:${decodedCompletedProjectId}`;
    }
  }
  const archiveProjectMatch = pathname.match(archiveProjectPattern);
  if (archiveProjectMatch) {
    const decodedArchiveProjectId = safeDecodePathSegment(
      archiveProjectMatch[1],
    );
    if (decodedArchiveProjectId !== null) {
      return `archive-project:${decodedArchiveProjectId}`;
    }
  }
  const draftProjectMatch = pathname.match(draftProjectPattern);
  if (draftProjectMatch) {
    const decodedDraftProjectId = safeDecodePathSegment(draftProjectMatch[1]);
    if (decodedDraftProjectId !== null) {
      return `draft-project:${decodedDraftProjectId}`;
    }
  }
  const pendingProjectMatch = pathname.match(pendingProjectPattern);
  if (pendingProjectMatch) {
    const decodedPendingProjectId = safeDecodePathSegment(
      pendingProjectMatch[1],
    );
    if (decodedPendingProjectId !== null) {
      return `pending-project:${decodedPendingProjectId}`;
    }
  }
  const projectMatch = pathname.match(projectPattern);
  if (projectMatch) {
    const decodedProjectId = safeDecodePathSegment(projectMatch[1]);
    if (decodedProjectId !== null) {
      return `project:${decodedProjectId}`;
    }
  }
  return null;
};
export const isProtectedPath = (pathname: string): boolean =>
  pathname === "/tasks" ||
  pathname === "/archive" ||
  pathname === "/completed" ||
  pathname === "/drafts" ||
  pathname === "/pending" ||
  pathname === "/settings" ||
  completedProjectPattern.test(pathname) ||
  archiveProjectPattern.test(pathname) ||
  draftProjectPattern.test(pathname) ||
  pendingProjectPattern.test(pathname) ||
  projectPattern.test(pathname);
