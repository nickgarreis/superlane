import { MessageCircle, PanelLeft } from "lucide-react";
import { cn } from "../../../lib/utils";

type DashboardTopBarProps = {
  onToggleSidebar?: () => void;
  onToggleChat?: () => void;
  className?: string;
};

const TOP_BAR_ICON_BUTTON_CLASS =
  "relative rounded-[12px] shrink-0 size-8 flex items-center justify-center cursor-pointer hover:bg-white/10 transition-colors txt-tone-primary/60 hover:txt-tone-primary";

export function DashboardTopBar({
  onToggleSidebar,
  onToggleChat,
  className,
}: DashboardTopBarProps) {
  return (
    <div
      className={cn(
        "relative flex h-[57px] w-full items-center justify-between px-4 md:px-[22px] py-3",
        className,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 border-b border-[rgba(38,38,38,0.5)]"
      />
      <button
        type="button"
        className={TOP_BAR_ICON_BUTTON_CLASS}
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <PanelLeft size={16} />
      </button>
      {onToggleChat ? (
        <button
          type="button"
          className={TOP_BAR_ICON_BUTTON_CLASS}
          onClick={onToggleChat}
          aria-label="Toggle chat"
        >
          <MessageCircle size={16} />
        </button>
      ) : (
        <div className="size-8 shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}
