import {
  MENTION_TOKEN_FULL_REGEX,
  MENTION_TOKEN_SPLIT_REGEX,
  type MentionToken,
} from "./types";
import {
  resolveMentionUserAvatar,
  type MentionUserAvatarLookup,
} from "./userAvatarLookup";
const BADGE_BASE =
  "mention-badge inline-flex items-center gap-[4px] mx-[1px] whitespace-nowrap select-none align-baseline leading-normal txt-role-body-sm";
const TASK_BADGE_CLS = `${BADGE_BASE} txt-tone-primary`;
const FILE_BADGE_CLS = `${BADGE_BASE} txt-tone-primary`;
const USER_BADGE_CLS = `${BADGE_BASE} txt-tone-primary`;
const TASK_ICON =
  '<span style="font-size:12px;line-height:1;flex-shrink:0">📋</span>';
const FILE_ICON =
  '<span style="font-size:12px;line-height:1;flex-shrink:0">📂</span>';

export type MentionHTMLRenderOptions = {
  userAvatarByLabel?: MentionUserAvatarLookup;
};

function userInitialsHTML(name: string): string {
  const initials = escapeHtml(
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((word) => word.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase(),
  );
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);font-size:8px;font-weight:600;flex-shrink:0;line-height:1;letter-spacing:0.2px">${initials}</span>`;
}

function userAvatarHTML(name: string, avatarUrl: string): string {
  return `<img src="${escapeHtml(avatarUrl)}" alt="${escapeHtml(`${name} profile image`)}" style="display:inline-block;width:14px;height:14px;border-radius:50%;object-fit:cover;flex-shrink:0" />`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
export function parseMentionToken(token: string): MentionToken | null {
  const match = token.match(MENTION_TOKEN_FULL_REGEX);
  if (!match) {
    return null;
  }
  return { type: match[1] as MentionToken["type"], label: match[2] };
}
export function valueToHTML(
  value: string,
  options?: MentionHTMLRenderOptions,
): string {
  if (!value) {
    return "";
  }
  const segments = value.split(MENTION_TOKEN_SPLIT_REGEX);
  return segments
    .map((segment) => {
      const token = parseMentionToken(segment);
      if (!token) {
        return escapeHtml(segment).replace(/\n/g, "<br>");
      }
      const isTask = token.type === "task";
      const isFile = token.type === "file";
      const className = isTask
        ? TASK_BADGE_CLS
        : isFile
          ? FILE_BADGE_CLS
          : USER_BADGE_CLS;
      const icon = isTask
        ? TASK_ICON
        : isFile
          ? FILE_ICON
          : (() => {
              const avatarUrl = resolveMentionUserAvatar(
                options?.userAvatarByLabel,
                token.label,
              );
              return avatarUrl
                ? userAvatarHTML(token.label, avatarUrl)
                : userInitialsHTML(token.label);
            })();
      return `<span contenteditable="false" data-mention="${escapeHtml(segment)}" class="${className}">${icon}<span style="font-weight:600">${escapeHtml(token.label)}</span></span>`;
    })
    .join("");
}
