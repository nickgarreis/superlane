import {
  Bell,
  Building2,
  HardDrive,
  ListChecks,
  Palette,
  Settings,
  User,
  type LucideIcon,
} from "lucide-react";

export const ACTIVITY_ROW_BASE_CLASS =
  "group flex w-full min-w-0 items-start gap-3 overflow-x-hidden py-5";

export const ACTIVITY_META_CLASS =
  "txt-role-body-sm txt-tone-faint";

export const ACTIVITY_TITLE_CLASS =
  "txt-role-body-md txt-tone-primary";

export const ACTIVITY_KIND_BADGE_BASE_CLASS =
  "size-8 rounded-lg flex items-center justify-center shrink-0";

export const ACTIVITY_PAGE_ROOT_CLASS =
  "relative flex h-full flex-1 flex-col overflow-hidden bg-bg-base font-app txt-tone-primary";

export const ACTIVITY_PAGE_SURFACE_CLASS =
  "relative flex flex-1 flex-col overflow-hidden rounded-none bg-bg-surface transition-all duration-500 ease-in-out";

export const ACTIVITY_EMPTY_STATE_CLASS =
  "border-t border-border-subtle-soft px-6 py-10 text-center";

export const ACTIVITY_FILTER_MENU_CLASS =
  "absolute right-0 top-full z-20 mt-2 w-64 animate-in fade-in zoom-in-95 duration-100 rounded-xl border border-popup-border-soft bg-bg-popup p-1 shadow-menu-surface";

export const ACTIVITY_FILTER_ITEM_CLASS =
  "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left txt-role-body-sm transition-colors";

export const ACTIVITY_KINDS = [
  "project",
  "task",
  "collaboration",
  "file",
  "membership",
  "workspace",
  "organization",
] as const;

export type ActivityKindFilter = (typeof ACTIVITY_KINDS)[number];

export const ACTIVITY_KIND_LABELS: Record<ActivityKindFilter, string> = {
  project: "Projects",
  task: "Tasks",
  collaboration: "Collaboration",
  file: "Files",
  membership: "Members",
  workspace: "Workspace",
  organization: "Organization",
};

export const ACTIVITY_KIND_ICONS: Record<ActivityKindFilter, LucideIcon> = {
  project: Palette,
  task: ListChecks,
  collaboration: Bell,
  file: HardDrive,
  membership: User,
  workspace: Building2,
  organization: Settings,
};

export const activityKindIconChrome = (kind: ActivityKindFilter) => {
  switch (kind) {
    case "project":
      return {
        containerClass: "bg-surface-hover-soft",
        iconClass: "text-text-muted-medium",
      };
    case "task":
      return {
        containerClass: "bg-surface-muted-soft",
        iconClass: "text-text-muted-medium",
      };
    case "file":
      return {
        containerClass: "bg-surface-muted-soft",
        iconClass: "text-text-muted-medium",
      };
    case "collaboration":
    case "membership":
    case "workspace":
    case "organization":
      return {
        containerClass: "bg-text-tone-accent-soft",
        iconClass: "txt-tone-accent",
      };
    default:
      return {
        containerClass: "bg-text-tone-accent-soft",
        iconClass: "txt-tone-accent",
      };
  }
};
