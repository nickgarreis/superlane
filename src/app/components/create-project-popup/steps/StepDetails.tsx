import type { RefObject } from "react";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import type { PendingDraftAttachmentUpload } from "../../../types";
import { StepDetailsStep2 } from "./StepDetailsStep2";
import { StepDetailsStep3 } from "./StepDetailsStep3";

const JOB_OPTIONS = [
  "I would like to discuss some possibilities",
  "Create something new",
  "Refine something existing",
];

const WEB_DESIGN_SCOPE = [
  "UI/UX Audit",
  "Landing page(s)",
  "Website",
  "Web content or elements",
  "Design system",
  "Product design",
  "Interactive animations",
];

const WEB_DESIGN_SCOPE_ICONS: Record<string, string> = {
  "UI/UX Audit": "\u{1F4E5}",
  "Landing page(s)": "\u{1F4C4}",
  Website: "\u{1F310}",
  "Web content or elements": "\u{1F58C}\uFE0F",
  "Design system": "\u{1F3A8}",
  "Product design": "\u{1F4F1}",
  "Interactive animations": "\u{1F300}",
};

export const STEP_THREE_TITLE = "Let's explore some possibilities";

const isWebDesignService = (selectedService: string | null) =>
  selectedService === "Web Design";

export const getStepDetailsJobLabel = (selectedService: string | null) =>
  isWebDesignService(selectedService) ? "Scope" : "Job";

type StepDetailsProps = {
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
  const jobOptions = isWebDesignService(selectedService)
    ? WEB_DESIGN_SCOPE
    : JOB_OPTIONS;
  const jobIcons = isWebDesignService(selectedService)
    ? WEB_DESIGN_SCOPE_ICONS
    : null;
  const service = selectedService || "Web Design";

  if (step === 2) {
    return (
      <StepDetailsStep2
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
