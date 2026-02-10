import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
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
import { type MentionEntityType } from "./mentions/types";
import { useDropdownPosition } from "./mentions/useDropdownPosition";
import { MentionDropdown } from "./mentions/MentionDropdown";
import { renderCommentContent } from "./mentions/renderCommentContent";
import { useMentionDropdownState } from "./mentions/useMentionDropdownState";

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

  const { filteredItems, renderSections } = useMentionDropdownState({
    items,
    mentionQuery,
    showDropdown,
  });

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

  const dropdownVisible = showDropdown && filteredItems.length > 0;

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
      {createPortal(
        <MentionDropdown
          dropdownRef={dropdownRef}
          dropdownPosition={dropdownPosition}
          isVisible={dropdownVisible}
          sections={renderSections}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          onSelectIndex={setSelectedIndex}
        />,
        document.body,
      )}
    </div>
  );
});
export { renderCommentContent };
