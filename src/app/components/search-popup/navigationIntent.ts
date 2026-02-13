import type { AppView } from "../../lib/routing";
import type { ProjectData } from "../../types";

export const toProjectSearchIntent = (project: ProjectData): AppView => {
  if (project.archived) {
    return `archive-project:${project.id}`;
  }
  if (project.status.label === "Completed") {
    return `completed-project:${project.id}`;
  }
  if (project.status.label === "Draft") {
    return `draft-project:${project.id}`;
  }
  if (project.status.label === "Review") {
    return `pending-project:${project.id}`;
  }
  return `project:${project.id}`;
};
