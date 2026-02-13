export const POPUP_OVERLAY_BASE_CLASS =
  "fixed inset-0 bg-black/50 backdrop-blur-sm p-4 safe-px safe-pb";

export const POPUP_OVERLAY_CENTER_CLASS = `${POPUP_OVERLAY_BASE_CLASS} z-50 flex items-center justify-center`;

export const POPUP_SHELL_CLASS =
  "relative w-full bg-bg-popup rounded-[40px] shadow-popup-shell overflow-hidden";

export const POPUP_SHELL_MOBILE_CLASS =
  "max-md:!w-full max-md:!max-w-none max-md:!h-[100dvh] max-md:!max-h-[100dvh] max-md:!rounded-none";

export const POPUP_SECTION_MOBILE_SCROLL_CLASS =
  "max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto";

export const POPUP_SHELL_BORDER_CLASS =
  "absolute inset-0 z-10 pointer-events-none rounded-[inherit]";

export const POPUP_CLOSE_BUTTON_CLASS =
  "backdrop-blur-[6px] bg-popup-control rounded-full flex items-center justify-center txt-tone-primary hover:bg-popup-control-hover transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed";
