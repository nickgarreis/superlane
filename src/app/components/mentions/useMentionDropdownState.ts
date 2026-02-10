import { useMemo } from "react";
import type { MentionItem } from "./types";

type MentionSection =
  | { kind: "header"; label: string }
  | { kind: "item"; item: MentionItem; index: number };

type UseMentionDropdownStateArgs = {
  items: MentionItem[];
  mentionQuery: string;
  showDropdown: boolean;
};

type UseMentionDropdownStateResult = {
  filteredItems: MentionItem[];
  renderSections: MentionSection[];
};

export function useMentionDropdownState({
  items,
  mentionQuery,
  showDropdown,
}: UseMentionDropdownStateArgs): UseMentionDropdownStateResult {
  const groupedItems = useMemo(() => {
    const grouped = {
      task: [] as MentionItem[],
      file: [] as MentionItem[],
      user: [] as MentionItem[],
    };

    if (!showDropdown && !mentionQuery) {
      for (const item of items) {
        grouped[item.type].push(item);
      }
      return grouped;
    }

    const normalizedQuery = mentionQuery.trim().toLowerCase();
    for (const item of items) {
      if (!normalizedQuery || item.label.toLowerCase().includes(normalizedQuery)) {
        grouped[item.type].push(item);
      }
    }

    return grouped;
  }, [items, mentionQuery, showDropdown]);

  const filteredItems = useMemo(
    () => [...groupedItems.task, ...groupedItems.file, ...groupedItems.user],
    [groupedItems],
  );

  const renderSections = useMemo(() => {
    let flatIndex = 0;
    const sections: MentionSection[] = [];

    const orderedGroups: Array<{ label: string; items: MentionItem[] }> = [
      { label: "Tasks", items: groupedItems.task },
      { label: "Files", items: groupedItems.file },
      { label: "Users", items: groupedItems.user },
    ];

    for (const group of orderedGroups) {
      if (group.items.length === 0) {
        continue;
      }
      sections.push({ kind: "header", label: group.label });
      for (const item of group.items) {
        sections.push({ kind: "item", item, index: flatIndex++ });
      }
    }

    return sections;
  }, [groupedItems.file, groupedItems.task, groupedItems.user]);

  return { filteredItems, renderSections };
}
