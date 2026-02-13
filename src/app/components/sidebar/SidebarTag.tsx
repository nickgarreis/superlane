import React from "react";
import { cn } from "../../../lib/utils";

const SIDEBAR_TAG_BASE_CLASS =
  "inline-flex h-[19px] items-center px-2 py-[2px] txt-role-kbd font-medium shrink-0 whitespace-nowrap rounded-full border";

export type SidebarTagTone = "approved" | "inboxUnread" | "important";

const SIDEBAR_TAG_TONE_CLASS: Record<SidebarTagTone, string> = {
  approved:
    "txt-tone-warning [background-color:var(--activity-collaboration-bg)] [border-color:var(--activity-collaboration-border)]",
  inboxUnread:
    "h-[20px] min-w-[20px] justify-center px-1.5 txt-role-meta txt-tone-accent bg-accent-soft-bg border-accent-soft-border",
  important:
    "txt-tone-danger border-popup-danger-soft-strong bg-popup-danger-soft",
};

export type SidebarTagProps = {
  tone: SidebarTagTone;
  children: React.ReactNode;
  className?: string;
};

export function SidebarTag({ tone, children, className }: SidebarTagProps) {
  return (
    <span
      data-sidebar-tag-tone={tone}
      className={cn(SIDEBAR_TAG_BASE_CLASS, SIDEBAR_TAG_TONE_CLASS[tone], className)}
    >
      {children}
    </span>
  );
}
