import React, { useRef } from "react";
import { cn } from "../../../lib/utils";
import { parseMentionToken } from "./mentionParser";
import { MENTION_TOKEN_SPLIT_REGEX, type MentionEntityType } from "./types";
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
function MentionBadge({
  type,
  label,
  onClick,
}: {
  type: MentionEntityType;
  label: string;
  onClick?: (type: MentionEntityType, label: string) => void;
}) {
  const isTask = type === "task";
  const isFile = type === "file";
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
        "inline-flex items-center gap-[4px] mx-[1px] whitespace-nowrap txt-role-body-sm",
        "align-baseline relative transition-colors",
        clickable
          ? "cursor-pointer hover:text-white active:scale-[0.97]"
          : "cursor-default",
        "txt-tone-primary",
      )}
      onClick={handleClick}
    >
      {isTask ? (
        <span className="txt-role-body-sm leading-none shrink-0">📋</span>
      ) : isFile ? (
        <span className="txt-role-body-sm leading-none shrink-0">📂</span>
      ) : (
        <UserInitials name={label} />
      )}
      <span className="font-semibold">{label}</span>
    </span>
  );
}
export function renderCommentContent(
  content: string,
  onMentionClick?: (type: MentionEntityType, label: string) => void,
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
          />
        );
      })}
    </>
  );
}
