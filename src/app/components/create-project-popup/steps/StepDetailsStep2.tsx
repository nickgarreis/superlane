import React, { memo, type KeyboardEvent } from "react";
import { motion } from "motion/react";
import { ProjectLogo } from "../../ProjectLogo";

type StepDetailsStep2Props = {
  service: string;
  projectName: string;
  onProjectNameChange: (value: string) => void;
  jobLabel: string;
  jobOptions: string[];
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
            <label
              htmlFor={PROJECT_NAME_INPUT_ID}
              className="font-medium text-[14px] text-[rgba(232,232,232,0.6)] leading-[19.6px]"
            >
              Project name
            </label>
          </div>
          <div className="w-full border-b border-[rgba(232,232,232,0.1)] pb-[5px]">
            <input
              id={PROJECT_NAME_INPUT_ID}
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
              {jobLabel}
            </p>
          </div>
          <div className="flex flex-wrap gap-[6px] items-start w-full">
            {jobOptions.map((job, idx) => (
              <motion.div
                key={job}
                initial={{ y: 6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.42 + idx * 0.04, duration: 0.3 }}
                onClick={() => onSelectJob(job)}
                role="button"
                tabIndex={0}
                onKeyDown={(event: KeyboardEvent) => handleKeyDown(event, () => onSelectJob(job))}
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
                  {jobIcons?.[job] && (
                    <span className="mr-[6px]">{jobIcons[job]}</span>
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
});
