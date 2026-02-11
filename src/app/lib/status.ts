import type { ProjectStatus, ProjectData } from "../types";
export const PROJECT_STATUS_STYLES: Record<
  ProjectStatus,
  ProjectData["status"]
> = {
  Draft: {
    label: "Draft",
    color: "var(--status-draft)",
    bgColor: "var(--status-draft-soft)",
    dotColor: "var(--status-draft-dot)",
  },
  Review: {
    label: "Review",
    color: "var(--status-review)",
    bgColor: "var(--status-review-soft)",
    dotColor: "var(--status-review-dot)",
  },
  Active: {
    label: "Active",
    color: "var(--status-active)",
    bgColor: "var(--status-active-soft)",
    dotColor: "var(--status-active-dot)",
  },
  Completed: {
    label: "Completed",
    color: "var(--status-completed)",
    bgColor: "var(--status-completed-soft)",
    dotColor: "var(--status-completed-dot)",
  },
};
export const parseProjectStatus = (
  status: string | undefined | null,
): ProjectStatus => {
  if (!status) {
    return "Draft";
  }
  if (status === "Review" || status === "Active" || status === "Completed") {
    return status;
  }
  return "Draft";
};
export const getStatusStyle = (status: string | undefined | null) =>
  PROJECT_STATUS_STYLES[parseProjectStatus(status)];
