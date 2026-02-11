import { useCallback, useReducer, useRef, useState } from "react";
import { createClientId } from "../../../lib/id";
import type { ReviewComment } from "../../../types";
import {
  type CreateProjectWizardState,
  createInitialCreateProjectWizardState,
  reduceCreateProjectWizardState,
} from "../wizardState";
export const createDraftSessionId = () => createClientId("draft");
export const useWizardState = () => {
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
  const patchWizardState = useCallback(
    (patch: Partial<CreateProjectWizardState>) => {
      dispatchWizard({ type: "patch", patch });
    },
    [],
  );
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
  const [draftSessionId, setDraftSessionId] = useState(() =>
    createDraftSessionId(),
  );
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [commentInput, setCommentInput] = useState("");
  const calendarRef = useRef<HTMLDivElement>(null);
  const commentsEndRef = useRef<HTMLDivElement>(null);
  return {
    step,
    showCloseConfirm,
    showDeleteConfirm,
    showDeleteProjectConfirm,
    createdProjectId,
    isApprovingReview,
    patchWizardState,
    setStep,
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
    setDraftSessionId,
    reviewComments,
    setReviewComments,
    commentInput,
    setCommentInput,
    calendarRef,
    commentsEndRef,
  };
};
export type WizardStateValues = ReturnType<typeof useWizardState>;
