import type { KeyboardEvent, RefObject } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DayPicker } from "react-day-picker";
import type { DropzoneInputProps, DropzoneRootProps } from "react-dropzone";
import {
  formatProjectDeadlineLong,
  toUtcNoonEpochMsFromDateOnly,
} from "../../../lib/dates";
import type { PendingDraftAttachmentUpload } from "../../../types";
import { ProjectLogo } from "../../ProjectLogo";

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

const step3Paths = {
  p7659d00:
    "M5.25317 6.2182C5.46077 6.0106 5.7822 6.01729 5.96969 6.21152L8.56792 8.96373L11.1527 6.21152C11.3402 6.0106 11.675 6.01729 11.8692 6.22489C12.05 6.41237 12.0433 6.72043 11.8491 6.92803L9.21746 9.71373C8.86923 10.0954 8.25317 10.0954 7.90494 9.71373L5.27323 6.92803C5.09917 6.74049 5.08574 6.39232 5.25317 6.2182Z",
};

export const STEP_THREE_TITLE = "Let's explore some possibilities";

const isWebDesignService = (selectedService: string | null) =>
  selectedService === "Web Design";

export const getStepDetailsJobLabel = (selectedService: string | null) =>
  isWebDesignService(selectedService) ? "Scope" : "Job";

