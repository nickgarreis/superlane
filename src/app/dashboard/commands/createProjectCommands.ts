import type {
  CreateProjectPayload,
  CreateProjectResult,
  ProjectCommands,
} from "../types";
import type { ProjectData } from "../../types";
type CreateProjectCommandsArgs = {
  handleCreateProject: (
    payload: CreateProjectPayload,
  ) => Promise<CreateProjectResult>;
  handleEditProject: (project: ProjectData) => void;
  handleViewReviewProject: (project: ProjectData) => void;
  handleArchiveProject: (projectId: string) => void;
  handleUnarchiveProject: (projectId: string) => void;
  handleDeleteProject: (projectId: string) => void;
  handleUpdateProjectStatus: (projectId: string, newStatus: string) => void;
};
export const createProjectCommands = ({
  handleCreateProject,
  handleEditProject,
  handleViewReviewProject,
  handleArchiveProject,
  handleUnarchiveProject,
  handleDeleteProject,
  handleUpdateProjectStatus,
}: CreateProjectCommandsArgs): ProjectCommands => ({
  createOrUpdateProject: handleCreateProject,
  editProject: handleEditProject,
  viewReviewProject: handleViewReviewProject,
  archiveProject: handleArchiveProject,
  unarchiveProject: handleUnarchiveProject,
  deleteProject: handleDeleteProject,
  updateProjectStatus: handleUpdateProjectStatus,
});
