import React from "react";
import { motion } from "motion/react";
import { cn } from "../../../lib/utils";
import type { MentionEntityType } from "./types";
type MentionDropdownPosition = {
  top?: number;
  bottom?: number;
  left: number;
  width: number;
  placement: "above" | "below";
};
export type MentionDropdownItem = {
  type: MentionEntityType;
  id: string;
  label: string;
  meta?: string;
};
type MentionSection =
  | { kind: "header"; label: string }
  | { kind: "item"; item: MentionDropdownItem; index: number };
type MentionDropdownProps = {
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  dropdownPosition: MentionDropdownPosition | null;
  isVisible: boolean;
  sections: MentionSection[];
  selectedIndex: number;
  onSelect: (item: MentionDropdownItem) => void;
  onSelectIndex: (index: number) => void;
};
export function MentionDropdown({
  dropdownRef,
  dropdownPosition,
  isVisible,
  sections,
  selectedIndex,
  onSelect,
  onSelectIndex,
}: MentionDropdownProps) {
  if (!dropdownPosition) {
    return null;
  }
  const hiddenOffset = dropdownPosition.placement === "below" ? -4 : 4;
  const getOptionId = (item: MentionDropdownItem, index: number) =>
    `mention-option-${item.type}-${item.id}-${index}`;
  const activeOptionId = sections.find(
    (
      section,
    ): section is { kind: "item"; item: MentionDropdownItem; index: number } =>
      section.kind === "item" && section.index === selectedIndex,
  );
  return (
    <motion.div
      ref={dropdownRef as React.RefObject<HTMLDivElement>}
      initial={false}
      animate={
        isVisible
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y: hiddenOffset, scale: 0.97 }
      }
      transition={{ duration: 0.12 }}
      style={{
        position: "fixed",
        left: dropdownPosition.left,
        width: dropdownPosition.width,
        ...(dropdownPosition.top != null ? { top: dropdownPosition.top } : {}),
        ...(dropdownPosition.bottom != null
          ? { bottom: dropdownPosition.bottom }
          : {}),
        zIndex: 99999,
        pointerEvents: isVisible ? "auto" : "none",
      }}
      className="bg-[#1E1F20] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
      role="listbox"
      aria-label="Mentions"
      aria-hidden={!isVisible}
      aria-activedescendant={
        activeOptionId
          ? getOptionId(activeOptionId.item, activeOptionId.index)
          : undefined
      }
    >
      <div className="max-h-[220px] overflow-y-auto py-1">
        {sections.map((section) => {
          if (section.kind === "header") {
            return (
              <div
                key={`header-${section.label}`}
                className="px-3 pt-2 pb-1 txt-role-kbd text-white/25 uppercase tracking-wider select-none"
              >
                {section.label}
              </div>
            );
          }
          const { item, index } = section;
          return (
            <button
              key={`${item.type}-${item.id}`}
              id={getOptionId(item, index)}
              data-index={index}
              role="option"
              aria-selected={index === selectedIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                onSelect(item);
              }}
              onMouseEnter={() => onSelectIndex(index)}
              className={cn(
                "w-full text-left px-3 py-1.5 flex items-center gap-2.5 txt-role-body-md transition-colors cursor-pointer",
                index === selectedIndex
                  ? "bg-white/[0.06] text-white"
                  : "txt-tone-muted hover:bg-white/[0.04]",
              )}
            >
              {item.type === "task" ? (
                <span className="txt-role-body-md leading-none shrink-0">
                  📋
                </span>
              ) : item.type === "file" ? (
                <span className="txt-role-body-md leading-none shrink-0">
                  📂
                </span>
              ) : (
                <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white/[0.1] txt-role-micro text-white/60 shrink-0 font-semibold leading-none">
                  {item.label
                    .trim()
                    .split(/\s+/)
                    .filter(Boolean)
                    .map((word) => word.charAt(0))
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
              <span className="truncate flex-1">{item.label}</span>
              {item.meta && (
                <span className="txt-role-kbd text-white/20 shrink-0">
                  {item.meta}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="border-t border-white/[0.05] px-3 py-1.5 flex items-center gap-3 txt-role-kbd text-white/15 select-none">
        <span>
          <kbd className="px-1 py-0.5 bg-white/[0.04] rounded txt-role-micro">
            ↑↓
          </kbd>
          navigate
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-white/[0.04] rounded txt-role-micro">
            ↵
          </kbd>
          select
        </span>
        <span>
          <kbd className="px-1 py-0.5 bg-white/[0.04] rounded txt-role-micro">
            esc
          </kbd>
          dismiss
        </span>
      </div>
    </motion.div>
  );
}
