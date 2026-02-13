import type { RefObject } from "react";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import type {
  PendingDraftAttachmentUpload,
} from "../../../types";
import {
  DEFAULT_CREATE_PROJECT_SERVICE,
  getServiceJobConfig,
  getServiceJobLabel,
  normalizeServiceName,
} from "../../../lib/projectServices";
import { StepDetailsStep2 } from "./StepDetailsStep2";
import { StepDetailsStep3 } from "./StepDetailsStep3";
export const STEP_THREE_TITLE = "Let's explore some possibilities";
export const getStepDetailsJobLabel = (selectedService: string | null) =>
  getServiceJobLabel(selectedService);
type StepDetailsProps = {
  isMobile?: boolean;
  step: 2 | 3;
  selectedService: string | null;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  selectedJob: string | null;
  onSelectJob: (job: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  isAIEnabled: boolean;
  onToggleAIEnabled: () => void;
  deadline: Date | undefined;
  onSelectDeadline: (date: Date) => void;
  isCalendarOpen: boolean;
  onCalendarOpenChange: (open: boolean) => void;
  calendarRef: RefObject<HTMLDivElement>;
  attachments: PendingDraftAttachmentUpload[];
  getRootProps: () => DropzoneRootProps;
  getInputProps: () => DropzoneInputProps;
  isDragActive: boolean;
  onRetryAttachment: (clientId: string) => void;
  onRemoveAttachment: (clientId: string) => void;
};
export function StepDetails({
  isMobile = false,
  step,
  selectedService,
  projectName,
  onProjectNameChange,
  selectedJob,
  onSelectJob,
  description,
  onDescriptionChange,
  isAIEnabled,
  onToggleAIEnabled,
  deadline,
  onSelectDeadline,
  isCalendarOpen,
  onCalendarOpenChange,
  calendarRef,
  attachments,
  getRootProps,
  getInputProps,
  isDragActive,
  onRetryAttachment,
  onRemoveAttachment,
}: StepDetailsProps) {
  const jobLabel = getStepDetailsJobLabel(selectedService);
  const { jobOptions, jobIcons } = getServiceJobConfig(selectedService);
  const service = normalizeServiceName(
    selectedService ?? DEFAULT_CREATE_PROJECT_SERVICE,
  );
  if (step === 2) {
    return (
      <StepDetailsStep2
        isMobile={isMobile}
        service={service}
        projectName={projectName}
        onProjectNameChange={onProjectNameChange}
        jobLabel={jobLabel}
        jobOptions={jobOptions}
        jobIcons={jobIcons}
        selectedJob={selectedJob}
        onSelectJob={onSelectJob}
      />
    );
  }
  return (
    <StepDetailsStep3
      isMobile={isMobile}
      description={description}
      onDescriptionChange={onDescriptionChange}
      attachments={attachments}
      getRootProps={getRootProps}
      getInputProps={getInputProps}
      isDragActive={isDragActive}
      onRetryAttachment={onRetryAttachment}
      onRemoveAttachment={onRemoveAttachment}
      isAIEnabled={isAIEnabled}
      onToggleAIEnabled={onToggleAIEnabled}
      deadline={deadline}
      onSelectDeadline={onSelectDeadline}
      isCalendarOpen={isCalendarOpen}
      onCalendarOpenChange={onCalendarOpenChange}
      calendarRef={calendarRef}
    />
  );
}
