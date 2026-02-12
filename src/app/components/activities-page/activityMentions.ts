import type { MentionEntityType } from "../mentions/types";

const normalizeWhitespace = (value: string) => value.replace(/\s+/g, " ").trim();

export const sanitizeMentionLabel = (value: string | null | undefined): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = normalizeWhitespace(value.replace(/[[\]]+/g, ""));
  return normalized.length > 0 ? normalized : null;
};

export const toMentionToken = (
  type: MentionEntityType,
  label: string | null | undefined,
): string | null => {
  const sanitized = sanitizeMentionLabel(label);
  if (!sanitized) {
    return null;
  }
  return `@[${type}:${sanitized}]`;
};
