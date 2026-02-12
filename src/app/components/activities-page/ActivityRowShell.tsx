import React from "react";
import { Check } from "lucide-react";
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

type ActivityRowShellProps = {
  kind: ActivityKindFilter;
  title: string;
  meta: string;
  actorName: string;
  actorAvatarUrl: string | null;
  kindIcon?: React.ReactNode;
  isRead?: boolean;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onClick?: () => void;
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
  onClick,
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
  return (
    <div
      className={cn(
        ACTIVITY_ROW_BASE_CLASS,
        "relative",
        isUnread ? "border-l-2 border-l-accent-soft-border-strong pl-[14px]" : undefined,
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
          "mt-0.5",
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
        <span className="sr-only">{ACTIVITY_KIND_LABELS[kind]}</span>
      </span>
      <div className={cn("min-w-0 flex-1", isUnread && onMarkRead ? "pr-10" : undefined)}>
        <p className={cn(ACTIVITY_TITLE_CLASS, "flex min-w-0 items-center gap-2")}>
          <span className="min-w-0 [overflow-wrap:anywhere]">{title}</span>
        </p>
        <p className={cn(ACTIVITY_META_CLASS, isUnread ? "txt-tone-muted" : undefined)}>{meta}</p>
        {contextItems && contextItems.length > 0 ? (
          <div className="mt-1 flex min-w-0 flex-wrap gap-1.5">
            {contextItems.map((item, index) => (
              <span
                key={`${item.label}:${item.value}:${index}`}
                className="inline-flex min-w-0 max-w-full items-center gap-1 rounded-md border border-border-soft bg-surface-muted-soft px-1.5 py-0.5 txt-role-body-sm txt-tone-subtle"
              >
                <span className="shrink-0 txt-role-kbd uppercase tracking-wider txt-tone-faint">
                  {item.label}
                </span>
                <span className="min-w-0 [overflow-wrap:anywhere]">{item.value}</span>
              </span>
            ))}
          </div>
        ) : null}
        {children ? <div className="mt-1 min-w-0 [overflow-wrap:anywhere]">{children}</div> : null}
      </div>
      {isUnread && onMarkRead ? (
        <button
          type="button"
          aria-label="Mark read"
          title="Mark read"
          onClick={(event) => {
            event.stopPropagation();
            onMarkRead();
          }}
          className="absolute right-4 top-5 inline-flex h-7 w-7 items-center justify-center rounded-md border border-border-soft txt-tone-subtle transition-colors hover:bg-control-surface-muted hover:txt-tone-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
        >
          <Check size={14} strokeWidth={2} aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
