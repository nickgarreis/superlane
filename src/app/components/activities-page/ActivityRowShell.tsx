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
  children,
}: ActivityRowShellProps) {
  const toneClass = activityKindToneClass(kind);
  const trimmedActorName = actorName.trim();
  const actorInitial = getInitial(actorName);
  let altText = "avatar";
  if (trimmedActorName.length > 0) {
    altText = `${trimmedActorName} avatar`;
  } else if (actorInitial !== "?") {
    altText = `${actorInitial} avatar`;
  }
  return (
    <div className={ACTIVITY_ROW_BASE_CLASS}>
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
        <p className={ACTIVITY_TITLE_CLASS}>{title}</p>
        <p className={ACTIVITY_META_CLASS}>{meta}</p>
        {children ? <div className="mt-1">{children}</div> : null}
      </div>
      <span className={ACTIVITY_KIND_BADGE_BASE_CLASS}>
        <span className={cn("inline-block h-2 w-2 rounded-full border", toneClass)} />
        {ACTIVITY_KIND_LABELS[kind]}
      </span>
    </div>
  );
}
