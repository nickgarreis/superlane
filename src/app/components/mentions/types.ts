export type MentionEntityType = "task" | "file" | "user";

export type MentionToken = {
  type: MentionEntityType;
  label: string;
};

export const MENTION_TOKEN_SPLIT_REGEX = /(@\[(?:task|file|user):[^\]]+\])/;
export const MENTION_TOKEN_FULL_REGEX = /^@\[(task|file|user):([^\]]+)\]$/;
