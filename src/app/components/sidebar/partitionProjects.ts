import type { ProjectData } from "../../types";

export type SidebarPartitionedProjects = {
  activeProjects: ProjectData[];
  completedProjects: ProjectData[];
  activeCompletedProject: ProjectData | undefined;
};

export const partitionSidebarProjects = (
  projects: Record<string, ProjectData>,
  currentView?: string,
): SidebarPartitionedProjects => {
  const allProjects = Object.values(projects);
  const activeProjects = allProjects.filter((project) => !project.archived && project.status.label !== "Completed");
  const completedProjects = allProjects.filter((project) => !project.archived && project.status.label === "Completed");

  const activeCompletedProject = currentView?.startsWith("project:")
    ? completedProjects.find((project) => project.id === currentView.replace("project:", ""))
    : undefined;

  return {
    activeProjects,
    completedProjects,
    activeCompletedProject,
  };
};
