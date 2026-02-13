import React, { memo, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { ProjectLogo } from "../../ProjectLogo";
type StepDetailsStep2Props = {
  service: string;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  jobLabel: string;
  jobOptions: readonly string[];
  jobIcons: Record<string, string> | null;
  selectedJob: string | null;
  onSelectJob: (job: string) => void;
};
const handleKeyDown = (event: KeyboardEvent, action: () => void) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    action();
  }
};
const PROJECT_NAME_INPUT_ID = "project-name";
const OPTION_ENTRANCE_EASE = [0.22, 1, 0.36, 1] as const;
export const StepDetailsStep2 = memo(function StepDetailsStep2({
  service,
  projectName,
  onProjectNameChange,
  jobLabel,
  jobOptions,
  jobIcons,
  selectedJob,
  onSelectJob,
}: StepDetailsStep2Props) {
  const showJobSelection = jobOptions.length > 0;
  return (
    <div className="pt-[29px] flex flex-col items-center gap-[32px] w-full">
      <div className="flex flex-col items-center gap-4 pt-[20px]">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ProjectLogo size={108} category={service} />
        </motion.div>
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className="flex flex-col font-app justify-center leading-none relative shrink-0 txt-tone-primary txt-role-panel-title whitespace-nowrap"
        >
          <p className="txt-leading-title">Define project details</p>
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
            <label
              htmlFor={PROJECT_NAME_INPUT_ID}
              className="font-medium txt-role-body-lg txt-tone-subtle txt-leading-body"
            >
              Project name
            </label>
          </div>
          <div className="w-full border-b border-popup-border-soft pb-[5px]">
            <input
              id={PROJECT_NAME_INPUT_ID}
              type="text"
              value={projectName}
              onChange={(event) => onProjectNameChange(event.target.value)}
              className="w-full bg-transparent border-none outline-none txt-tone-primary txt-role-page-title txt-leading-display-lg p-0 placeholder:text-white/20"
              placeholder="Enter project name..."
            />
          </div>
        </motion.div>
        {showJobSelection && (
          <motion.div
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.35 }}
            className="w-full pt-[16px]"
          >
            <div className="pb-[8px] w-full">
              <p className="font-medium txt-role-body-lg txt-tone-subtle txt-leading-body">
                {jobLabel}
              </p>
            </div>
            <div className="flex flex-wrap gap-[6px] items-start w-full">
              {jobOptions.map((job, idx) => (
                <motion.div
                  key={job}
                  initial={{ y: 6, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{
                    delay: 0.42 + idx * 0.04,
                    duration: 0.3,
                    type: "tween",
                    ease: OPTION_ENTRANCE_EASE,
                  }}
                  onClick={() => onSelectJob(job)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event: KeyboardEvent) =>
                    handleKeyDown(event, () => onSelectJob(job))
                  }
                  className={` backdrop-blur-[6px] bg-popup-surface-soft content-stretch flex h-[36px] items-center px-[17px] py-[7px] relative rounded-full shrink-0 cursor-pointer border transition-colors outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${selectedJob === job ? "bg-white/10 border-white/20 text-white" : "border-popup-surface-soft hover:bg-white/5 txt-tone-primary"} `}
                >
                  <p className="font-medium txt-role-body-lg txt-leading-body whitespace-nowrap">
                    {jobIcons?.[job] && (
                      <span className="mr-[6px]">{jobIcons[job]}</span>
                    )}
                    {job}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
});
