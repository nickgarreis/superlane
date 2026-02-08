import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  forwardRef,
  useImperativeHandle,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";

// ── Types ─────────────────────────────────────────────────────────
export interface MentionItem {
  type: "task" | "file" | "user";
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
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
}

// ── Constants (declared at top-level so Tailwind scanner picks them up) ──
const BADGE_BASE =
  "mention-badge inline-flex items-center gap-[4px] mx-[1px] whitespace-nowrap select-none align-baseline leading-[1.5] text-[12.5px]";
const TASK_BADGE_CLS = `${BADGE_BASE} text-[#E8E8E8]`;
const FILE_BADGE_CLS = `${BADGE_BASE} text-[#E8E8E8]`;
const USER_BADGE_CLS = `${BADGE_BASE} text-[#E8E8E8]`;

const TASK_ICON = `<span style="font-size:12px;line-height:1;flex-shrink:0">📋</span>`;
const FILE_ICON = `<span style="font-size:12px;line-height:1;flex-shrink:0">📂</span>`;

function userInitialsHTML(name: string): string {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return `<span style="display:inline-flex;align-items:center;justify-content:center;width:14px;height:14px;border-radius:50%;background:rgba(255,255,255,0.12);color:rgba(255,255,255,0.7);font-size:8px;font-weight:600;flex-shrink:0;line-height:1;letter-spacing:0.2px">${initials}</span>`;
}

// ── HTML helpers ──────────────────────────────────────────────────
function esc(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function valueToHTML(value: string): string {
  if (!value) return "";
  const segments = value.split(/(@\[(?:task|file|user):[^\]]+\])/);
  return segments
    .map((seg) => {
      const m = seg.match(/^@\[(task|file|user):([^\]]+)\]$/);
      if (m) {
        const isTask = m[1] === "task";
        const isFile = m[1] === "file";
        const isUser = m[1] === "user";
        const cls = isTask ? TASK_BADGE_CLS : isFile ? FILE_BADGE_CLS : USER_BADGE_CLS;
        const icon = isTask ? TASK_ICON : isFile ? FILE_ICON : userInitialsHTML(m[2]);
        return `<span contenteditable="false" data-mention="${esc(seg)}" class="${cls}">${icon}<span style="font-weight:600">${esc(m[2])}</span></span>`;
      }
      return esc(seg).replace(/\n/g, "<br>");
    })
    .join("");
}

// ── DOM → plain value extraction ──────────────────────────────────
function extractValue(el: HTMLElement): string {
  let text = "";
  for (const node of Array.from(el.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || "";
    } else if (node.nodeName === "BR") {
      text += "\n";
    } else if (
      node instanceof HTMLElement &&
      node.dataset.mention
    ) {
      text += node.dataset.mention;
    } else if (node instanceof HTMLElement) {
      // Browser may wrap lines in <div> on Enter
      if (text.length > 0 && !text.endsWith("\n")) text += "\n";
      text += extractValue(node);
    }
  }
  return text;
}

// ── Cursor offset (character count in value-space) ────────────────
function getCursorOffset(root: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);

  let offset = 0;
  let found = false;

  function walk(node: Node) {
    if (found) return;
    if (node === range.startContainer) {
      if (node.nodeType === Node.TEXT_NODE) {
        offset += range.startOffset;
      }
      found = true;
      return;
    }
    if (
      node instanceof HTMLElement &&
      node.dataset.mention
    ) {
      if (node.contains(range.startContainer)) {
        offset += (node.dataset.mention || "").length;
        found = true;
        return;
      }
      offset += (node.dataset.mention || "").length;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      offset += (node.textContent || "").length;
      return;
    }
    if (node.nodeName === "BR") {
      offset += 1;
      return;
    }
    for (const child of Array.from(node.childNodes)) {
      if (found) return;
      walk(child);
    }
  }

  walk(root);
  return offset;
}

