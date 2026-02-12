import type { ProjectData } from "../../types";
export type SidebarPartitionedProjects = {
  activeProjects: ProjectData[];
  draftPendingProjects: ProjectData[];
  completedProjects: ProjectData[];
};
export const partitionSidebarProjects = (
  projects: Record<string, ProjectData>,
): SidebarPartitionedProjects => {
  const allProjects = Object.values(projects);
  const activeProjects = allProjects.filter(
    (project) => !project.archived && project.status.label === "Active",
  );
  const draftPendingProjects = allProjects.filter(
    (project) =>
      !project.archived &&
      (project.status.label === "Draft" || project.status.label === "Review"),
  );
  const completedProjects = allProjects.filter(
    (project) => !project.archived && project.status.label === "Completed",
  );
  return { activeProjects, draftPendingProjects, completedProjects };
};
