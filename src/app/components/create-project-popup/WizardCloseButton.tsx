import React from "react";
import svgPaths from "../../../imports/svg-v61uoamt04";
type WizardCloseButtonProps = {
  className?: string;
  onClick: () => void;
  ariaLabel?: string;
};
export function WizardCloseButton({
  className = "",
  onClick,
  ariaLabel,
}: WizardCloseButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? "Close"}
      onClick={onClick}
      className={`backdrop-blur-[6px] bg-[rgba(232,232,232,0.06)] content-stretch flex items-center justify-center p-px relative rounded-full shrink-0 size-[36px] hover:bg-[rgba(232,232,232,0.1)] transition-colors cursor-pointer ${className}`}
    >
      <div className="relative shrink-0 size-[20px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p369d2cf0} fill="var(--fill-0, #E8E8E8)" />
        </svg>
      </div>
    </button>
  );
}
