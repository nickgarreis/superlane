export type AppView = "tasks" | "archive" | `project:${string}` | `archive-project:${string}`;

const archiveProjectPattern = /^\/archive\/([^/]+)$/;
const projectPattern = /^\/project\/([^/]+)$/;

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
    return `archive-project:${decodeURIComponent(archiveProjectMatch[1])}`;
  }

  const projectMatch = pathname.match(projectPattern);
  if (projectMatch) {
    return `project:${decodeURIComponent(projectMatch[1])}`;
  }

  return null;
};

export const isProtectedPath = (pathname: string): boolean =>
  pathname === "/tasks" ||
  pathname === "/archive" ||
  pathname === "/settings" ||
  archiveProjectPattern.test(pathname) ||
  projectPattern.test(pathname);
