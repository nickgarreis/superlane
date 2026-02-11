import { useCallback, useMemo } from "react";
import { toast } from "sonner";
import { toUtcNoonEpochMsFromDateOnly } from "../../../lib/dates";
import { reportUiError } from "../../../lib/errors";
import type {
  CreateProjectPayload,
  CreateProjectResult,
} from "../../../dashboard/types";
import type { ProjectDraftData } from "../../../types";
import type { CreateProjectPopupProps } from "./useCreateProjectWizardController";
import { useWizardReviewActions } from "./useWizardReviewActions";
import type { WizardStateValues } from "./useWizardState";
type DraftAttachmentLike = { status: string; pendingUploadId?: string };
type UseWizardSubmissionArgs = {
  state: WizardStateValues;
  props: Pick<
    CreateProjectPopupProps,
    | "onCreate"
    | "onClose"
    | "editProjectId"
    | "initialDraftData"
    | "onDeleteDraft"
    | "reviewProject"
    | "onUpdateComments"
    | "onApproveReviewProject"
    | "onDiscardDraftUploads"
    | "user"
  >;
  attachments: DraftAttachmentLike[];
  isUploading: boolean;
  markDiscardRequested: () => void;
};
export const useWizardSubmission = ({
  state,
  props,
  attachments,
  isUploading,
  markDiscardRequested,
}: UseWizardSubmissionArgs) => {
  const {
    step,
    setStep,
    selectedService,
    projectName,
    selectedJob,
    description,
    isAIEnabled,
    deadline,
    patchWizardState,
    draftSessionId,
    commentInput,
    setCommentInput,
    reviewComments,
    setReviewComments,
    createdProjectId,
    commentsEndRef,
    isApprovingReview,
  } = state;
  const editProjectId = props.editProjectId;
  const reviewProject = props.reviewProject;
  const {
    onCreate,
    onClose,
    initialDraftData,
    onDeleteDraft,
    onUpdateComments,
    onApproveReviewProject,
    onDiscardDraftUploads,
    user,
  } = props;
  const step2JobLabel = useMemo(() => {
    if (!selectedService) {
      return undefined;
    }
    return selectedService === "Web Design" ? "Scope" : "Job";
  }, [selectedService]);
  const isStepValid = useMemo(() => {
    if (step === 1) {
      return Boolean(selectedService);
    }
    if (step === 2) {
      return Boolean(projectName.trim()) && Boolean(selectedJob);
    }
    return true;
  }, [projectName, selectedJob, selectedService, step]);
  const isNextDisabled = !isStepValid || (step === 3 && isUploading);
  const hasUnsavedWork = useCallback(() => {
    if (!editProjectId) {
      return (
        Boolean(selectedService) ||
        Boolean(projectName.trim()) ||
        attachments.length > 0
      );
    }
    if (initialDraftData) {
      if (
        (selectedService || "") !== (initialDraftData.selectedService || "")
      ) {
        return true;
      }
      if (projectName !== (initialDraftData.projectName || "")) {
        return true;
      }
      if ((selectedJob || "") !== (initialDraftData.selectedJob || "")) {
        return true;
      }
      if (description !== (initialDraftData.description || "")) {
        return true;
      }
      if (Boolean(isAIEnabled) !== Boolean(initialDraftData.isAIEnabled)) {
        return true;
      }
      const initialDeadlineEpochMs = initialDraftData.deadlineEpochMs ?? null;
      const currentDeadlineEpochMs = deadline
        ? toUtcNoonEpochMsFromDateOnly(deadline)
        : null;
      if (currentDeadlineEpochMs !== initialDeadlineEpochMs) {
        return true;
      }
      return attachments.length > 0;
    }
    return (
      Boolean(selectedService) ||
      Boolean(projectName.trim()) ||
      attachments.length > 0
    );
  }, [
    attachments.length,
    deadline,
    description,
    editProjectId,
    initialDraftData,
    isAIEnabled,
    projectName,
    selectedJob,
    selectedService,
  ]);
  const buildDraftData = useCallback(
    (): ProjectDraftData => ({
      selectedService: selectedService || "",
      projectName,
      selectedJob: selectedJob || "",
      description,
      isAIEnabled,
      deadlineEpochMs: deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
      lastStep: step,
    }),
    [
      deadline,
      description,
      isAIEnabled,
      projectName,
      selectedJob,
      selectedService,
      step,
    ],
  );
  const createProject = useCallback(
    (status: string): Promise<CreateProjectResult | null> => {
      if (isUploading) {
        toast.error("Please wait for attachments to finish uploading");
        return Promise.resolve(null);
      }
      const attachmentPendingUploadIds = attachments
        .filter((file) => file.status === "uploaded" && file.pendingUploadId)
        .map((file) => file.pendingUploadId as string);
      const projectData: CreateProjectPayload = {
        name: projectName,
        description,
        category: selectedService ?? undefined,
        scope: selectedJob ?? undefined,
        deadlineEpochMs: deadline
          ? toUtcNoonEpochMsFromDateOnly(deadline)
          : null,
        attachmentPendingUploadIds,
        status,
        draftData: status === "Draft" ? buildDraftData() : null,
      };
      if (editProjectId) {
        projectData._editProjectId = editProjectId;
      }
      if (!onCreate) {
        return Promise.resolve(null);
      }
      return Promise.resolve(onCreate(projectData)).then((result) => {
        if (
          result &&
          typeof result === "object" &&
          "publicId" in result &&
          typeof result.publicId === "string"
        ) {
          patchWizardState({ createdProjectId: result.publicId });
          return result;
        }
        return null;
      });
    },
    [
      attachments,
      buildDraftData,
      deadline,
      description,
      editProjectId,
      isUploading,
      onCreate,
      patchWizardState,
      projectName,
      selectedJob,
      selectedService,
    ],
  );
  const handleNext = useCallback(async () => {
    if (step === 1 && isStepValid) {
      setStep(2);
      return;
    }
    if (step === 2 && isStepValid) {
      setStep(3);
      return;
    }
    if (step !== 3) {
      return;
    }
    try {
      const result = await createProject("Review");
      if (!result && onCreate) {
        return;
      }
      setStep(4);
    } catch (error) {
      reportUiError("createProjectWizard.next", error, { showToast: false });
      toast.error("Failed to create project");
    }
  }, [createProject, isStepValid, onCreate, setStep, step]);
  const handleCancel = useCallback(
    (options?: { discardUploads?: boolean }) => {
      const shouldDiscardUploads = options?.discardUploads !== false;
      if (shouldDiscardUploads) {
        markDiscardRequested();
      }
      if (
        shouldDiscardUploads &&
        onDiscardDraftUploads &&
        attachments.length > 0
      ) {
        void onDiscardDraftUploads(draftSessionId).catch(() => {});
      }
      onClose();
    },
    [
      attachments.length,
      draftSessionId,
      markDiscardRequested,
      onClose,
      onDiscardDraftUploads,
    ],
  );
  const handleDeleteDraft = useCallback(() => {
    patchWizardState({ showDeleteConfirm: true });
  }, [patchWizardState]);
  const handleConfirmDelete = useCallback(() => {
    if (editProjectId && onDeleteDraft) {
      void Promise.resolve()
        .then(() => onDeleteDraft(editProjectId))
        .catch((error) => {
          reportUiError("createProjectWizard.deleteDraft", error, {
            showToast: false,
          });
          toast.error("Failed to delete draft");
        });
    }
    patchWizardState({ showDeleteConfirm: false });
    handleCancel();
  }, [editProjectId, handleCancel, onDeleteDraft, patchWizardState]);
  const handleConfirmDeleteProject = useCallback(() => {
    const projectId = reviewProject?.id || editProjectId || createdProjectId;
    if (projectId && onDeleteDraft) {
      onDeleteDraft(projectId);
    }
    patchWizardState({ showDeleteProjectConfirm: false });
    handleCancel();
  }, [
    createdProjectId,
    editProjectId,
    handleCancel,
    onDeleteDraft,
    patchWizardState,
    reviewProject?.id,
  ]);
  const handleCloseClick = useCallback(() => {
    if (reviewProject) {
      handleCancel();
      return;
    }
    if (hasUnsavedWork()) {
      patchWizardState({ showCloseConfirm: true });
      return;
    }
    handleCancel();
  }, [handleCancel, hasUnsavedWork, patchWizardState, reviewProject]);
  const reviewActions = useWizardReviewActions({
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
  });
  return {
    step2JobLabel,
    isNextDisabled,
    handleNext,
    handleDeleteDraft,
    handleConfirmDelete,
    handleConfirmDeleteProject,
    handleCloseClick,
    handleCancel,
    ...reviewActions,
  };
};
