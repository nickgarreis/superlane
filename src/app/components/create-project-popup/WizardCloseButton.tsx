import React from "react";
import svgPaths from "../../../imports/svg-v61uoamt04";
import { POPUP_CLOSE_BUTTON_CLASS } from "../popup/popupChrome";
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
      className={`${POPUP_CLOSE_BUTTON_CLASS} content-stretch p-px relative shrink-0 size-[36px] ${className}`}
    >
      <div className="relative shrink-0 size-[20px]">
        <svg
          className="block size-full"
          fill="none"
          preserveAspectRatio="none"
          viewBox="0 0 20 20"
        >
          <path d={svgPaths.p369d2cf0} fill="var(--text-tone-primary)" />
        </svg>
      </div>
    </button>
  );
}
