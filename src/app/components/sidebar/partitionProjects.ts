import type { ProjectData } from "../../types";
export type SidebarPartitionedProjects = {
  activeProjects: ProjectData[];
  completedProjects: ProjectData[];
};
export const partitionSidebarProjects = (
  projects: Record<string, ProjectData>,
): SidebarPartitionedProjects => {
  const allProjects = Object.values(projects);
  const activeProjects = allProjects.filter(
    (project) => !project.archived && project.status.label !== "Completed",
  );
  const completedProjects = allProjects.filter(
    (project) => !project.archived && project.status.label === "Completed",
  );
  return { activeProjects, completedProjects };
};
