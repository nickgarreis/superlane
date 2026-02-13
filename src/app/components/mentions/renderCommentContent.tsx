import React, { useRef } from "react";
import { cn } from "../../../lib/utils";
import { parseMentionToken } from "./mentionParser";
import { MENTION_TOKEN_SPLIT_REGEX, type MentionEntityType } from "./types";
import {
  resolveMentionUserAvatar,
  type MentionUserAvatarLookup,
} from "./userAvatarLookup";

export type MentionRenderOptions = {
  userAvatarByLabel?: MentionUserAvatarLookup;
};

function UserInitials({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full bg-white/[0.12] txt-role-micro text-white/70 shrink-0 font-semibold leading-none">
      {initials}
    </span>
  );
}

function UserAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string;
}) {
  return (
    <img
      src={avatarUrl}
      alt={`${name} profile image`}
      className="w-[14px] h-[14px] rounded-full object-cover shrink-0"
    />
  );
}

function MentionBadge({
  type,
  label,
  onClick,
  options,
}: {
  type: MentionEntityType;
  label: string;
  onClick?: (type: MentionEntityType, label: string) => void;
  options?: MentionRenderOptions;
}) {
  const isTask = type === "task";
  const isFile = type === "file";
  const isUser = type === "user";
  const hasIconTopInset = isTask || isFile;
  const userAvatarUrl = isUser
    ? resolveMentionUserAvatar(options?.userAvatarByLabel, label)
    : null;
  const clickable = Boolean(onClick);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const handleClick = clickable
    ? (event: React.MouseEvent) => {
        event.stopPropagation();
        const element = badgeRef.current;
        if (element) {
          element.classList.remove("mention-badge-pulse");
          void element.offsetWidth;
          element.classList.add("mention-badge-pulse");
        }
        onClick?.(type, label);
      }
    : undefined;
  return (
    <span
      ref={badgeRef}
      className={cn(
        "inline-flex max-w-full min-w-0 items-start gap-[4px] mx-[1px] px-[3px] py-[1px] txt-role-body-sm",
        "align-baseline relative rounded-[4px] transition-colors",
        clickable
          ? "cursor-pointer hover:bg-surface-hover-soft hover:text-white active:bg-surface-active-soft active:scale-[0.97]"
          : "cursor-default",
        "txt-tone-primary",
      )}
      onClick={handleClick}
    >
      <span className={cn("shrink-0", hasIconTopInset ? "pt-[2px]" : undefined)}>
        {isTask ? (
          <span className="txt-role-body-sm leading-none">📋</span>
        ) : isFile ? (
          <span className="txt-role-body-sm leading-none">📂</span>
        ) : userAvatarUrl ? (
          <UserAvatar name={label} avatarUrl={userAvatarUrl} />
        ) : (
          <UserInitials name={label} />
        )}
      </span>
      <span className="min-w-0 break-words font-semibold">{label}</span>
    </span>
  );
}
export function renderCommentContent(
  content: string,
  onMentionClick?: (type: MentionEntityType, label: string) => void,
  options?: MentionRenderOptions,
): React.ReactNode {
  const segments = content.split(MENTION_TOKEN_SPLIT_REGEX);
  if (segments.length === 1) {
    return content;
  }
  return (
    <>
      {segments.map((segment, index) => {
        const token = parseMentionToken(segment);
        if (!token) {
          return segment || null;
        }
        return (
          <MentionBadge
            key={`mention-${index}`}
            type={token.type}
            label={token.label}
            onClick={onMentionClick}
            options={options}
          />
        );
      })}
    </>
  );
}
