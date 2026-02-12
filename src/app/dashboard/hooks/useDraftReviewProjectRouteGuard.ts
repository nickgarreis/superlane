import { useEffect, useRef } from "react";
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
  projectsPaginationStatus: ProjectsPaginationStatus;
  editProject: (project: ProjectData) => void;
  viewReviewProject: (project: ProjectData) => void;
  navigateToPath: (path: string, replace?: boolean) => void;
};

const PROJECT_VIEW_PREFIX = "project:";
const TASKS_PATH = viewToPath("tasks");
const PROJECT_PATH_PREFIX = "/project/";

export const useDraftReviewProjectRouteGuard = ({
  currentView,
  locationPathname,
  projects,
  projectsPaginationStatus,
  editProject,
  viewReviewProject,
  navigateToPath,
}: UseDraftReviewProjectRouteGuardArgs) => {
  const handledPathRef = useRef<string | null>(null);
  const lastNonProjectPathRef = useRef<string>(TASKS_PATH);
  const projectCacheRef = useRef<Record<string, ProjectData>>({});

  if (!locationPathname.startsWith(PROJECT_PATH_PREFIX)) {
    lastNonProjectPathRef.current = locationPathname;
  }
  for (const [projectId, project] of Object.entries(projects)) {
    projectCacheRef.current[projectId] = project;
  }

  useEffect(() => {
    if (
      !currentView.startsWith(PROJECT_VIEW_PREFIX) ||
      !locationPathname.startsWith(PROJECT_PATH_PREFIX)
    ) {
      handledPathRef.current = null;
      return;
    }

    if (projectsPaginationStatus === "LoadingFirstPage") {
      return;
    }

    const projectId = currentView.slice(PROJECT_VIEW_PREFIX.length);
    const project = projects[projectId] ?? projectCacheRef.current[projectId];
    if (!project || project.archived) {
      handledPathRef.current = null;
      return;
    }

    const isDraft = project.status.label === "Draft";
    const isReview = project.status.label === "Review";
    if (!isDraft && !isReview) {
      handledPathRef.current = null;
      return;
    }

    if (handledPathRef.current === locationPathname) {
      return;
    }
    handledPathRef.current = locationPathname;

    if (isDraft) {
      editProject(project);
    } else {
      viewReviewProject(project);
    }
    navigateToPath(lastNonProjectPathRef.current || TASKS_PATH, true);
  }, [
    currentView,
    editProject,
    locationPathname,
    navigateToPath,
    projects,
    projectsPaginationStatus,
    viewReviewProject,
  ]);
};
