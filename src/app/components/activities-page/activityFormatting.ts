import type { WorkspaceActivity } from "../../types";

export type ActivityContextItem = {
  label: string;
  value: string;
};

const numberFormatter = new Intl.NumberFormat("en-US");

const normalizeLabel = (label: string) => {
  const trimmed = label.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed.replace(/\s+/g, " ");
};

const normalizeValue = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  return trimmed;
};

const normalizeMessageFieldLabel = (field: string) => {
  return field
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const toDisplayMessageValue = (value: unknown): string | null => {
  if (typeof value === "string") {
    return normalizeValue(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return null;
    }
    return numberFormatter.format(value);
  }
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }
  return null;
};

const parseMessageObject = (
  message: string | null | undefined,
): Record<string, unknown> | null => {
  const normalized = normalizeValue(message);
  if (!normalized || (!normalized.startsWith("{") && !normalized.startsWith("["))) {
    return null;
  }
  try {
    const parsed = JSON.parse(normalized);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
};

export const buildContextItems = (
  entries: Array<{
    label: string;
    value: string | null | undefined;
  }>,
): ActivityContextItem[] => {
  const contextItems: ActivityContextItem[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const label = normalizeLabel(entry.label);
    const value = normalizeValue(entry.value);
    if (!label || !value) {
      continue;
    }
    const dedupeKey = `${label.toLowerCase()}::${value.toLowerCase()}`;
    if (seen.has(dedupeKey)) {
      continue;
    }
    seen.add(dedupeKey);
    contextItems.push({ label, value });
  }
  return contextItems;
};

export const extractStructuredMessageContext = (
  message: string | null | undefined,
): ActivityContextItem[] => {
  const parsed = parseMessageObject(message);
  if (!parsed) {
    return [];
  }
  const entries = Object.entries(parsed).slice(0, 6).map(([field, value]) => ({
    label: normalizeMessageFieldLabel(field),
    value: toDisplayMessageValue(value),
  }));
  return buildContextItems(entries);
};

export const formatActivityMessage = (message: string | null | undefined) => {
  const structuredItems = extractStructuredMessageContext(message);
  if (structuredItems.length > 0) {
    return {
      plainText: null,
      structuredItems,
    };
  }
  return {
    plainText: normalizeValue(message),
    structuredItems: [] as ActivityContextItem[],
  };
};

export const formatRelativeActivityTime = (timestampEpochMs: number) => {
  const diffSeconds = Math.max(0, Math.floor((Date.now() - timestampEpochMs) / 1000));
  if (diffSeconds < 60) return "Just now";
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} min ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return new Date(timestampEpochMs).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatActivityMeta = (activity: WorkspaceActivity) => {
  return formatRelativeActivityTime(activity.createdAt);
};
