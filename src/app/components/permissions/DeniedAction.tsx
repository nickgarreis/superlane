import React, {
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { cn } from "../../../lib/utils";
import { TOOLTIP_SURFACE_CLASS } from "../ui/menuChrome";
type DeniedActionProps = {
  denied: boolean;
  reason?: string | null;
  children: ReactNode;
  className?: string;
  tooltipClassName?: string;
  tooltipAlign?: "left" | "right" | "center";
  tooltipSide?: "top" | "bottom";
};
const TOOLTIP_ALIGN_CLASS: Record<
  NonNullable<DeniedActionProps["tooltipAlign"]>,
  string
> = { left: "left-0", right: "right-0", center: "left-1/2 -translate-x-1/2" };
const TOOLTIP_SIDE_CLASS: Record<
  NonNullable<DeniedActionProps["tooltipSide"]>,
  string
> = { top: "bottom-[calc(100%+6px)]", bottom: "top-[calc(100%+6px)]" };
export function DeniedAction({
  denied,
  reason,
  children,
  className,
  tooltipClassName,
  tooltipAlign = "right",
  tooltipSide = "bottom",
}: DeniedActionProps) {
  const handleBlockedPointer = (event: MouseEvent<HTMLDivElement>) => {
    if (!denied) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  const handleBlockedKeyboard = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!denied) {
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <div
      className={cn("relative", denied && "group/denied-action", className)}
      onClickCapture={handleBlockedPointer}
      onMouseDownCapture={handleBlockedPointer}
      onKeyDownCapture={handleBlockedKeyboard}
    >
      {children}
      {denied && reason && (
        <div
          role="tooltip"
          className={cn(
            "pointer-events-none absolute z-60 w-[min(280px,calc(100vw-24px))] rounded-[10px] px-2.5 py-1.5 text-left txt-role-meta txt-leading-compact font-medium txt-tone-muted opacity-0 transition-all duration-200 ease-out",
            TOOLTIP_SURFACE_CLASS,
            TOOLTIP_ALIGN_CLASS[tooltipAlign],
            TOOLTIP_SIDE_CLASS[tooltipSide],
            tooltipSide === "top"
              ? "-translate-y-0.5 group-hover/denied-action:-translate-y-0"
              : "translate-y-0.5 group-hover/denied-action:translate-y-0",
            "group-hover/denied-action:opacity-100",
            tooltipClassName,
          )}
        >
          {reason}
        </div>
      )}
    </div>
  );
}
