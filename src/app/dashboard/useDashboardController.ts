import { useCallback, useMemo } from "react";
import type {
  DashboardContentModel,
  DashboardControllerArgs,
  DashboardControllerResult,
} from "./types";
export const useDashboardController = ({
  currentView,
  projects,
  visibleProjects,
  setIsSidebarOpen,
  setPendingHighlight,
  navigateView,
}: DashboardControllerArgs): DashboardControllerResult => {
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((open) => !open);
  }, [setIsSidebarOpen]);
  const clearPendingHighlight = useCallback(() => {
    setPendingHighlight(null);
  }, [setPendingHighlight]);
  const contentModel = useMemo<DashboardContentModel>(() => {
    if (currentView === "tasks") {
      return { kind: "tasks" };
    }
    if (currentView === "archive") {
      return { kind: "archive" };
    }
    if (currentView.startsWith("archive-project:")) {
      const projectId = currentView.slice("archive-project:".length);
      const project = projects[projectId];
      if (project && project.archived) {
        return {
          kind: "main",
          project,
          backTo: "archive",
          back: () => navigateView("archive"),
        };
      }
    }
    if (currentView.startsWith("project:")) {
      const projectId = currentView.slice("project:".length);
      const project = projects[projectId];
      if (
        project &&
        !project.archived &&
        project.status.label !== "Draft" &&
        project.status.label !== "Review" &&
        project.status.label !== "Completed"
      ) {
        return { kind: "main", project };
      }
    }
    const firstProject = Object.values(visibleProjects).find(
      (project) =>
        !project.archived &&
        project.status.label !== "Draft" &&
        project.status.label !== "Review" &&
        project.status.label !== "Completed",
    );
    if (firstProject) {
      return { kind: "main", project: firstProject };
    }
    return { kind: "empty" };
  }, [currentView, navigateView, projects, visibleProjects]);
  return { contentModel, toggleSidebar, clearPendingHighlight };
};
