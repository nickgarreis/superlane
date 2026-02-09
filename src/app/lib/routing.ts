export type AppView = "tasks" | "archive" | `project:${string}` | `archive-project:${string}`;

const archiveProjectPattern = /^\/archive\/([^/]+)$/;
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
  if (view.startsWith("archive-project:")) {
    const projectId = view.slice("archive-project:".length);
    return `/archive/${encodeURIComponent(projectId)}`;
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

  const archiveProjectMatch = pathname.match(archiveProjectPattern);
  if (archiveProjectMatch) {
    const decodedArchiveProjectId = safeDecodePathSegment(archiveProjectMatch[1]);
    if (decodedArchiveProjectId !== null) {
      return `archive-project:${decodedArchiveProjectId}`;
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
  pathname === "/settings" ||
  archiveProjectPattern.test(pathname) ||
  projectPattern.test(pathname);
