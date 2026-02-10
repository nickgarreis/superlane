import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { toast } from "sonner";
import type { CreateProjectPayload, CreateProjectResult } from "../../../dashboard/types";
import {
  type ProjectDraftData,
  type ProjectData,
  type ReviewComment,
  type WorkspaceRole,
} from "../../../types";
import {
  fromUtcNoonEpochMsToDateOnly,
  toUtcNoonEpochMsFromDateOnly,
} from "../../../lib/dates";
import {
  getProjectLifecycleDeniedReason,
  getReviewApprovalDeniedReason,
  isAdminOrOwner,
} from "../../../lib/permissionRules";
import { createClientId } from "../../../lib/id";
import { safeScrollIntoView } from "../../../lib/dom";
import { useDraftAttachments } from "../useDraftAttachments";
import {
  type CreateProjectWizardState,
  createInitialCreateProjectWizardState,
  reduceCreateProjectWizardState,
} from "../wizardState";

const createDraftSessionId = () => createClientId("draft");

const REVIEW_CATEGORY_LABELS: Record<string, string> = {
  webdesign: "Web Design",
  "web design": "Web Design",
  automation: "AI Automation",
  "ai automation": "AI Automation",
  marketing: "Marketing Campaigns",
  "marketing campaigns": "Marketing Campaigns",
  presentation: "Presentation",
  "ai consulting": "AI Consulting",
  "creative strategy & concept": "Creative Strategy & Concept",
};

export type CreateProjectPopupUser = {
  userId?: string;
  name: string;
  avatar: string;
  role?: WorkspaceRole;
};

