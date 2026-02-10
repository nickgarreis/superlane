import type React from "react";
import { Search, X } from "lucide-react";

type SearchPopupInputProps = {
  inputRef: React.RefObject<HTMLInputElement>;
  query: string;
  onQueryChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onClearQuery: () => void;
};

export function SearchPopupInput({
  inputRef,
  query,
  onQueryChange,
  onKeyDown,
  onClearQuery,
}: SearchPopupInputProps) {
  return (
    <div className="flex items-center gap-3 px-4 h-[52px] shrink-0 border-b border-white/[0.06]">
      <Search size={17} className="text-white/30 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={onQueryChange}
        onKeyDown={onKeyDown}
        placeholder="Search projects, tasks, files, or actions..."
        className="flex-1 bg-transparent border-none text-[14px] text-[#E8E8E8] placeholder:text-white/25 focus:outline-none"
      />
      {query && (
        <button
          onClick={onClearQuery}
          className="p-1 hover:bg-white/10 rounded-md transition-colors"
        >
          <X size={14} className="text-white/30" />
        </button>
      )}
      <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-white/25 bg-white/[0.04] rounded border border-white/[0.06] shrink-0 select-none">ESC</kbd>
    </div>
  );
}
