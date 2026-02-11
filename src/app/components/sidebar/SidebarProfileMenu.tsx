import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bug,
  ChevronDown,
  HelpCircle,
  Lightbulb,
  LogOut,
  Settings,
} from "lucide-react";
import type { SidebarProfileMenuProps } from "./types";
import { cn } from "../../../lib/utils";
import { SidebarItem } from "./SidebarItem";
import { FeedbackPopup } from "../FeedbackPopup";
export function SidebarProfileMenu({
  viewerIdentity,
  onOpenSettings,
  onOpenSettingsIntent,
  onLogout,
}: SidebarProfileMenuProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feature" | "bug" | null>(
    null,
  );
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
            className="flex items-center gap-2.5 txt-tone-primary hover:bg-[#E8E8E8]/[0.08] px-2 py-1.5 rounded-[999px] transition-colors cursor-pointer group"
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
                <img
                  src={viewerIdentity.avatarUrl}
                  alt={viewerName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10 flex items-center justify-center txt-role-meta font-medium text-white/80">
                  {viewerInitials}
                </div>
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="txt-role-body-md font-medium txt-tone-primary truncate">
                {viewerName}
              </span>
              <span className="txt-role-meta text-white/40 truncate">
                {viewerEmail}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "ml-auto w-4 h-4 opacity-40 transition-transform duration-200",
                isProfileOpen && "rotate-180",
              )}
            />
          </div>
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div
                className="absolute bottom-full left-0 right-0 mb-1 bg-[#1E1F20] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50"
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
                  className="w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 hover:bg-white/5 transition-colors group relative cursor-pointer bg-transparent border-0 txt-tone-muted"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setFeedbackType("feature");
                  }}
                  role="menuitem"
                >
                  <Lightbulb
                    size={14}
                    className="text-white/60 shrink-0"
                  />
                  <span className="group-hover:text-white transition-colors">
                    Request a feature
                  </span>
                </button>
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 hover:bg-white/5 transition-colors group relative cursor-pointer bg-transparent border-0 txt-tone-muted"
                  onClick={() => {
                    setIsProfileOpen(false);
                    setFeedbackType("bug");
                  }}
                  role="menuitem"
                >
                  <Bug
                    size={14}
                    className="text-white/60 shrink-0"
                  />
                  <span className="group-hover:text-white transition-colors">
                    Report a bug
                  </span>
                </button>
                <div className="h-px bg-white/5 mx-2" />
                <button
                  type="button"
                  className="w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 hover:bg-white/5 transition-colors group relative cursor-pointer bg-transparent border-0 txt-tone-muted"
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  role="menuitem"
                >
                  <LogOut
                    size={14}
                    className="text-white/60 shrink-0"
                  />
                  <span className="group-hover:text-white transition-colors">
                    Log out
                  </span>
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
