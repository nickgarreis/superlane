import React from "react";
import { Check, Trash2 } from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  ACTIVITY_KIND_BADGE_BASE_CLASS,
  ACTIVITY_KIND_ICONS,
  ACTIVITY_KIND_LABELS,
  ACTIVITY_META_CLASS,
  ACTIVITY_ROW_BASE_CLASS,
  ACTIVITY_TITLE_CLASS,
  activityKindIconChrome,
  type ActivityKindFilter,
} from "./activityChrome";
import type { ActivityContextItem } from "./activityFormatting";
import { TABLE_ACTION_ICON_BUTTON_CLASS } from "../ui/controlChrome";
import { SidebarTag } from "../sidebar/SidebarTag";

type ActivityRowShellProps = {
  kind: ActivityKindFilter;
  title: React.ReactNode;
  meta: string;
  actorName: string;
  actorAvatarUrl: string | null;
  kindIcon?: React.ReactNode;
  isRead?: boolean;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onDismiss?: () => void;
  onClick?: () => void;
  isInboxLayout?: boolean;
  isImportant?: boolean;
  contextItems?: ActivityContextItem[];
  children?: React.ReactNode;
};

export function ActivityRowShell({
  kind,
  title,
  meta,
  kindIcon,
  isRead,
  showReadState = false,
  onMarkRead,
  onDismiss,
  onClick,
  isInboxLayout = false,
  isImportant = false,
  contextItems,
  children,
}: ActivityRowShellProps) {
  const KindIcon = ACTIVITY_KIND_ICONS[kind];
  const iconChrome = activityKindIconChrome(kind);
  const isUnread = showReadState && isRead === false;
  const interactive = typeof onClick === "function";
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!interactive || !onClick) {
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    onClick();
  };
  const hasTopActions = (isUnread && Boolean(onMarkRead)) || Boolean(onDismiss);
  return (
    <div
      className={cn(
        ACTIVITY_ROW_BASE_CLASS,
        "relative",
        interactive
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          : undefined,
      )}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <span
        className={cn(
          "relative mt-0.5",
          ACTIVITY_KIND_BADGE_BASE_CLASS,
          iconChrome.containerClass,
        )}
        aria-label={`${ACTIVITY_KIND_LABELS[kind]} activity type`}
        title={ACTIVITY_KIND_LABELS[kind]}
      >
        {kindIcon ?? (
          <KindIcon
            size={15}
            strokeWidth={2}
            className={iconChrome.iconClass}
            aria-hidden="true"
          />
        )}
        {isUnread ? (
          <span
            aria-hidden="true"
            className="absolute -right-1 -top-1 size-2 rounded-full bg-text-tone-accent ring-2 ring-bg-surface"
          />
        ) : null}
        <span className="sr-only">{ACTIVITY_KIND_LABELS[kind]}</span>
      </span>
      <div
        className={cn(
          "min-w-0 flex-1",
          hasTopActions
            ? isInboxLayout
              ? "pr-20"
              : "pr-16"
            : undefined,
        )}
      >
        <p className={cn(ACTIVITY_TITLE_CLASS, "flex min-w-0 items-center gap-2")}>
          <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
        </p>
        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <p className={cn(ACTIVITY_META_CLASS, "min-w-0", isUnread ? "txt-tone-muted" : undefined)}>
            {meta}
          </p>
          {isImportant ? (
            <SidebarTag tone="important">
              Important
            </SidebarTag>
          ) : null}
        </div>
        {children ? <div className="mt-1 min-w-0 [overflow-wrap:anywhere]">{children}</div> : null}
      </div>
      {hasTopActions ? (
        <div className="absolute right-4 top-5 flex items-center gap-1">
          {isUnread && onMarkRead ? (
            <button
              type="button"
              aria-label="Mark read"
              title="Mark read"
              onClick={(event) => {
                event.stopPropagation();
                onMarkRead();
              }}
              className={cn(
                TABLE_ACTION_ICON_BUTTON_CLASS,
                "hover:bg-surface-hover-subtle hover:txt-tone-faint",
              )}
            >
              <Check size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}
          {onDismiss ? (
            <button
              type="button"
              aria-label="Dismiss activity"
              title="Dismiss activity"
              onClick={(event) => {
                event.stopPropagation();
                onDismiss();
              }}
              className={cn(
                TABLE_ACTION_ICON_BUTTON_CLASS,
                "hover:bg-popup-danger-soft-hover hover:txt-tone-danger",
              )}
            >
              <Trash2 size={14} strokeWidth={2} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
