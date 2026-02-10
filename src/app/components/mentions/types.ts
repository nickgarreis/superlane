export type MentionEntityType = "task" | "file" | "user";

export type MentionItem = {
  type: MentionEntityType;
  id: string;
  label: string;
  meta?: string;
  completed?: boolean;
  avatar?: string;
};

export type MentionToken = {
  type: MentionEntityType;
  label: string;
};

export const MENTION_TOKEN_SPLIT_REGEX = /(@\[(?:task|file|user):[^\]]+\])/;
export const MENTION_TOKEN_FULL_REGEX = /^@\[(task|file|user):([^\]]+)\]$/;
