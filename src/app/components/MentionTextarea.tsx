import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { safeScrollIntoView } from "../lib/dom";
import {
  extractValue,
  getCursorOffset,
  insertPlainTextAtSelection,
  setCursorAtOffset,
} from "./mentions/mentionDom";
import {
  parseMentionToken,
  valueToHTML,
} from "./mentions/mentionParser";
import {
  MENTION_TOKEN_SPLIT_REGEX,
  type MentionEntityType,
} from "./mentions/types";
import { useDropdownPosition } from "./mentions/useDropdownPosition";

export interface MentionItem {
  type: MentionEntityType;
  id: string;
  label: string;
  meta?: string;
  completed?: boolean;
  avatar?: string;
}

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  autoFocus?: boolean;
  rows?: number;
  items: MentionItem[];
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onMentionClick?: (type: MentionEntityType, label: string) => void;
}

export const MentionTextarea = forwardRef<
  HTMLDivElement,
  MentionTextareaProps
>(function MentionTextarea(
  {
    value,
    onChange,
    placeholder,
    className,
    style,
    autoFocus,
    items,
    onKeyDown: externalOnKeyDown,
    onFocus,
    onBlur,
    onMentionClick,
  },
  ref,
) {
  const editorRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => editorRef.current!);

  const lastEmittedValue = useRef(value);
  const initialValueRef = useRef(value);
  const initialAutoFocusRef = useRef(autoFocus);
  const isComposing = useRef(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleEditorClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!onMentionClick) {
        return;
      }

      let target = event.target as HTMLElement | null;
      while (target && target !== editorRef.current) {
        if (target.dataset?.mention) {
          const token = parseMentionToken(target.dataset.mention);
          if (token) {
            event.preventDefault();
            event.stopPropagation();
            target.classList.remove("mention-badge-pulse");
            void target.offsetWidth;
            target.classList.add("mention-badge-pulse");
            onMentionClick(token.type, token.label);
          }
          return;
        }

        target = target.parentElement;
      }
    },
    [onMentionClick],
  );

  const syncDOM = useCallback((nextValue: string, cursorPos?: number) => {
    const editorElement = editorRef.current;
    if (!editorElement) {
      return;
    }

    editorElement.innerHTML = valueToHTML(nextValue);
    if (cursorPos != null) {
      setCursorAtOffset(editorElement, cursorPos);
    }
  }, []);

  useEffect(() => {
    syncDOM(initialValueRef.current);
    lastEmittedValue.current = initialValueRef.current;

    if (!initialAutoFocusRef.current) {
      return;
    }

    const editorElement = editorRef.current;
    if (!editorElement) {
      return;
    }

    editorElement.focus();
    setCursorAtOffset(editorElement, initialValueRef.current.length);
  }, [syncDOM]);

  useEffect(() => {
    if (lastEmittedValue.current === value) {
      return;
    }

    lastEmittedValue.current = value;
    syncDOM(value);
  }, [value, syncDOM]);

  const filteredItems = useMemo(() => {
    if (!mentionQuery && !showDropdown) {
      return items;
    }

    const query = mentionQuery.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(query));
  }, [items, mentionQuery, showDropdown]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems.length, mentionQuery]);

  useEffect(() => {
    if (!dropdownRef.current) {
      return;
    }

    const selectedElement = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    safeScrollIntoView(selectedElement, { block: "nearest" });
  }, [selectedIndex]);

  const dropdownPosition = useDropdownPosition(
    editorRef,
    dropdownRef,
    showDropdown && filteredItems.length > 0,
  );

  const detectMention = useCallback((text: string, cursorPos: number) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const atIndex = textBeforeCursor.lastIndexOf("@");

    if (atIndex === -1 || (atIndex > 0 && !/\s/.test(textBeforeCursor[atIndex - 1]))) {
      setShowDropdown(false);
      setMentionStartPos(null);
      return;
    }

    const query = textBeforeCursor.slice(atIndex + 1);
    if (query.includes("\n")) {
      setShowDropdown(false);
      setMentionStartPos(null);
      return;
    }

    setMentionQuery(query);
    setMentionStartPos(atIndex);
    setShowDropdown(true);
  }, []);

  const handleInput = useCallback(() => {
    const editorElement = editorRef.current;
    if (!editorElement || isComposing.current) {
      return;
    }

    const text = extractValue(editorElement);
    lastEmittedValue.current = text;
    onChange(text);

    const cursorOffset = getCursorOffset(editorElement);
    detectMention(text, cursorOffset);
  }, [detectMention, onChange]);

  const handleSelect = useCallback((item: MentionItem) => {
    if (mentionStartPos == null) {
      return;
    }

    const editorElement = editorRef.current;
    if (!editorElement) {
      return;
    }

    const text = extractValue(editorElement);
    const cursorPos = getCursorOffset(editorElement);
    const before = text.slice(0, mentionStartPos);
    const after = text.slice(cursorPos);
    const token = `@[${item.type}:${item.label}]`;
    const newValue = `${before}${token} ${after}`;

    lastEmittedValue.current = newValue;
    onChange(newValue);
    syncDOM(newValue, before.length + token.length + 1);

    setShowDropdown(false);
    setMentionStartPos(null);
    setMentionQuery("");

    requestAnimationFrame(() => editorElement.focus());
  }, [mentionStartPos, onChange, syncDOM]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (showDropdown && filteredItems.length > 0) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
        return;
      }

      if (event.key === "Enter" && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
        return;
      }

      if (event.key === "Escape") {
        event.preventDefault();
        setShowDropdown(false);
        setMentionStartPos(null);
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        handleSelect(filteredItems[selectedIndex]);
        return;
      }
    }

    externalOnKeyDown?.(event);
  }, [externalOnKeyDown, filteredItems, handleSelect, selectedIndex, showDropdown]);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();

    const editorElement = editorRef.current;
    if (!editorElement) {
      return;
    }

    const text = event.clipboardData.getData("text/plain");
    const inserted = insertPlainTextAtSelection(editorElement, text);
    if (!inserted) {
      const cursorPos = getCursorOffset(editorElement);
      const existing = extractValue(editorElement);
      const nextValue = `${existing.slice(0, cursorPos)}${text}${existing.slice(cursorPos)}`;
      lastEmittedValue.current = nextValue;
      onChange(nextValue);
      syncDOM(nextValue, cursorPos + text.length);
      return;
    }

    handleInput();
  }, [handleInput, onChange, syncDOM]);

  useEffect(() => {
    if (!showDropdown) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current
        && !dropdownRef.current.contains(event.target as Node)
        && editorRef.current
        && !editorRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [showDropdown]);

  const taskItems = filteredItems.filter((item) => item.type === "task");
  const fileItems = filteredItems.filter((item) => item.type === "file");
  const userItems = filteredItems.filter((item) => item.type === "user");

  let flatIndex = 0;
  const renderSections: Array<
    | { kind: "header"; label: string }
    | { kind: "item"; item: MentionItem; index: number }
  > = [];

  if (taskItems.length > 0) {
    renderSections.push({ kind: "header", label: "Tasks" });
    taskItems.forEach((item) => {
      renderSections.push({ kind: "item", item, index: flatIndex++ });
    });
  }

  if (fileItems.length > 0) {
    renderSections.push({ kind: "header", label: "Files" });
    fileItems.forEach((item) => {
      renderSections.push({ kind: "item", item, index: flatIndex++ });
    });
  }

  if (userItems.length > 0) {
    renderSections.push({ kind: "header", label: "Users" });
    userItems.forEach((item) => {
      renderSections.push({ kind: "item", item, index: flatIndex++ });
    });
  }

  const dropdownVisible = showDropdown && filteredItems.length > 0;

  const dropdownContent = (
    <AnimatePresence>
      {dropdownVisible && dropdownPosition && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: dropdownPosition.placement === "below" ? -4 : 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: dropdownPosition.placement === "below" ? -4 : 4, scale: 0.97 }}
          transition={{ duration: 0.12 }}
          style={{
            position: "fixed",
            left: dropdownPosition.left,
            width: dropdownPosition.width,
            ...(dropdownPosition.top != null ? { top: dropdownPosition.top } : {}),
            ...(dropdownPosition.bottom != null ? { bottom: dropdownPosition.bottom } : {}),
            zIndex: 99999,
          }}
          className="bg-[#1E1F20] border border-white/10 rounded-xl shadow-2xl shadow-black/50 overflow-hidden"
        >
          <div className="max-h-[220px] overflow-y-auto py-1">
            {renderSections.map((section) => {
              if (section.kind === "header") {
                return (
                  <div
                    key={`header-${section.label}`}
                    className="px-3 pt-2 pb-1 text-[10px] text-white/25 uppercase tracking-wider select-none"
                  >
                    {section.label}
                  </div>
                );
              }

              const { item, index } = section;
              return (
                <button
                  key={`${item.type}-${item.id}`}
                  data-index={index}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-[13px] transition-colors cursor-pointer",
                    index === selectedIndex
                      ? "bg-white/[0.06] text-white"
                      : "text-[#ccc] hover:bg-white/[0.04]",
                  )}
                >
                  {item.type === "task" ? (
                    <span className="text-[13px] leading-[1] shrink-0">📋</span>
                  ) : item.type === "file" ? (
                    <span className="text-[13px] leading-[1] shrink-0">📂</span>
                  ) : (
                    <span
                      className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white/[0.1] text-[9px] text-white/60 shrink-0"
                      style={{ fontWeight: 600, lineHeight: 1 }}
                    >
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
                    <span className="text-[10px] text-white/20 shrink-0">
                      {item.meta}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="border-t border-white/[0.05] px-3 py-1.5 flex items-center gap-3 text-[10px] text-white/15 select-none">
            <span>
              <kbd className="px-1 py-0.5 bg-white/[0.04] rounded text-[9px]">↑↓</kbd>{" "}
              navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white/[0.04] rounded text-[9px]">↵</kbd>{" "}
              select
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white/[0.04] rounded text-[9px]">esc</kbd>{" "}
              dismiss
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onCompositionStart={() => {
          isComposing.current = true;
        }}
        onCompositionEnd={() => {
          isComposing.current = false;
          handleInput();
        }}
        onFocus={onFocus}
        onBlur={onBlur}
        className={cn(className, "outline-none text-[13px]")}
        style={{
          minHeight: "22px",
          overflowWrap: "break-word",
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
          ...style,
        }}
        role="textbox"
        aria-multiline="true"
        aria-placeholder={placeholder}
        onClick={handleEditorClick}
      />
      {!value && (
        <div
          className="absolute inset-0 pointer-events-none select-none text-white/20"
          style={{
            fontSize: "inherit",
            lineHeight: "inherit",
            padding: "inherit",
          }}
          aria-hidden
        >
          {placeholder}
        </div>
      )}
      {createPortal(dropdownContent, document.body)}
    </div>
  );
});

function UserInitials({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <span
      className="inline-flex items-center justify-center w-[14px] h-[14px] rounded-full bg-white/[0.12] text-[8px] text-white/70 shrink-0"
      style={{ fontWeight: 600, letterSpacing: "0.2px", lineHeight: 1 }}
    >
      {initials}
    </span>
  );
}

function MentionBadge({
  type,
  label,
  onClick,
}: {
  type: MentionEntityType;
  label: string;
  onClick?: (type: MentionEntityType, label: string) => void;
}) {
  const isTask = type === "task";
  const isFile = type === "file";
  const clickable = Boolean(onClick);
  const badgeRef = useRef<HTMLSpanElement>(null);

  const handleClick = clickable
    ? (event: React.MouseEvent) => {
      event.stopPropagation();
      const element = badgeRef.current;
      if (element) {
        element.classList.remove("mention-badge-pulse");
        void element.offsetWidth;
        element.classList.add("mention-badge-pulse");
      }
      onClick?.(type, label);
    }
    : undefined;

  return (
    <span
      ref={badgeRef}
      className={cn(
        "inline-flex items-center gap-[4px] mx-[1px] whitespace-nowrap text-[12.5px]",
        "align-baseline relative transition-colors",
        clickable ? "cursor-pointer hover:text-white active:scale-[0.97]" : "cursor-default",
        "text-[#E8E8E8]",
      )}
      onClick={handleClick}
    >
      {isTask ? (
        <span className="text-[12px] leading-[1] shrink-0">📋</span>
      ) : isFile ? (
        <span className="text-[12px] leading-[1] shrink-0">📂</span>
      ) : (
        <UserInitials name={label} />
      )}
      <span style={{ fontWeight: 600 }}>{label}</span>
    </span>
  );
}

export function renderCommentContent(
  content: string,
  onMentionClick?: (type: MentionEntityType, label: string) => void,
): React.ReactNode {
  const segments = content.split(MENTION_TOKEN_SPLIT_REGEX);
  if (segments.length === 1) {
    return content;
  }

  return (
    <>
      {segments.map((segment, index) => {
        const token = parseMentionToken(segment);
        if (!token) {
          return segment || null;
        }

        return (
          <MentionBadge
            key={`mention-${index}`}
            type={token.type}
            label={token.label}
            onClick={onMentionClick}
          />
        );
      })}
    </>
  );
}