function setCursorAtOffset(root: HTMLElement, target: number) {
  let current = 0;
  let result: { node: Node; offset: number } | null = null;

  function walk(node: Node) {
    if (result) return;
    if (
      node instanceof HTMLElement &&
      node.dataset.mention
    ) {
      const len = (node.dataset.mention || "").length;
      if (current + len >= target) {
        // Place cursor right after this badge in the parent
        const parent = node.parentNode!;
        const idx = Array.from(parent.childNodes).indexOf(node as ChildNode);
        result = { node: parent, offset: idx + 1 };
        return;
      }
      current += len;
      return;
    }
    if (node.nodeType === Node.TEXT_NODE) {
      const len = (node.textContent || "").length;
      if (current + len >= target) {
        result = { node, offset: target - current };
        return;
      }
      current += len;
      return;
    }
    if (node.nodeName === "BR") {
      if (current + 1 >= target) {
        const parent = node.parentNode!;
        const idx = Array.from(parent.childNodes).indexOf(node as ChildNode);
        result = { node: parent, offset: idx + 1 };
        return;
      }
      current += 1;
      return;
    }
    for (const child of Array.from(node.childNodes)) {
      if (result) return;
      walk(child);
    }
  }

  walk(root);
  if (result) {
    const sel = window.getSelection();
    const range = document.createRange();
    range.setStart(result.node, result.offset);
    range.collapse(true);
    sel?.removeAllRanges();
    sel?.addRange(range);
  } else {
    // Fallback: place at end
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(root);
    range.collapse(false);
    sel?.removeAllRanges();
    sel?.addRange(range);
  }
}

// ── Dropdown position hook ────────────────────────────────────────
function useDropdownPosition(
  editorRef: React.RefObject<HTMLElement | null>,
  dropdownRef: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean
) {
  const [pos, setPos] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    placement: "above" | "below";
  } | null>(null);

  const measure = useCallback(() => {
    const el = editorRef.current;
    if (!el || !isOpen) {
      setPos(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const dh = dropdownRef.current?.offsetHeight ?? 260;
    const gap = 6;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow >= dh + gap) {
      setPos({ top: rect.bottom + gap, left: rect.left, width: rect.width, placement: "below" });
    } else if (spaceAbove >= dh + gap) {
      setPos({ bottom: window.innerHeight - rect.top + gap, left: rect.left, width: rect.width, placement: "above" });
    } else if (spaceBelow >= spaceAbove) {
      setPos({ top: rect.bottom + gap, left: rect.left, width: rect.width, placement: "below" });
    } else {
      setPos({ bottom: window.innerHeight - rect.top + gap, left: rect.left, width: rect.width, placement: "above" });
    }
  }, [editorRef, dropdownRef, isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) { setPos(null); return; }
    measure();
  }, [isOpen, measure]);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(measure);
    const handler = () => measure();
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [isOpen, measure]);

  return pos;
}

