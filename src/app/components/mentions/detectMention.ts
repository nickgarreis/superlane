export type MentionTrigger = { query: string; start: number };
export const resolveMentionTrigger = (
  text: string,
  cursorPos: number,
): MentionTrigger | null => {
  const textBeforeCursor = text.slice(0, cursorPos);
  const atIndex = textBeforeCursor.lastIndexOf("@");
  if (
    atIndex === -1 ||
    (atIndex > 0 && !/\s/.test(textBeforeCursor[atIndex - 1]))
  ) {
    return null;
  }
  const query = textBeforeCursor.slice(atIndex + 1);
  if (query.includes("\n")) {
    return null;
  }
  return { query, start: atIndex };
};
