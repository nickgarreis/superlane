export type MentionUserAvatarLookup = ReadonlyMap<string, string>;

export type MentionUserAvatarEntry = {
  label: string | null | undefined;
  avatarUrl: string | null | undefined;
};

const normalizeLabel = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim().replace(/\s+/g, " ").toLowerCase();
  return normalized.length > 0 ? normalized : null;
};

const normalizeAvatarUrl = (value: string | null | undefined) => {
  if (typeof value !== "string") {
    return null;
  }
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
};

export const buildMentionUserAvatarLookup = (
  entries: MentionUserAvatarEntry[],
): Map<string, string> => {
  const uniqueAvatarByLabel = new Map<string, string>();
  const duplicateLabels = new Set<string>();
  const seenLabels = new Set<string>();

  for (const entry of entries) {
    const normalizedLabel = normalizeLabel(entry.label);
    if (!normalizedLabel) {
      continue;
    }

    if (seenLabels.has(normalizedLabel)) {
      duplicateLabels.add(normalizedLabel);
      uniqueAvatarByLabel.delete(normalizedLabel);
      continue;
    }

    seenLabels.add(normalizedLabel);
    const normalizedAvatarUrl = normalizeAvatarUrl(entry.avatarUrl);
    if (normalizedAvatarUrl) {
      uniqueAvatarByLabel.set(normalizedLabel, normalizedAvatarUrl);
    }
  }

  for (const duplicateLabel of duplicateLabels) {
    uniqueAvatarByLabel.delete(duplicateLabel);
  }

  return uniqueAvatarByLabel;
};

export const resolveMentionUserAvatar = (
  lookup: MentionUserAvatarLookup | undefined,
  label: string,
) => {
  const normalizedLabel = normalizeLabel(label);
  if (!lookup || !normalizedLabel) {
    return null;
  }
  return lookup.get(normalizedLabel) ?? null;
};
