import type {
  CreateProjectPayload,
  CreateProjectResult,
} from "../../../dashboard/types";
import { SERVICE_NAME_ALIASES } from "../../../lib/projectServices";
import type {
  ProjectDraftData,
  ProjectData,
  ReviewComment,
  WorkspaceRole,
} from "../../../types";
import { useDraftAttachments } from "../useDraftAttachments";
import { useWizardEffects } from "./useWizardEffects";
import { useWizardState } from "./useWizardState";
import { useWizardSubmission } from "./useWizardSubmission";
const REVIEW_CATEGORY_LABELS: Record<string, string> = SERVICE_NAME_ALIASES;
export type CreateProjectPopupUser = {
  userId?: string;
  name: string;
  avatar: string;
  role?: WorkspaceRole;
};
export type CreateProjectPopupProps = {
  isMobile?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (
    data: CreateProjectPayload,
  ) => Promise<CreateProjectResult> | CreateProjectResult | void;
  user?: CreateProjectPopupUser;
  editProjectId?: string | null;
  initialDraftData?: ProjectDraftData | null;
  onDeleteDraft?: (id: string) => void;
  reviewProject?: ProjectData | null;
  onUpdateComments?: (
    projectId: string,
    comments: ReviewComment[],
  ) => Promise<unknown>;
  onApproveReviewProject?: (projectId: string) => Promise<unknown>;
  onBackToDraftPendingProjects?: () => void;
  backToDraftPendingProjectsLabel?: string;
  onUploadAttachment?: (
    file: File,
    draftSessionId: string,
  ) => Promise<{
    pendingUploadId: string;
    name: string;
    type: string;
    mimeType: string | null;
    sizeBytes: number;
  }>;
  onRemovePendingAttachment?: (pendingUploadId: string) => Promise<void>;
  onDiscardDraftUploads?: (draftSessionId: string) => Promise<void>;
};
export function useCreateProjectWizardController({
  isOpen,
  onClose,
  onCreate,
  user,
  editProjectId,
  initialDraftData,
  onDeleteDraft,
  reviewProject,
  onUpdateComments,
  onApproveReviewProject,
  onBackToDraftPendingProjects,
  backToDraftPendingProjectsLabel,
  onUploadAttachment,
  onRemovePendingAttachment,
  onDiscardDraftUploads,
}: CreateProjectPopupProps) {
  const state = useWizardState();
  const {
    attachments,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveAttachment,
    handleRetryAttachment,
    markDiscardRequested,
    resetAttachments,
  } = useDraftAttachments({
    draftSessionId: state.draftSessionId,
    onUploadAttachment,
    onRemovePendingAttachment,
  });
  useWizardEffects({
    isOpen,
    initialDraftData,
    reviewProject,
    reviewCategoryLabels: REVIEW_CATEGORY_LABELS,
    state,
    resetAttachments,
  });
  const submission = useWizardSubmission({
    state,
    props: {
      onCreate,
      onClose,
      editProjectId,
      initialDraftData,
      onDeleteDraft,
      reviewProject,
      onUpdateComments,
      onApproveReviewProject,
      onBackToDraftPendingProjects,
      backToDraftPendingProjectsLabel,
      onDiscardDraftUploads,
      user,
    },
    attachments,
    isUploading,
    markDiscardRequested,
  });
  return {
    step: state.step,
    showCloseConfirm: state.showCloseConfirm,
    showDeleteConfirm: state.showDeleteConfirm,
    showDeleteProjectConfirm: state.showDeleteProjectConfirm,
    isApprovingReview: state.isApprovingReview,
    selectedService: state.selectedService,
    setSelectedService: state.setSelectedService,
    projectName: state.projectName,
    setProjectName: state.setProjectName,
    selectedJob: state.selectedJob,
    setSelectedJob: state.setSelectedJob,
    description: state.description,
    setDescription: state.setDescription,
    isAIEnabled: state.isAIEnabled,
    setIsAIEnabled: state.setIsAIEnabled,
    deadline: state.deadline,
    setDeadline: state.setDeadline,
    isCalendarOpen: state.isCalendarOpen,
    setIsCalendarOpen: state.setIsCalendarOpen,
    draftSessionId: state.draftSessionId,
    reviewComments: state.reviewComments,
    commentInput: state.commentInput,
    setCommentInput: state.setCommentInput,
    step2JobLabel: submission.step2JobLabel,
    calendarRef: state.calendarRef,
    commentsEndRef: state.commentsEndRef,
    attachments,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveAttachment,
    handleRetryAttachment,
    canRenderReviewApprovalAction: submission.canRenderReviewApprovalAction,
    canApproveReviewProject: submission.canApproveReviewProject,
    canDeleteReviewProject: submission.canDeleteReviewProject,
    reviewApprovalDeniedReason: submission.reviewApprovalDeniedReason,
    reviewDeleteDeniedReason: submission.reviewDeleteDeniedReason,
    isNextDisabled: submission.isNextDisabled,
    setStep: state.setStep,
    handleNext: submission.handleNext,
    handleDeleteDraft: submission.handleDeleteDraft,
    handleConfirmDelete: submission.handleConfirmDelete,
    handleConfirmDeleteProject: submission.handleConfirmDeleteProject,
    handleCloseClick: submission.handleCloseClick,
    handleAddComment: submission.handleAddComment,
    handleDeleteComment: submission.handleDeleteComment,
    handleApproveReview: submission.handleApproveReview,
    handleConfirmSave: submission.handleConfirmSave,
    handleConfirmCancel: submission.handleConfirmCancel,
    handleCancel: submission.handleCancel,
    requestDeleteReviewProject: submission.requestDeleteReviewProject,
    handleBackClick: submission.handleBackClick,
    backToDraftPendingProjectsLabel:
      submission.backToDraftPendingProjectsLabel,
    setShowCloseConfirm: submission.setShowCloseConfirm,
    setShowDeleteConfirm: (show: boolean) =>
      state.patchWizardState({ showDeleteConfirm: show }),
    setShowDeleteProjectConfirm: (show: boolean) =>
      state.patchWizardState({ showDeleteProjectConfirm: show }),
  };
}
