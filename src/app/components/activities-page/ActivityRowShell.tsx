import React from "react";
import { cn } from "../../../lib/utils";
import {
  ACTIVITY_KIND_BADGE_BASE_CLASS,
  ACTIVITY_KIND_LABELS,
  ACTIVITY_META_CLASS,
  ACTIVITY_ROW_BASE_CLASS,
  ACTIVITY_TITLE_CLASS,
  activityKindToneClass,
  type ActivityKindFilter,
} from "./activityChrome";

type ActivityRowShellProps = {
  kind: ActivityKindFilter;
  title: string;
  meta: string;
  actorName: string;
  actorAvatarUrl: string | null;
  isRead?: boolean;
  showReadState?: boolean;
  onMarkRead?: () => void;
  onClick?: () => void;
  children?: React.ReactNode;
};

const getInitial = (name: string) => {
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed[0].toUpperCase() : "?";
};

export function ActivityRowShell({
  kind,
  title,
  meta,
  actorName,
  actorAvatarUrl,
  isRead,
  showReadState = false,
  onMarkRead,
  onClick,
  children,
}: ActivityRowShellProps) {
  const toneClass = activityKindToneClass(kind);
  const isUnread = showReadState && isRead === false;
  const interactive = typeof onClick === "function";
  const trimmedActorName = actorName.trim();
  const actorInitial = getInitial(actorName);
  let altText = "avatar";
  if (trimmedActorName.length > 0) {
    altText = `${trimmedActorName} avatar`;
  } else if (actorInitial !== "?") {
    altText = `${actorInitial} avatar`;
  }
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
        isUnread ? "bg-surface-active-soft" : undefined,
        interactive
          ? "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/35"
          : undefined,
      )}
      onClick={interactive ? onClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      <div className="flex shrink-0 items-center">
        <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full border border-border-soft bg-bg-muted-surface txt-role-body-sm txt-tone-muted">
          {actorAvatarUrl ? (
            <img
              src={actorAvatarUrl}
              alt={altText}
              className="h-full w-full object-cover"
            />
          ) : (
            <span>{getInitial(actorName)}</span>
          )}
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn(ACTIVITY_TITLE_CLASS, "flex min-w-0 items-center gap-2")}>
          {isUnread ? (
            <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-accent-soft-bg" />
          ) : null}
          <span className="truncate">{title}</span>
        </p>
        <p className={ACTIVITY_META_CLASS}>{meta}</p>
        {children ? <div className="mt-1">{children}</div> : null}
      </div>
      <span className={ACTIVITY_KIND_BADGE_BASE_CLASS}>
        <span className={cn("inline-block h-2 w-2 rounded-full border", toneClass)} />
        {ACTIVITY_KIND_LABELS[kind]}
      </span>
      {isUnread && onMarkRead ? (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onMarkRead();
          }}
          className="ml-3 shrink-0 rounded-md border border-border-soft px-2 py-1 txt-role-body-sm txt-tone-subtle transition-colors hover:bg-control-surface-muted hover:txt-tone-primary"
        >
          Mark read
        </button>
      ) : null}
    </div>
  );
}
