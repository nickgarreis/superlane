import React from "react";
import { ArrowRight } from "lucide-react";
import type { QuickAction, SearchResult } from "./types";
import { StatusBadgeIcon } from "../status/StatusBadgeIcon";

const FILE_TYPE_COLORS: Record<string, string> = {
  SVG: "#f472b6",
  PNG: "#60a5fa",
  PDF: "#f87171",
  ZIP: "#a78bfa",
  FIG: "#34d399",
  DOCX: "#38bdf8",
  XLSX: "#4ade80",
  FILE: "#9ca3af",
};

export function SectionLabel({ label, count }: { label: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-4 pt-2 pb-1">
      <span className="text-[10px] font-medium uppercase tracking-wider text-white/20">{label}</span>
      {typeof count === "number" && (
        <span className="text-[9px] text-white/15 tabular-nums">{count}</span>
      )}
    </div>
  );
}

export function SearchPopupResultItem({
  item,
  index,
  activeIndex,
  setActiveIndex,
  handleItemClick,
  hasSearchQuery,
  query,
  itemPerformanceStyle,
}: {
  item: SearchResult;
  index: number;
  activeIndex: number;
  setActiveIndex: (value: number) => void;
  handleItemClick: (item: SearchResult) => void;
  hasSearchQuery: boolean;
  query: string;
  itemPerformanceStyle?: React.CSSProperties;
}) {
  const isActive = activeIndex === index;
  return (
    <div
      key={item.id}
      data-index={index}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-100 group mx-1 ${
        isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
      }`}
      style={itemPerformanceStyle}
      onClick={() => handleItemClick(item)}
      onMouseEnter={() => setActiveIndex(index)}
    >
      <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
        item.type === "project" ? "bg-white/[0.06]" :
        item.type === "task" ? "bg-white/[0.04]" :
        item.type === "file" ? "bg-white/[0.04]" :
        "bg-[#58AFFF]/10"
      }`}>
        {item.type === "action" ? (
          <span className="text-[#58AFFF]">{item.icon}</span>
        ) : item.type === "task" ? (
          <span className={item.taskCompleted ? "text-emerald-400/70" : "text-white/40"}>{item.icon}</span>
        ) : item.type === "file" ? (
          <span className="text-white/40">{item.icon}</span>
        ) : (
          <span className="text-white/60">{item.icon}</span>
        )}
      </div>

      <div className="flex flex-col min-w-0 flex-1">
        <span className={`text-[13px] truncate transition-colors ${
          isActive ? "text-[#E8E8E8]" : "text-[#E8E8E8]/80"
        }`}>
          {hasSearchQuery ? highlightMatch(item.title, query) : item.title}
        </span>
        <span className="text-[11px] text-white/30 truncate flex items-center gap-1.5">
          {item.type === "task" && item.taskCompleted !== undefined && (
            <span className={`inline-block size-1.5 rounded-full shrink-0 ${item.taskCompleted ? "bg-emerald-400" : "bg-white/20"}`} />
          )}
          {item.subtitle}
        </span>
      </div>

      {item.type === "project" && item.status && (
        <div
          className="inline-flex items-center gap-[6px] px-0 py-[4px] rounded-[16777200px] text-[10px] shrink-0"
          style={{ color: "#29FD7D" }}
        >
          <StatusBadgeIcon statusLabel={item.status.label} className="size-3.5 shrink-0" color="#29FD7D" />
          {item.status.label}
        </div>
      )}

      {item.type === "file" && item.fileType && (
        <span
          className="text-[9px] px-1.5 py-0.5 rounded font-medium shrink-0 uppercase tracking-wide"
          style={{
            color: FILE_TYPE_COLORS[item.fileType] || FILE_TYPE_COLORS.FILE,
            backgroundColor: `${FILE_TYPE_COLORS[item.fileType] || FILE_TYPE_COLORS.FILE}15`,
          }}
        >
          {item.fileType}
        </span>
      )}

      <div className={`transition-all duration-100 shrink-0 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}>
        <ArrowRight size={13} className="text-white/30" />
      </div>
    </div>
  );
}

export function SearchPopupQuickActionItem({
  action,
  globalIndex,
  activeIndex,
  setActiveIndex,
  onClick,
  itemPerformanceStyle,
}: {
  action: QuickAction;
  globalIndex: number;
  activeIndex: number;
  setActiveIndex: (value: number) => void;
  onClick: () => void;
  itemPerformanceStyle?: React.CSSProperties;
}) {
  const isActive = activeIndex === globalIndex;
  return (
    <div
      key={action.id}
      data-index={globalIndex}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all duration-100 mx-1 ${
        isActive ? "bg-white/[0.07]" : "hover:bg-white/[0.04]"
      }`}
      style={itemPerformanceStyle}
      onClick={onClick}
      onMouseEnter={() => setActiveIndex(globalIndex)}
    >
      <div className="size-8 rounded-lg flex items-center justify-center shrink-0 bg-[#58AFFF]/10">
        <span className="text-[#58AFFF]">{action.icon}</span>
      </div>
      <span className={`text-[13px] flex-1 transition-colors ${isActive ? "text-[#E8E8E8]" : "text-[#E8E8E8]/70"}`}>
        {action.label}
      </span>
      <div className={`transition-all duration-100 shrink-0 ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}>
        <ArrowRight size={13} className="text-white/30" />
      </div>
    </div>
  );
}

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;
  const q = query.trim().toLowerCase();
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return text;

  return (
    <>
      {text.slice(0, idx)}
      <span className="text-[#58AFFF] bg-[#58AFFF]/10 rounded-sm px-0.5 -mx-0.5">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}
