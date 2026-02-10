import { useCallback, type RefObject } from "react";
import { toast } from "sonner";
import { safeScrollIntoView } from "../../../lib/dom";
import { createClientId } from "../../../lib/id";
import {
  getProjectLifecycleDeniedReason,
  getReviewApprovalDeniedReason,
  isAdminOrOwner,
} from "../../../lib/permissionRules";
import { reportUiError } from "../../../lib/errors";
import type { CreateProjectPayload } from "../../../dashboard/types";
import type { CreateProjectPopupProps } from "./useCreateProjectWizardController";
import type { ReviewComment } from "../../../types";

type UseWizardReviewActionsArgs = {
  commentInput: string;
  setCommentInput: (value: string) => void;
  reviewComments: ReviewComment[];
  setReviewComments: (comments: ReviewComment[]) => void;
  user: CreateProjectPopupProps["user"];
  reviewProject: CreateProjectPopupProps["reviewProject"];
  editProjectId: string | null | undefined;
  createdProjectId: string | null;
  onUpdateComments: CreateProjectPopupProps["onUpdateComments"];
  commentsEndRef: RefObject<HTMLDivElement>;
  onApproveReviewProject: CreateProjectPopupProps["onApproveReviewProject"];
  isApprovingReview: boolean;
  patchWizardState: (patch: {
    isApprovingReview?: boolean;
    showCloseConfirm?: boolean;
    showDeleteProjectConfirm?: boolean;
  }) => void;
  handleCancel: (options?: { discardUploads?: boolean }) => void;
  createProject: (status: string) => Promise<unknown>;
  initialDraftData: CreateProjectPopupProps["initialDraftData"];
  onCreate: CreateProjectPopupProps["onCreate"];
};

export const useWizardReviewActions = ({
  commentInput,
  setCommentInput,
  reviewComments,
  setReviewComments,
  user,
  reviewProject,
  editProjectId,
  createdProjectId,
  onUpdateComments,
  commentsEndRef,
  onApproveReviewProject,
  isApprovingReview,
  patchWizardState,
  handleCancel,
  createProject,
  initialDraftData,
  onCreate,
}: UseWizardReviewActionsArgs) => {
  const handleAddComment = useCallback(() => {
    const trimmed = commentInput.trim();
    if (!trimmed) {
      return;
    }

    if (!user?.userId) {
      toast.error("Unable to add comments right now");
      return;
    }

    const newComment: ReviewComment = {
      id: createClientId("review-comment"),
      author: {
        userId: user.userId,
        name: user?.name || "You",
        avatar: user?.avatar || "",
      },
      content: trimmed,
      timestamp: "Just now",
    };

    const previous = reviewComments;
    const updated = [...previous, newComment];
    setReviewComments(updated);
    setCommentInput("");

    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onUpdateComments) {
      void onUpdateComments(projectId, updated).catch((error) => {
        reportUiError("createProjectWizard.addComment", error, { showToast: false });
        setReviewComments(previous);
        toast.error("Failed to update comments");
      });
    }

    requestAnimationFrame(() => {
      safeScrollIntoView(commentsEndRef.current, { behavior: "smooth" });
    });
  }, [
    commentInput,
    commentsEndRef,
    createdProjectId,
    editProjectId,
    onUpdateComments,
    reviewComments,
    reviewProject?.id,
    setCommentInput,
    setReviewComments,
    user?.avatar,
    user?.name,
    user?.userId,
  ]);

  const handleDeleteComment = useCallback(
    (commentId: string) => {
      const comment = reviewComments.find((entry) => entry.id === commentId);
      if (!comment) {
        return;
      }

      if (!user?.userId || comment.author.userId !== user.userId) {
        toast.error("You can only delete your own comments");
        return;
      }

      const previous = reviewComments;
      const updated = previous.filter((entry) => entry.id !== commentId);
      setReviewComments(updated);

      const projectId = reviewProject?.id || editProjectId || createdProjectId;
      if (projectId && onUpdateComments) {
        void onUpdateComments(projectId, updated).catch((error) => {
          reportUiError("createProjectWizard.deleteComment", error, { showToast: false });
          setReviewComments(previous);
          toast.error("Failed to update comments");
        });
      }
    },
    [
      createdProjectId,
      editProjectId,
      onUpdateComments,
      reviewComments,
      reviewProject?.id,
      setReviewComments,
      user?.userId,
    ],
  );

  const canRenderReviewApprovalAction =
    Boolean(reviewProject?.id) && reviewProject?.status.label === "Review" && Boolean(onApproveReviewProject);
  const canApproveReviewProject = canRenderReviewApprovalAction && user?.role === "owner";
  const canDeleteReviewProject = isAdminOrOwner(user?.role);
  const reviewApprovalDeniedReason = getReviewApprovalDeniedReason(user?.role);
  const reviewDeleteDeniedReason = getProjectLifecycleDeniedReason(user?.role);

  const handleApproveReview = useCallback(() => {
    if (!canApproveReviewProject || !reviewProject?.id || !onApproveReviewProject || isApprovingReview) {
      return;
    }

    patchWizardState({ isApprovingReview: true });
    void onApproveReviewProject(reviewProject.id)
      .then(() => {
        handleCancel();
      })
      .catch((error) => {
        reportUiError("createProjectWizard.approveReview", error, { showToast: false });
        toast.error("Failed to approve project");
      })
      .finally(() => {
        patchWizardState({ isApprovingReview: false });
      });
  }, [
    canApproveReviewProject,
    handleCancel,
    isApprovingReview,
    onApproveReviewProject,
    patchWizardState,
    reviewProject?.id,
  ]);

  const handleConfirmSave = useCallback(async () => {
    try {
      const result = await createProject("Draft");
      if (!result && onCreate) {
        return;
      }
      patchWizardState({ showCloseConfirm: false });
      handleCancel({ discardUploads: false });
    } catch (error) {
      reportUiError("createProjectWizard.saveDraft", error, { showToast: false });
      toast.error("Failed to save draft");
    }
  }, [createProject, handleCancel, onCreate, patchWizardState]);

  const handleConfirmCancel = useCallback(() => {
    if (editProjectId && initialDraftData) {
      const revertData: CreateProjectPayload = {
        name: initialDraftData.projectName,
        description: initialDraftData.description,
        category: initialDraftData.selectedService,
        scope: initialDraftData.selectedJob,
        deadlineEpochMs: initialDraftData.deadlineEpochMs ?? null,
        status: "Draft",
        draftData: initialDraftData,
        _editProjectId: editProjectId,
      };

      if (onCreate) {
        void Promise.resolve(onCreate(revertData)).catch((error) => {
          reportUiError("createProjectWizard.restoreDraft", error, { showToast: false });
          toast.error("Failed to restore original draft");
        });
      }
    }

    patchWizardState({ showCloseConfirm: false });
    handleCancel();
  }, [editProjectId, handleCancel, initialDraftData, onCreate, patchWizardState]);

  const requestDeleteReviewProject = useCallback(() => {
    if (!canDeleteReviewProject) {
      return;
    }
    patchWizardState({ showDeleteProjectConfirm: true });
  }, [canDeleteReviewProject, patchWizardState]);

  return {
    handleAddComment,
    handleDeleteComment,
    canRenderReviewApprovalAction,
    canApproveReviewProject,
    canDeleteReviewProject,
    reviewApprovalDeniedReason,
    reviewDeleteDeniedReason,
    handleApproveReview,
    handleConfirmSave,
    handleConfirmCancel,
    requestDeleteReviewProject,
  };
};