// ── MentionTextarea ───────────────────────────────────────────────
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
  ref
) {
  const editorRef = useRef<HTMLDivElement>(null);
  useImperativeHandle(ref, () => editorRef.current!);

  const lastEmittedValue = useRef(value);
  const isComposing = useRef(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStartPos, setMentionStartPos] = useState<number | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── Click on badges inside editor ──────────────────────────────
  const handleEditorClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onMentionClick) return;
      // Walk up from the click target to find a badge span
      let target = e.target as HTMLElement | null;
      while (target && target !== editorRef.current) {
        if (target.dataset?.mention) {
          const m = target.dataset.mention.match(
            /^@\[(task|file|user):([^\]]+)\]$/
          );
          if (m) {
            e.preventDefault();
            e.stopPropagation();
            // Pulse animation on the badge span
            target.classList.remove("mention-badge-pulse");
            void target.offsetWidth;
            target.classList.add("mention-badge-pulse");
            onMentionClick(m[1] as "task" | "file" | "user", m[2]);
          }
          return;
        }
        target = target.parentElement;
      }
    },
    [onMentionClick]
  );

  // ── Value → DOM sync (only for external changes) ────────────────
  const syncDOM = useCallback(
    (val: string, cursorPos?: number) => {
      const el = editorRef.current;
      if (!el) return;
      const html = valueToHTML(val);
      el.innerHTML = html;
      if (cursorPos != null) {
        setCursorAtOffset(el, cursorPos);
      }
    },
    []
  );

  // Initial mount
  useEffect(() => {
    syncDOM(value);
    if (autoFocus) {
      const el = editorRef.current;
      if (el) {
        el.focus();
        setCursorAtOffset(el, value.length);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync when value changes externally
  useEffect(() => {
    if (lastEmittedValue.current === value) return;
    lastEmittedValue.current = value;
    syncDOM(value);
  }, [value, syncDOM]);

  // ── Mention filtering ──────────────────────────────────────────
  const filteredItems = useMemo(() => {
    if (!mentionQuery && !showDropdown) return items;
    const q = mentionQuery.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, mentionQuery, showDropdown]);

  useEffect(() => { setSelectedIndex(0); }, [filteredItems.length, mentionQuery]);

  useEffect(() => {
    if (!dropdownRef.current) return;
    const el = dropdownRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (el) el.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  const pos = useDropdownPosition(
    editorRef,
    dropdownRef,
    showDropdown && filteredItems.length > 0
  );

  // ── Mention detection ──────────────────────────────────────────
  const detectMention = useCallback((text: string, cursorPos: number) => {
    const before = text.slice(0, cursorPos);
    const atIdx = before.lastIndexOf("@");
    if (atIdx === -1 || (atIdx > 0 && !/\s/.test(before[atIdx - 1]))) {
      setShowDropdown(false);
      setMentionStartPos(null);
      return;
    }
    const query = before.slice(atIdx + 1);
    if (query.includes("\n")) {
      setShowDropdown(false);
      setMentionStartPos(null);
      return;
    }
    setMentionQuery(query);
    setMentionStartPos(atIdx);
    setShowDropdown(true);
  }, []);

  // ── Input handler ──────────────────────────────────────────────
  const handleInput = useCallback(() => {
    const el = editorRef.current;
    if (!el || isComposing.current) return;
    const text = extractValue(el);
    lastEmittedValue.current = text;
    onChange(text);
    const offset = getCursorOffset(el);
    detectMention(text, offset);
  }, [onChange, detectMention]);

  // ── Mention selection ──────────────────────────────────────────
  const handleSelect = useCallback(
    (item: MentionItem) => {
      if (mentionStartPos === null) return;
      const el = editorRef.current;
      if (!el) return;

      const text = extractValue(el);
      const cursorPos = getCursorOffset(el);
      const before = text.slice(0, mentionStartPos);
      const after = text.slice(cursorPos);
      const token =
        item.type === "task"
          ? `@[task:${item.label}]`
          : item.type === "file"
          ? `@[file:${item.label}]`
          : `@[user:${item.label}]`;
      const newValue = before + token + " " + after;

      lastEmittedValue.current = newValue;
      onChange(newValue);
      syncDOM(newValue, before.length + token.length + 1);

      setShowDropdown(false);
      setMentionStartPos(null);
      setMentionQuery("");

      requestAnimationFrame(() => el.focus());
    },
    [mentionStartPos, onChange, syncDOM]
  );

  // ── Keyboard ───────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (showDropdown && filteredItems.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIndex((p) => (p < filteredItems.length - 1 ? p + 1 : 0));
          return;
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIndex((p) => (p > 0 ? p - 1 : filteredItems.length - 1));
          return;
        }
        if (e.key === "Enter" && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          handleSelect(filteredItems[selectedIndex]);
          return;
        }
        if (e.key === "Escape") {
          e.preventDefault();
          setShowDropdown(false);
          setMentionStartPos(null);
          return;
        }
        if (e.key === "Tab") {
          e.preventDefault();
          handleSelect(filteredItems[selectedIndex]);
          return;
        }
      }

      // Normalize Enter → <br> (prevent browser default <div> wrapping)
      if (e.key === "Enter" && !e.metaKey && !e.ctrlKey && !e.shiftKey) {
        // Let external handler decide first (it may submit)
        // Only insert linebreak if external handler doesn't prevent default
      }

      externalOnKeyDown?.(e);
    },
    [showDropdown, filteredItems, selectedIndex, handleSelect, externalOnKeyDown]
  );

  // ── Paste handler (strip HTML) ─────────────────────────────────
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
    },
    []
  );

  // ── Close dropdown on outside click ────────────────────────────
  useEffect(() => {
    if (!showDropdown) return;
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        editorRef.current &&
        !editorRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showDropdown]);

  // ── Build dropdown sections ────────────────────────────────────
  const taskItems = filteredItems.filter((i) => i.type === "task");
  const fileItems = filteredItems.filter((i) => i.type === "file");
  const userItems = filteredItems.filter((i) => i.type === "user");

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
      {dropdownVisible && pos && (
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: pos.placement === "below" ? -4 : 4, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: pos.placement === "below" ? -4 : 4, scale: 0.97 }}
          transition={{ duration: 0.12 }}
          style={{
            position: "fixed",
            left: pos.left,
            width: pos.width,
            ...(pos.top != null ? { top: pos.top } : {}),
            ...(pos.bottom != null ? { bottom: pos.bottom } : {}),
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
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "w-full text-left px-3 py-1.5 flex items-center gap-2.5 text-[13px] transition-colors cursor-pointer",
                    index === selectedIndex
                      ? "bg-white/[0.06] text-white"
                      : "text-[#ccc] hover:bg-white/[0.04]"
                  )}
                >
                  {item.type === "task" ? (
                    <span className="text-[13px] leading-[1] shrink-0">📋</span>
                  ) : item.type === "file" ? (
                    <span className="text-[13px] leading-[1] shrink-0">📂</span>
                  ) : (
                    <span className="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-white/[0.1] text-[9px] text-white/60 shrink-0" style={{ fontWeight: 600, lineHeight: 1 }}>
                      {item.label.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
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
        onCompositionStart={() => { isComposing.current = true; }}
        onCompositionEnd={() => { isComposing.current = false; handleInput(); }}
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
      {/* Placeholder */}
      {!value && (
        <div
          className="absolute inset-0 pointer-events-none select-none text-white/20"
          style={{
            // Inherit the same font/padding from className via matching styles
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

// ── Render comment content with inline mention chips ──────────────
function UserInitials({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
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
  type: "task" | "file" | "user";
  label: string;
  onClick?: (type: "task" | "file" | "user", label: string) => void;
}) {
  const isTask = type === "task";
  const isFile = type === "file";
  const isUser = type === "user";
  const clickable = !!onClick;
  const badgeRef = useRef<HTMLSpanElement>(null);

  const handleClick = clickable
    ? (e: React.MouseEvent) => {
        e.stopPropagation();
        const el = badgeRef.current;
        if (el) {
          el.classList.remove("mention-badge-pulse");
          void el.offsetWidth;
          el.classList.add("mention-badge-pulse");
        }
        onClick(type, label);
      }
    : undefined;

  return (
    <span
      ref={badgeRef}
      className={cn(
        "inline-flex items-center gap-[4px] mx-[1px] whitespace-nowrap text-[12.5px]",
        "align-baseline relative transition-colors",
        clickable ? "cursor-pointer hover:text-white active:scale-[0.97]" : "cursor-default",
        "text-[#E8E8E8]"
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
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void
): React.ReactNode {
  const TOKEN_RE = /(@\[(?:task|file|user):[^\]]+\])/;
  const segments = content.split(TOKEN_RE);
  if (segments.length === 1) return content;

  const PARSE_RE = /^@\[(task|file|user):([^\]]+)\]$/;
  return (
    <>
      {segments.map((seg, i) => {
        const m = seg.match(PARSE_RE);
        if (m) {
          return (
            <MentionBadge
              key={`mention-${i}`}
              type={m[1] as "task" | "file" | "user"}
              label={m[2]}
              onClick={onMentionClick}
            />
          );
        }
        return seg || null;
      })}
    </>
  );
}