import React, { useEffect, useMemo, useRef, useState } from "react";
import { Bug, ChevronDown, HelpCircle, Lightbulb, LogOut, Settings } from "lucide-react";
import type { SidebarProfileMenuProps } from "./types";
import { SidebarItem } from "./SidebarItem";
import { FeedbackPopup } from "../FeedbackPopup";

export function SidebarProfileMenu({
  viewerIdentity,
  onOpenSettings,
  onOpenSettingsIntent,
  onLogout,
}: SidebarProfileMenuProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feature" | "bug" | null>(null);
  const profileTriggerRef = useRef<HTMLDivElement>(null);
  const firstMenuItemRef = useRef<HTMLButtonElement>(null);
  const hasOpenedProfileMenuRef = useRef(false);

  const viewerName = viewerIdentity.name || "Unknown user";
  const viewerEmail = viewerIdentity.email || "No email";
  const viewerInitials = useMemo(
    () =>
      viewerName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0] ?? "")
        .join("")
        .slice(0, 2)
        .toUpperCase() || "U",
    [viewerName],
  );

  const openHelpAndSupport = () => {
    window.open("https://help.example.com", "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    if (isProfileOpen) {
      hasOpenedProfileMenuRef.current = true;
      const timeoutId = window.setTimeout(() => {
        firstMenuItemRef.current?.focus();
      }, 0);
      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    if (hasOpenedProfileMenuRef.current) {
      profileTriggerRef.current?.focus();
    }
  }, [isProfileOpen]);

  return (
    <>
      <div className="mt-auto pt-4 flex flex-col gap-1 border-t border-white/5">
        <SidebarItem
          icon={<Settings size={16} />}
          label="Settings"
          onClick={() => onOpenSettings()}
          onIntent={onOpenSettingsIntent}
        />
        <SidebarItem
          icon={<HelpCircle size={16} />}
          label="Help & Support"
          onClick={openHelpAndSupport}
        />

        <div className="relative mt-3">
          <div
            ref={profileTriggerRef}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
            onClick={() => setIsProfileOpen((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setIsProfileOpen((prev) => !prev);
              }
            }}
            role="button"
            tabIndex={0}
            aria-haspopup="menu"
            aria-expanded={isProfileOpen}
            aria-label={`Profile menu for ${viewerName}`}
          >
            <div className="size-8 rounded-full overflow-hidden shrink-0 border border-white/10">
              {viewerIdentity.avatarUrl ? (
                <img src={viewerIdentity.avatarUrl} alt={viewerName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center text-[11px] font-medium text-white/80">
                  {viewerInitials}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[13px] font-medium text-[#E8E8E8] truncate">{viewerName}</span>
              <span className="text-[11px] text-white/40 truncate">{viewerEmail}</span>
            </div>
            <div className="ml-auto p-1 text-white/40 group-hover:text-white/80 transition-colors">
              <ChevronDown size={16} />
            </div>
          </div>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
              <div
                className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 flex flex-col gap-0.5"
                role="menu"
                aria-label={`Profile actions for ${viewerName}`}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    setIsProfileOpen(false);
                  }
                }}
              >
                <button
                  ref={firstMenuItemRef}
                  type="button"
                  className="w-full px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group text-left bg-transparent border-0"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setFeedbackType("feature");
                  }}
                  role="menuitem"
                >
                  <Lightbulb size={14} className="text-white/60 group-hover:text-white transition-colors" />
                  <span className="text-[13px] font-medium">Request a feature</span>
                </button>
                <button
                  type="button"
                  className="w-full px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group text-left bg-transparent border-0"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setFeedbackType("bug");
                  }}
                  role="menuitem"
                >
                  <Bug size={14} className="text-white/60 group-hover:text-white transition-colors" />
                  <span className="text-[13px] font-medium">Report a bug</span>
                </button>
                <div className="h-px bg-white/5 my-0.5 mx-2" />
                <button
                  type="button"
                  className="w-full px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group text-left bg-transparent border-0"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  role="menuitem"
                >
                  <LogOut size={14} className="text-white/60 group-hover:text-white transition-colors" />
                  <span className="text-[13px] font-medium">Log out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <FeedbackPopup
        isOpen={feedbackType !== null}
        type={feedbackType || "feature"}
        onClose={() => setFeedbackType(null)}
      />
    </>
  );
}
