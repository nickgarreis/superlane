import { useEffect } from "react";
import { fromUtcNoonEpochMsToDateOnly } from "../../../lib/dates";
import type { ProjectDraftData, ProjectData } from "../../../types";
import { createDraftSessionId, type WizardStateValues } from "./useWizardState";

type UseWizardEffectsArgs = {
  isOpen: boolean;
  initialDraftData?: ProjectDraftData | null;
  reviewProject?: ProjectData | null;
  reviewCategoryLabels: Record<string, string>;
  state: WizardStateValues;
  resetAttachments: () => void;
};

export const useWizardEffects = ({
  isOpen,
  initialDraftData,
  reviewProject,
  reviewCategoryLabels,
  state,
  resetAttachments,
}: UseWizardEffectsArgs) => {
  const {
    setSelectedService,
    setProjectName,
    setSelectedJob,
    setDescription,
    setIsAIEnabled,
    setDeadline,
    setStep,
    setReviewComments,
    setDraftSessionId,
    isCalendarOpen,
    calendarRef,
    setIsCalendarOpen,
    patchWizardState,
    setCommentInput,
  } = state;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (reviewProject) {
      const category = reviewProject.category.toLowerCase();
      setSelectedService(reviewCategoryLabels[category] || reviewProject.category);
      setProjectName(reviewProject.name);
      setSelectedJob(reviewProject.scope || null);
      setDescription(reviewProject.description);
      setDeadline(fromUtcNoonEpochMsToDateOnly(reviewProject.deadlineEpochMs));
      setReviewComments(reviewProject.comments || []);
      setIsAIEnabled(reviewProject.draftData?.isAIEnabled ?? true);
      setStep(4);
      return;
    }

    if (!initialDraftData) {
      return;
    }

    setSelectedService(initialDraftData.selectedService);
    setProjectName(initialDraftData.projectName);
    setSelectedJob(initialDraftData.selectedJob);
    setDescription(initialDraftData.description);
    setDeadline(fromUtcNoonEpochMsToDateOnly(initialDraftData.deadlineEpochMs));
    setReviewComments([]);
    setIsAIEnabled(initialDraftData.isAIEnabled);
    setStep(initialDraftData.lastStep);
  }, [
    initialDraftData,
    isOpen,
    reviewCategoryLabels,
    reviewProject,
    setDeadline,
    setDescription,
    setIsAIEnabled,
    setProjectName,
    setReviewComments,
    setSelectedJob,
    setSelectedService,
    setStep,
  ]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setDraftSessionId(createDraftSessionId());
    resetAttachments();
  }, [isOpen, resetAttachments, setDraftSessionId]);

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
  }, [calendarRef, isCalendarOpen, setIsCalendarOpen]);

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
  }, [
    isOpen,
    patchWizardState,
    resetAttachments,
    setCommentInput,
    setDeadline,
    setDescription,
    setDraftSessionId,
    setIsAIEnabled,
    setIsCalendarOpen,
    setProjectName,
    setReviewComments,
    setSelectedJob,
    setSelectedService,
  ]);
};
