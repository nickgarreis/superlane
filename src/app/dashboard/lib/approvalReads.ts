import type { ProjectData } from "../../types";

export type ProjectApprovalReadSnapshot = {
  projectPublicId: string;
  lastSeenApprovedAt: number;
};

export const getApprovedSidebarProjectIds = ({
  projects,
  approvalReads,
}: {
  projects: Record<string, ProjectData>;
  approvalReads: ProjectApprovalReadSnapshot[];
}): string[] => {
  const approvalReadByProjectId = new Map<string, number>();
  for (const approvalRead of approvalReads) {
    approvalReadByProjectId.set(
      approvalRead.projectPublicId,
      approvalRead.lastSeenApprovedAt,
    );
  }

  return Object.values(projects)
    .filter((project) => {
      if (project.archived || project.status.label !== "Active") {
        return false;
      }
      const approvedAt = project.lastApprovedAt;
      if (typeof approvedAt !== "number") {
        return false;
      }
      const lastSeenApprovedAt = approvalReadByProjectId.get(project.id);
      return lastSeenApprovedAt == null || lastSeenApprovedAt < approvedAt;
    })
    .map((project) => project.id);
};
