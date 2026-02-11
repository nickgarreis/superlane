import type React from "react";
import { Search, X } from "lucide-react";
import { cn } from "../../../lib/utils";
import { GHOST_ICON_BUTTON_CLASS, KBD_PILL_CLASS } from "../ui/controlChrome";
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
    <div className="flex items-center gap-3 px-4 h-[52px] shrink-0 border-b border-border-soft">
      <Search size={17} className="text-text-muted-medium shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={onQueryChange}
        onKeyDown={onKeyDown}
        placeholder="Search projects, tasks, files, or actions..."
        className="flex-1 bg-transparent border-none txt-role-body-lg txt-tone-primary placeholder:text-text-muted-weak focus:outline-none"
      />
      {query && (
        <button
          onClick={onClearQuery}
          className={cn("p-1", GHOST_ICON_BUTTON_CLASS)}
        >
          <X size={14} className="text-text-muted-medium" />
        </button>
      )}
      <kbd
        className={cn(
          "px-1.5 py-0.5 txt-role-kbd font-medium shrink-0 select-none",
          KBD_PILL_CLASS,
        )}
      >
        ESC
      </kbd>
    </div>
  );
}