const handleKeyDown = (event: KeyboardEvent, action: () => void) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
};

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
  calendarRef: RefObject<HTMLDivElement | null>;
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
  const step2JobLabel = getStepDetailsJobLabel(selectedService);
  const step2JobOptions = isWebDesignService(selectedService)
    ? WEB_DESIGN_SCOPE
    : JOB_OPTIONS;
  const step2JobIcons = isWebDesignService(selectedService)
    ? WEB_DESIGN_SCOPE_ICONS
    : null;
  const step2Service = selectedService || "Web Design";

  if (step === 2) {
    return (
      <div className="pt-[29px] flex flex-col items-center gap-[32px] w-full">
        <div className="flex flex-col items-center gap-4 pt-[20px]">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <ProjectLogo size={108} category={step2Service} />
          </motion.div>
          <motion.div
            initial={{ y: 6, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.35 }}
            className="flex flex-col font-['Roboto:Medium',sans-serif] font-medium justify-center leading-[0] relative shrink-0 text-[#e8e8e8] text-[17.7px] whitespace-nowrap"
          >
            <p className="leading-[25.2px]">Define project details</p>
          </motion.div>
        </div>

        <div className="w-full flex flex-col gap-[16px]">
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className="w-full flex flex-col gap-[0.01px]"
          >
            <div className="pb-[8px] w-full">
              <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] leading-[19.6px]">
                Project name
              </p>
            </div>
            <div className="w-full border-b border-[rgba(232,232,232,0.1)] pb-[5px]">
              <input
                type="text"
                value={projectName}
                onChange={(event) => onProjectNameChange(event.target.value)}
                className="w-full bg-transparent border-none outline-none font-medium text-[#e8e8e8] text-[19.5px] leading-[32px] p-0 placeholder-white/20"
                placeholder="Enter project name..."
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.35 }}
            className="w-full pt-[16px]"
          >
            <div className="pb-[8px] w-full">
              <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] leading-[19.6px]">
                {step2JobLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-[6px] items-start w-full">
              {step2JobOptions.map((job, idx) => (
                <motion.div
                  key={job}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.42 + idx * 0.04, duration: 0.3 }}
                  onClick={() => onSelectJob(job)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => handleKeyDown(event, () => onSelectJob(job))}
                  className={`
                    backdrop-blur-[6px] bg-[rgba(232,232,232,0.04)] content-stretch flex h-[36px] items-center px-[17px] py-[7px] relative rounded-full shrink-0 cursor-pointer border transition-all outline-none focus-visible:ring-2 focus-visible:ring-white/50
                    ${
                      selectedJob === job
                        ? "bg-white/10 border-white/20 text-white"
                        : "border-[rgba(232,232,232,0.04)] hover:bg-white/5 text-[#e8e8e8]"
                    }
                  `}
                >
                  <p className="font-medium text-[14px] leading-[20px] whitespace-nowrap">
                    {step2JobIcons?.[job] && (
                      <span className="mr-[6px]">{step2JobIcons[job]}</span>
                    )}
                    {job}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-[16px] w-full flex flex-col h-[480px] overflow-y-auto custom-scrollbar pr-1">
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="w-full mb-[32px]"
      >
        <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] mb-[8px]">
          Project description
        </p>
        <div className="bg-[rgba(232,232,232,0.04)] h-[104px] rounded-[18px] w-full border border-[rgba(232,232,232,0.04)] relative">
          <textarea
            className="w-full h-full bg-transparent border-none outline-none resize-none p-[16px] text-[#e8e8e8] text-[14px] placeholder-[rgba(232,232,232,0.4)]"
            placeholder="Enter workflow description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.35 }}
        className="w-full mb-[32px]"
      >
        <p className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] mb-[8px]">
          Attachments
        </p>

        <div
          {...getRootProps()}
          className={`
            border border-dashed border-[rgba(232,232,232,0.2)] rounded-[18px] w-full min-h-[64px] flex flex-col items-center justify-center cursor-pointer transition-colors relative p-4
            ${isDragActive ? "bg-white/10 border-white/40" : "hover:bg-[rgba(232,232,232,0.04)]"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex items-center gap-2 mb-1">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-[#e8e8e8] opacity-60"
            >
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
            <span className="text-[14px] text-[#e8e8e8] opacity-60 font-medium">
              {isDragActive ? "Drop files here..." : "Upload file"}
            </span>
          </div>

          {attachments.length > 0 && (
            <div className="flex flex-col gap-1 mt-2 w-full">
              {attachments.map((file) => (
                <div
                  key={file.clientId}
                  className="flex items-center justify-between text-xs text-white/60 bg-white/5 rounded px-2 py-1"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate max-w-[250px]">{file.name}</span>
                    <span className="text-[10px] text-white/40">
                      {file.status === "uploading" && "Uploading..."}
                      {file.status === "uploaded" && "Uploaded"}
                      {file.status === "error" && (file.error || "Upload failed")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {file.status === "error" && (
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onRetryAttachment(file.clientId);
                        }}
                        className="text-[10px] text-white/70 hover:text-white"
                      >
                        Retry
                      </button>
                    )}
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onRemoveAttachment(file.clientId);
                      }}
                      className="hover:text-white"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.35 }}
        className="w-full mb-[32px]"
      >
        <p className="font-medium text-[14px] text-[#e8e8e8] mb-[4px]">Allow AI usage</p>
        <p className="text-[13.8px] text-[rgba(232,232,232,0.6)] mb-[8px] leading-[19.6px]">
          Superlane will leverage AI tools when and if it&apos;s useful; for ideation,
          efficiency, volume and quality.
        </p>
        <div
          className={`${
            isAIEnabled ? "bg-[#22c55e]" : "bg-[rgba(232,232,232,0.08)]"
          } flex h-[16px] items-center px-[2px] relative rounded-[16px] w-[26px] cursor-pointer transition-colors`}
          onClick={onToggleAIEnabled}
          onKeyDown={(event) => handleKeyDown(event, onToggleAIEnabled)}
          role="switch"
          aria-checked={isAIEnabled}
          aria-label="Allow AI usage"
          tabIndex={0}
        >
          <motion.div
            className="bg-white rounded-[6px] shadow-[0px_2px_6px_0px_rgba(0,0,0,0.15)] size-[12px]"
            animate={{ x: isAIEnabled ? 10 : 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.35 }}
        className="w-full mb-[24px]"
      >
        <p className="font-medium text-[14px] text-[#e8e8e8] mb-[4px]">Final deadline</p>
        <p className="text-[13.7px] text-[rgba(232,232,232,0.6)] mb-[8px]">
          When do you expect to receive all assets ready to use?
        </p>

        <div className="relative w-full" ref={calendarRef}>
          <div
            className="bg-[rgba(255,255,255,0)] flex items-center h-[36px] rounded-[100px] shadow-[0px_0px_0px_1px_rgba(232,232,232,0.15)] w-full px-[20px] relative cursor-pointer hover:bg-white/5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            onClick={() => onCalendarOpenChange(!isCalendarOpen)}
            onKeyDown={(event) =>
              handleKeyDown(event, () => onCalendarOpenChange(!isCalendarOpen))
            }
            role="button"
            aria-haspopup="dialog"
            aria-expanded={isCalendarOpen}
            aria-label="Toggle deadline calendar"
            tabIndex={0}
          >
            <div className="flex-1 text-[#e8e8e8] text-[14px] font-medium">
              {formatProjectDeadlineLong(
                deadline ? toUtcNoonEpochMsFromDateOnly(deadline) : null,
              )}
            </div>
            <div className="size-[16px] shrink-0 opacity-80">
              <svg className="block size-full" fill="none" viewBox="0 0 16 16">
                <path
                  d={step3Paths.p7659d00}
                  fill="var(--fill-0, #E8E8E8)"
                  fillOpacity="0.8"
                />
              </svg>
            </div>
          </div>

          <AnimatePresence>
            {isCalendarOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-[calc(100%+8px)] right-0 z-50 p-2 bg-[rgba(30,31,32,0.98)] rounded-[14px] shadow-[0px_18px_40px_-28px_rgba(0,0,0,0.9)] border border-[rgba(232,232,232,0.12)]"
              >
                <DayPicker
                  className="rdp-dark-theme"
                  mode="single"
                  selected={deadline}
                  onSelect={(date) => {
                    if (!date) {
                      return;
                    }
                    onSelectDeadline(date);
                    onCalendarOpenChange(false);
                  }}
                  showOutsideDays
                  disabled={{ before: new Date() }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
