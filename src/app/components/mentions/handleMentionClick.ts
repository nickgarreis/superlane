import type React from "react";
import { parseMentionToken } from "./mentionParser";
import type { MentionEntityType } from "./types";
type HandleMentionClickArgs = {
  event: React.MouseEvent<HTMLDivElement>;
  rootElement: HTMLDivElement | null;
  onMentionClick?: (type: MentionEntityType, label: string) => void;
};
export const handleMentionClick = ({
  event,
  rootElement,
  onMentionClick,
}: HandleMentionClickArgs): void => {
  if (!onMentionClick) {
    return;
  }
  let target = event.target as HTMLElement | null;
  while (target && target !== rootElement) {
    if (!target.dataset?.mention) {
      target = target.parentElement;
      continue;
    }
    const token = parseMentionToken(target.dataset.mention);
    if (!token) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    target.classList.remove("mention-badge-pulse");
    void target.offsetWidth;
    target.classList.add("mention-badge-pulse");
    onMentionClick(token.type, token.label);
    return;
  }
};
