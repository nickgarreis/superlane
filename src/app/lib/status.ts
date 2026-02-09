import type { ProjectStatus, ProjectData } from "../types";

export const PROJECT_STATUS_STYLES: Record<
  ProjectStatus,
  ProjectData["status"]
> = {
  Draft: {
    label: "Draft",
    color: "#58AFFF",
    bgColor: "rgba(0,122,187,0.1)",
    dotColor: "#0087d5",
  },
  Review: {
    label: "Review",
    color: "#FF5F1F",
    bgColor: "rgba(255, 95, 31, 0.1)",
    dotColor: "#FF5F1F",
  },
  Active: {
    label: "Active",
    color: "#a6f4c5",
    bgColor: "rgba(16,185,129,0.1)",
    dotColor: "#10b981",
  },
  Completed: {
    label: "Completed",
    color: "#22c55e",
    bgColor: "rgba(34,197,94,0.1)",
    dotColor: "#16a34a",
  },
};

export const parseProjectStatus = (status: string | undefined | null): ProjectStatus => {
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
