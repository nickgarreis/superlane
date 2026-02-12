import { useCallback, useEffect, useRef } from "react";
import { viewToPath, type AppView } from "../../lib/routing";
import type { ProjectData } from "../../types";

type ProjectsPaginationStatus =
  | "LoadingFirstPage"
  | "CanLoadMore"
  | "LoadingMore"
  | "Exhausted";

type UseDraftReviewProjectRouteGuardArgs = {
  currentView: AppView;
  locationPathname: string;
  projects: Record<string, ProjectData>;
  orderedProjectIds: string[];
  projectsPaginationStatus: ProjectsPaginationStatus;
  openCompletedProjectsPopup: () => void;
  navigateToPath: (path: string, replace?: boolean) => void;
};

const PROJECT_VIEW_PREFIX = "project:";
const TASKS_PATH = viewToPath("tasks");
const PROJECT_PATH_PREFIX = "/project/";
const isProjectRoute = (path: string) => path.startsWith(PROJECT_PATH_PREFIX);
const decodeProjectIdFromPath = (path: string): string | null => {
  if (!isProjectRoute(path)) {
    return null;
  }
  const encodedProjectId =
    path.slice(PROJECT_PATH_PREFIX.length).split("/", 1)[0] ?? "";
  try {
    return decodeURIComponent(encodedProjectId);
  } catch {
    return null;
  }
};
const buildDraftPendingDetailPath = (
  projectId: string,
  status: "Draft" | "Review",
  fromPath: string,
) => {
  const detailView: AppView =
    status === "Draft"
      ? `draft-project:${projectId}`
      : `pending-project:${projectId}`;
  const params = new URLSearchParams({ from: fromPath });
  return `${viewToPath(detailView)}?${params.toString()}`;
};
const isDedicatedProjectDetailCandidate = (
  project: ProjectData | undefined,
) =>
  Boolean(
    project &&
      !project.archived &&
      project.status.label !== "Draft" &&
      project.status.label !== "Review" &&
      project.status.label !== "Completed",
  );

export const useDraftReviewProjectRouteGuard = ({
  currentView,
  locationPathname,
  projects,
  orderedProjectIds,
  projectsPaginationStatus,
  openCompletedProjectsPopup,
  navigateToPath,
}: UseDraftReviewProjectRouteGuardArgs) => {
  const handledPathRef = useRef<string | null>(null);
  const previousPathRef = useRef<string | null>(null);
  const lastOriginPathRef = useRef<string>(TASKS_PATH);
  const projectCacheRef = useRef<Record<string, ProjectData>>({});
  const routeProjectStatusRef = useRef<{
    path: string | null;
    status: string | null;
  }>({
    path: null,
    status: null,
  });

  for (const [projectId, project] of Object.entries(projects)) {
    projectCacheRef.current[projectId] = project;
  }

  if (previousPathRef.current !== locationPathname) {
    const previousPath = previousPathRef.current;
    if (previousPath) {
      if (!isProjectRoute(previousPath)) {
        lastOriginPathRef.current = previousPath;
      } else {
        const previousProjectId = decodeProjectIdFromPath(previousPath);
        if (previousProjectId) {
          const previousProject =
            projects[previousProjectId] ?? projectCacheRef.current[previousProjectId];
          if (isDedicatedProjectDetailCandidate(previousProject)) {
            lastOriginPathRef.current = previousPath;
          }
        }
      }
    }
    previousPathRef.current = locationPathname;
  }

  const resolveNextActiveProjectPath = useCallback(
    (currentProjectId: string): string => {
      const allProjectIds: string[] = [];
      const seenProjectIds = new Set<string>();
      const appendProjectId = (projectId: string) => {
        if (seenProjectIds.has(projectId)) {
          return;
        }
        seenProjectIds.add(projectId);
        allProjectIds.push(projectId);
      };

      for (const projectId of orderedProjectIds) {
        appendProjectId(projectId);
      }
      for (const projectId of Object.keys(projects)) {
        appendProjectId(projectId);
      }
      for (const projectId of Object.keys(projectCacheRef.current)) {
        appendProjectId(projectId);
      }

      const currentIndex = allProjectIds.indexOf(currentProjectId);
      const candidateOrder =
        currentIndex >= 0
          ? [
              ...allProjectIds.slice(currentIndex + 1),
              ...allProjectIds.slice(0, currentIndex),
            ]
          : allProjectIds;

      for (const projectId of candidateOrder) {
        if (projectId === currentProjectId) {
          continue;
        }
        const candidate = projects[projectId] ?? projectCacheRef.current[projectId];
        if (!isDedicatedProjectDetailCandidate(candidate)) {
          continue;
        }
        return `${PROJECT_PATH_PREFIX}${encodeURIComponent(projectId)}`;
      }

      return TASKS_PATH;
    },
    [orderedProjectIds, projects],
  );

  useEffect(() => {
    if (
      !currentView.startsWith(PROJECT_VIEW_PREFIX) ||
      !locationPathname.startsWith(PROJECT_PATH_PREFIX)
    ) {
      handledPathRef.current = null;
      routeProjectStatusRef.current = { path: null, status: null };
      return;
    }

    if (projectsPaginationStatus === "LoadingFirstPage") {
      return;
    }

    const projectId = currentView.slice(PROJECT_VIEW_PREFIX.length);
    const project = projects[projectId] ?? projectCacheRef.current[projectId];
    if (!project || project.archived) {
      handledPathRef.current = null;
      routeProjectStatusRef.current = { path: null, status: null };
      return;
    }

    const previousStatusOnPath =
      routeProjectStatusRef.current.path === locationPathname
        ? routeProjectStatusRef.current.status
        : null;
    routeProjectStatusRef.current = {
      path: locationPathname,
      status: project.status.label,
    };

    const isDraft = project.status.label === "Draft";
    const isReview = project.status.label === "Review";
    const isCompleted = project.status.label === "Completed";
    if (!isDraft && !isReview && !isCompleted) {
      handledPathRef.current = null;
      return;
    }

    if (handledPathRef.current === locationPathname) {
      return;
    }
    handledPathRef.current = locationPathname;

    if (isDraft) {
      navigateToPath(
        buildDraftPendingDetailPath(
          project.id,
          "Draft",
          lastOriginPathRef.current || TASKS_PATH,
        ),
        true,
      );
      return;
    }
    if (isReview) {
      navigateToPath(
        buildDraftPendingDetailPath(
          project.id,
          "Review",
          lastOriginPathRef.current || TASKS_PATH,
        ),
        true,
      );
      return;
    }

    openCompletedProjectsPopup();
    const becameCompletedOnSameRoute =
      previousStatusOnPath != null && previousStatusOnPath !== "Completed";
    const redirectPath = becameCompletedOnSameRoute
      ? resolveNextActiveProjectPath(project.id)
      : (lastOriginPathRef.current || TASKS_PATH);
    navigateToPath(redirectPath, true);
  }, [
    currentView,
    locationPathname,
    navigateToPath,
    openCompletedProjectsPopup,
    orderedProjectIds,
    projects,
    projectsPaginationStatus,
    resolveNextActiveProjectPath,
  ]);
};
