import { useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import { buildProjectPublicId } from "../../lib/id";
import { reportUiError } from "../../lib/errors";
import { parseProjectStatus } from "../../lib/status";
import type { AppView } from "../../lib/routing";
import { categoryToService } from "./projectActionMappers";
import { useDashboardTaskSync } from "./useDashboardTaskSync";
import type {
  CreateProjectPayload,
  CreateProjectResult,
  DashboardMutationHandler,
  DashboardProjectActions,
} from "../types";
import type {
  ProjectData,
  ProjectDraftData,
  ReviewComment,
  Task,
  ViewerIdentity,
} from "../../types";
type UseDashboardProjectActionsArgs = {
  activeWorkspaceId: string | null | undefined;
  projects: Record<string, ProjectData>;
  tasksByProject?: Record<string, Task[]>;
  visibleProjects: Record<string, ProjectData>;
  workspaceTasks: Task[];
  currentView: AppView;
  viewerIdentity: ViewerIdentity;
  setEditProjectId: (projectId: string | null) => void;
  setEditDraftData: (draftData: ProjectDraftData | null) => void;
  setReviewProject: (project: ProjectData | null) => void;
  setHighlightedArchiveProjectId: (id: string | null) => void;
  openCreateProject: () => void;
  navigateView: (view: AppView) => void;
  navigateToPath: (path: string) => void;
  createProjectMutation: DashboardMutationHandler<typeof api.projects.create>;
  updateProjectMutation: DashboardMutationHandler<typeof api.projects.update>;
  archiveProjectMutation: DashboardMutationHandler<typeof api.projects.archive>;
  unarchiveProjectMutation: DashboardMutationHandler<
    typeof api.projects.unarchive
  >;
  removeProjectMutation: DashboardMutationHandler<typeof api.projects.remove>;
  setProjectStatusMutation: DashboardMutationHandler<
    typeof api.projects.setStatus
  >;
  updateReviewCommentsMutation: DashboardMutationHandler<
    typeof api.projects.updateReviewComments
  >;
  applyTaskDiffMutation: DashboardMutationHandler<typeof api.tasks.applyDiff>;
  reorderTasksMutation: DashboardMutationHandler<typeof api.tasks.reorder>;
  canReorderWorkspaceTasks: boolean;
  asPendingUploadId: (value: string) => Id<"pendingFileUploads">;
  omitUndefined: <T extends Record<string, unknown>>(value: T) => T;
};
export const useDashboardProjectActions = ({
  activeWorkspaceId,
  projects,
  tasksByProject = {},
  visibleProjects,
  workspaceTasks,
  currentView,
  viewerIdentity,
  setEditProjectId,
  setEditDraftData,
  setReviewProject,
  setHighlightedArchiveProjectId,
  openCreateProject,
  navigateView,
  navigateToPath,
  createProjectMutation,
  updateProjectMutation,
  archiveProjectMutation,
  unarchiveProjectMutation,
  removeProjectMutation,
  setProjectStatusMutation,
  updateReviewCommentsMutation,
  applyTaskDiffMutation,
  reorderTasksMutation,
  canReorderWorkspaceTasks,
  asPendingUploadId,
  omitUndefined,
}: UseDashboardProjectActionsArgs): DashboardProjectActions => {
  const { syncProjectTasks, syncWorkspaceTasks } = useDashboardTaskSync({
    activeWorkspaceId,
    tasksByProject,
    workspaceTasks,
    canReorderWorkspaceTasks,
    viewerIdentity,
    applyTaskDiffMutation,
    reorderTasksMutation,
  });
  const handleCreateProject = useCallback(
    async (projectData: CreateProjectPayload): Promise<CreateProjectResult> => {
      const normalizedStatus = parseProjectStatus(projectData.status);
      const existingId = projectData._editProjectId;
      if (existingId && projects[existingId]) {
        const existing = projects[existingId];
        try {
          const updateResult = await updateProjectMutation(
            omitUndefined({
              publicId: existingId,
              name: projectData.name ?? existing.name,
              description: projectData.description ?? existing.description,
              category: projectData.category ?? existing.category,
              scope: projectData.scope ?? existing.scope,
              deadlineEpochMs:
                projectData.deadlineEpochMs ?? existing.deadlineEpochMs ?? null,
              status: normalizedStatus,
              draftData:
                normalizedStatus === "Draft"
                  ? (projectData.draftData ?? null)
                  : null,
              attachmentPendingUploadIds:
                projectData.attachmentPendingUploadIds?.map(asPendingUploadId),
            }),
          );
          const updatedPublicId = String(updateResult?.publicId ?? existingId);
          if (normalizedStatus !== "Draft" && normalizedStatus !== "Review") {
            navigateView(`project:${updatedPublicId}`);
          }
          setEditProjectId(null);
          setEditDraftData(null);
          toast.success(
            normalizedStatus === "Draft" ? "Draft saved" : "Project updated",
          );
          return { publicId: updatedPublicId, mode: "update" };
        } catch (error) {
          reportUiError("dashboard.project.update", error, {
            showToast: false,
          });
          toast.error("Failed to update project");
          throw error;
        }
      }
      if (!activeWorkspaceId) {
        const error = new Error("Select a workspace before creating a project");
        toast.error(error.message);
        throw error;
      }
      const finalName = projectData.name || "Untitled Project";
      const requestedPublicId = buildProjectPublicId(finalName);
      try {
        const createResult = await createProjectMutation(
          omitUndefined({
            workspaceSlug: activeWorkspaceId,
            publicId: requestedPublicId,
            name: finalName,
            description: projectData.description || "",
            category: projectData.category || "General",
            scope: projectData.scope || undefined,
            deadlineEpochMs: projectData.deadlineEpochMs ?? null,
            status: normalizedStatus,
            attachmentPendingUploadIds:
              projectData.attachmentPendingUploadIds?.map(asPendingUploadId),
            draftData:
              normalizedStatus === "Draft"
                ? (projectData.draftData ?? null)
                : null,
          }),
        );
        const createdPublicId = String(
          createResult?.publicId ?? requestedPublicId,
        );
        if (normalizedStatus !== "Draft" && normalizedStatus !== "Review") {
          navigateView(`project:${createdPublicId}`);
        }
        toast.success(
          normalizedStatus === "Draft" ? "Draft saved" : "Project created",
        );
        return { publicId: createdPublicId, mode: "create" };
      } catch (error) {
        reportUiError("dashboard.project.create", error, { showToast: false });
        toast.error("Failed to create project");
        throw error;
      }
    },
    [
      activeWorkspaceId,
      asPendingUploadId,
      createProjectMutation,
      navigateView,
      omitUndefined,
      projects,
      setEditDraftData,
      setEditProjectId,
      updateProjectMutation,
    ],
  );
  const handleEditProject = useCallback(
    (project: ProjectData) => {
      const draftData: ProjectDraftData = project.draftData || {
        selectedService: categoryToService(project.category),
        projectName: project.name,
        selectedJob: project.scope || "",
        description: project.description,
        isAIEnabled: true,
        deadlineEpochMs: project.deadlineEpochMs ?? null,
        lastStep: 1,
      };
      setEditProjectId(project.id);
      setEditDraftData(draftData);
      openCreateProject();
    },
    [openCreateProject, setEditDraftData, setEditProjectId],
  );
  const handleViewReviewProject = useCallback(
    (project: ProjectData) => {
      setReviewProject(project);
      openCreateProject();
    },
    [openCreateProject, setReviewProject],
  );
  const handleUpdateComments = useCallback(
    (projectId: string, comments: ReviewComment[]) =>
      updateReviewCommentsMutation({ publicId: projectId, comments }),
    [updateReviewCommentsMutation],
  );
  const handleArchiveProject = useCallback(
    (id: string) => {
      void archiveProjectMutation({ publicId: id })
        .then(() => {
          setHighlightedArchiveProjectId(id);
          navigateView("archive");
          toast.success("Project archived");
        })
        .catch((error) => {
          reportUiError("dashboard.project.archive", error, {
            showToast: false,
          });
          toast.error("Failed to archive project");
        });
    },
    [archiveProjectMutation, navigateView, setHighlightedArchiveProjectId],
  );
  const handleUnarchiveProject = useCallback(
    (id: string) => {
      void unarchiveProjectMutation({ publicId: id })
        .then(() => {
          if (currentView === `archive-project:${id}`) {
            navigateView("archive");
          }
          toast.success("Project unarchived");
        })
        .catch((error) => {
          reportUiError("dashboard.project.unarchive", error, {
            showToast: false,
          });
          toast.error("Failed to unarchive project");
        });
    },
    [currentView, navigateView, unarchiveProjectMutation],
  );
  const handleDeleteProject = useCallback(
    (id: string) => {
      const project = projects[id];
      const isDraft = project?.status?.label === "Draft";
      void removeProjectMutation({ publicId: id })
        .then(() => {
          if (
            currentView === `project:${id}` ||
            currentView === `archive-project:${id}`
          ) {
            if (currentView.startsWith("archive-project:")) {
              navigateView("archive");
            } else {
              const otherProject = Object.values(visibleProjects).find(
                (entry) => entry.id !== id && !entry.archived,
              );
              if (otherProject) {
                navigateView(`project:${otherProject.id}`);
              } else {
                navigateToPath("/tasks");
              }
            }
          }
          toast.success(isDraft ? "Draft deleted" : "Project deleted");
        })
        .catch((error) => {
          reportUiError("dashboard.project.delete", error, {
            showToast: false,
          });
          toast.error("Failed to delete project");
        });
    },
    [
      currentView,
      navigateToPath,
      navigateView,
      projects,
      removeProjectMutation,
      visibleProjects,
    ],
  );
  const handleUpdateProjectStatus = useCallback(
    (id: string, newStatus: string) => {
      const parsedStatus = parseProjectStatus(newStatus);
      void setProjectStatusMutation({ publicId: id, status: parsedStatus })
        .then(() => {
          if (parsedStatus === "Completed") {
            toast.success("Project marked as completed");
          }
        })
        .catch((error) => {
          reportUiError("dashboard.project.status", error, {
            showToast: false,
          });
          toast.error("Failed to update project status");
        });
    },
    [setProjectStatusMutation],
  );
  const handleApproveReviewProject = useCallback(
    async (projectId: string) => {
      try {
        await setProjectStatusMutation({
          publicId: projectId,
          status: "Active",
        });
        toast.success("Project approved");
        navigateView(`project:${projectId}`);
      } catch (error) {
        reportUiError("dashboard.project.approveReview", error, {
          showToast: false,
        });
        const errorMessage =
          error instanceof Error && error.message
            ? `Failed to approve project: ${error.message}`
            : "Failed to approve project";
        toast.error(errorMessage);
      }
    },
    [setProjectStatusMutation, navigateView],
  );
  const handleUpdateProject = useCallback(
    (id: string, data: Partial<ProjectData>) => {
      const tasks = data.tasks;
      if (tasks) {
        void syncProjectTasks(id, tasks).catch((error) => {
          reportUiError("dashboard.project.syncTasks", error, {
            showToast: false,
          });
          toast.error("Failed to update tasks");
        });
      }
      const patch: {
        publicId: string;
        name?: string;
        description?: string;
        category?: string;
        scope?: string;
        deadlineEpochMs?: number | null;
        reviewComments?: ProjectData["comments"];
      } = { publicId: id };
      if (data.name !== undefined) patch.name = data.name;
      if (data.description !== undefined) patch.description = data.description;
      if (data.category !== undefined) patch.category = data.category;
      if (data.scope !== undefined) patch.scope = data.scope;
      if (data.deadlineEpochMs !== undefined) {
        patch.deadlineEpochMs = data.deadlineEpochMs;
      }
      if (data.comments !== undefined) patch.reviewComments = data.comments;
      if (Object.keys(patch).length > 1) {
        void updateProjectMutation(patch).catch((error) => {
          reportUiError("dashboard.project.patch", error, { showToast: false });
          toast.error("Failed to update project");
        });
      }
    },
    [syncProjectTasks, updateProjectMutation],
  );
  const handleReplaceWorkspaceTasks = useCallback(
    (tasks: Task[]) => {
      void syncWorkspaceTasks(tasks).catch((error) => {
        reportUiError("dashboard.workspace.syncTasks", error, {
          showToast: false,
        });
        toast.error("Failed to update tasks");
      });
    },
    [syncWorkspaceTasks],
  );
  return {
    handleCreateProject,
    handleEditProject,
    handleViewReviewProject,
    handleUpdateComments,
    handleArchiveProject,
    handleUnarchiveProject,
    handleDeleteProject,
    handleUpdateProjectStatus,
    handleApproveReviewProject,
    handleUpdateProject,
    handleReplaceWorkspaceTasks,
  };
};