export type CreateProjectPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (data: CreateProjectPayload) => Promise<CreateProjectResult> | CreateProjectResult | void;
  user?: CreateProjectPopupUser;
  editProjectId?: string | null;
  initialDraftData?: ProjectDraftData | null;
  onDeleteDraft?: (id: string) => void;
  reviewProject?: ProjectData | null;
  onUpdateComments?: (projectId: string, comments: ReviewComment[]) => Promise<unknown>;
  onApproveReviewProject?: (projectId: string) => Promise<unknown>;
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
  onUploadAttachment,
  onRemovePendingAttachment,
  onDiscardDraftUploads,
}: CreateProjectPopupProps) {
  const [wizardState, dispatchWizard] = useReducer(
    reduceCreateProjectWizardState,
    undefined,
    createInitialCreateProjectWizardState,
  );
  const {
    step,
    showCloseConfirm,
    showDeleteConfirm,
    showDeleteProjectConfirm,
    createdProjectId,
    isApprovingReview,
  } = wizardState;

  const patchWizardState = useCallback((patch: Partial<CreateProjectWizardState>) => {
    dispatchWizard({ type: "patch", patch });
  }, []);

  const setStep = useCallback(
    (value: number) => {
      patchWizardState({ step: value });
    },
    [patchWizardState],
  );

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [projectName, setProjectName] = useState("");
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isAIEnabled, setIsAIEnabled] = useState(true);
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [draftSessionId, setDraftSessionId] = useState(() => createDraftSessionId());
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  const calendarRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);

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
    draftSessionId,
    onUploadAttachment,
    onRemovePendingAttachment,
  });

  useEffect(() => {
    if (!isOpen || !initialDraftData) {
      return;
    }

    setSelectedService(initialDraftData.selectedService);
    setProjectName(initialDraftData.projectName);
    setSelectedJob(initialDraftData.selectedJob);
    setDescription(initialDraftData.description);
    setIsAIEnabled(initialDraftData.isAIEnabled);
    setDeadline(fromUtcNoonEpochMsToDateOnly(initialDraftData.deadlineEpochMs));
    setStep(initialDraftData.lastStep);
  }, [initialDraftData, isOpen, setStep]);

  useEffect(() => {
    if (!isOpen || !reviewProject) {
      return;
    }

    const category = reviewProject.category.toLowerCase();
    setSelectedService(REVIEW_CATEGORY_LABELS[category] || reviewProject.category);
    setProjectName(reviewProject.name);
    setSelectedJob(reviewProject.scope || null);
    setDescription(reviewProject.description);
    setDeadline(fromUtcNoonEpochMsToDateOnly(reviewProject.deadlineEpochMs));
    setReviewComments(reviewProject.comments || []);
    setStep(4);
  }, [isOpen, reviewProject, setStep]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftSessionId(createDraftSessionId());
    resetAttachments();
  }, [isOpen, resetAttachments]);

  useEffect(() => {
    if (!isCalendarOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isCalendarOpen]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    setSelectedService(null);
    setProjectName("");
    setSelectedJob(null);
    setDescription("");
    setIsAIEnabled(true);
    setDeadline(undefined);
    setIsCalendarOpen(false);
    resetAttachments();
    setReviewComments([]);
    setCommentInput("");
    setDraftSessionId(createDraftSessionId());
    patchWizardState({
      step: 1,
      showCloseConfirm: false,
      showDeleteConfirm: false,
      showDeleteProjectConfirm: false,
      createdProjectId: null,
      isApprovingReview: false,
    });
  }, [isOpen, patchWizardState, resetAttachments]);

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
      return Boolean(selectedService) || Boolean(projectName.trim());
    }

    if (initialDraftData) {
      if ((selectedService || "") !== (initialDraftData.selectedService || "")) {
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
      if (isAIEnabled !== initialDraftData.isAIEnabled) {
        return true;
      }

      const initialDeadlineEpochMs = initialDraftData.deadlineEpochMs ?? null;
      const currentDeadlineEpochMs = deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null;
      if (currentDeadlineEpochMs !== initialDeadlineEpochMs) {
        return true;
      }
      return attachments.length > 0;
    }

    return Boolean(selectedService) || Boolean(projectName.trim());
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
    [deadline, description, isAIEnabled, projectName, selectedJob, selectedService, step],
  );

  const createProject = useCallback(
    (status: string): Promise<CreateProjectResult | null> => {
      if (isUploading) {
        toast.error("Please wait for attachments to finish uploading");
        return Promise.reject(new Error("Attachments are still uploading"));
      }

      const attachmentPendingUploadIds = attachments
        .filter((file) => file.status === "uploaded" && file.pendingUploadId)
        .map((file) => file.pendingUploadId as string);

      const projectData: CreateProjectPayload = {
        name: projectName,
        description,
        category: selectedService ?? undefined,
        scope: selectedJob ?? undefined,
        deadlineEpochMs: deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
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
      await createProject("Review");
      setStep(4);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
    }
  }, [createProject, isStepValid, setStep, step]);

  const handleCancel = useCallback(
    (options?: { discardUploads?: boolean }) => {
      const shouldDiscardUploads = options?.discardUploads !== false;

      if (shouldDiscardUploads) {
        markDiscardRequested();
      }

      if (shouldDiscardUploads && onDiscardDraftUploads && attachments.length > 0) {
        void onDiscardDraftUploads(draftSessionId).catch(() => {
          // Best effort cleanup; stale files are retained and purged by backend policy.
        });
      }

      onClose();
    },
    [attachments.length, draftSessionId, markDiscardRequested, onClose, onDiscardDraftUploads],
  );

  const handleDeleteDraft = useCallback(() => {
    patchWizardState({ showDeleteConfirm: true });
  }, [patchWizardState]);

  const handleConfirmDelete = useCallback(() => {
    if (editProjectId && onDeleteDraft) {
      onDeleteDraft(editProjectId);
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
  }, [createdProjectId, editProjectId, handleCancel, onDeleteDraft, patchWizardState, reviewProject?.id]);

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

  const handleAddComment = useCallback(() => {
    const trimmed = commentInput.trim();
    if (!trimmed) {
      return;
    }

    const newComment: ReviewComment = {
      id: createClientId("review-comment"),
      author: {
        userId: user?.userId,
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
        console.error(error);
        setReviewComments(previous);
        toast.error("Failed to update comments");
      });
    }

    requestAnimationFrame(() => {
      safeScrollIntoView(commentsEndRef.current, { behavior: "smooth" });
    });
  }, [
    commentInput,
    createdProjectId,
    editProjectId,
    onUpdateComments,
    reviewComments,
    reviewProject?.id,
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
          console.error(error);
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
        console.error(error);
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
      await createProject("Draft");
      patchWizardState({ showCloseConfirm: false });
      handleCancel({ discardUploads: false });
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft");
    }
  }, [createProject, handleCancel, patchWizardState]);

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
          console.error(error);
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
    step,
    showCloseConfirm,
    showDeleteConfirm,
    showDeleteProjectConfirm,
    isApprovingReview,

    selectedService,
    setSelectedService,
    projectName,
    setProjectName,
    selectedJob,
    setSelectedJob,
    description,
    setDescription,
    isAIEnabled,
    setIsAIEnabled,
    deadline,
    setDeadline,
    isCalendarOpen,
    setIsCalendarOpen,
    draftSessionId,
    reviewComments,
    commentInput,
    setCommentInput,
    step2JobLabel,

    calendarRef,
    commentsEndRef,

    attachments,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveAttachment,
    handleRetryAttachment,

    canRenderReviewApprovalAction,
    canApproveReviewProject,
    canDeleteReviewProject,
    reviewApprovalDeniedReason,
    reviewDeleteDeniedReason,

    isNextDisabled,

    setStep,
    handleNext,
    handleDeleteDraft,
    handleConfirmDelete,
    handleConfirmDeleteProject,
    handleCloseClick,
    handleAddComment,
    handleDeleteComment,
    handleApproveReview,
    handleConfirmSave,
    handleConfirmCancel,
    handleCancel,
    requestDeleteReviewProject,

    setShowCloseConfirm: (show: boolean) => patchWizardState({ showCloseConfirm: show }),
    setShowDeleteConfirm: (show: boolean) => patchWizardState({ showDeleteConfirm: show }),
    setShowDeleteProjectConfirm: (show: boolean) =>
      patchWizardState({ showDeleteProjectConfirm: show }),
  };
}
