import React, { useMemo, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DeniedAction } from "../permissions/DeniedAction";
import { getCreateWorkspaceDeniedReason } from "../../lib/permissionRules";
import type { SidebarWorkspaceSectionProps } from "./types";
const DEFAULT_WORKSPACE_BG = "#193cb8";
const toSafeColor = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  if (/^#?[0-9a-f]{3,8}$/i.test(trimmed)) {
    return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
  }
  if (/^(rgb|rgba|hsl|hsla|var\()/.test(trimmed)) {
    return trimmed;
  }
  return null;
};
const getWorkspaceBadgeStyle = (logoColor?: string) => {
  const safeColor = toSafeColor(logoColor);
  return { backgroundColor: safeColor ?? DEFAULT_WORKSPACE_BG } as const;
};
export function SidebarWorkspaceSwitcher({
  activeWorkspace,
  workspaces,
  onSwitchWorkspace,
  onCreateWorkspace,
  canCreateWorkspace,
}: SidebarWorkspaceSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const createWorkspaceDeniedReason = useMemo(
    () =>
      canCreateWorkspace ? null : getCreateWorkspaceDeniedReason(undefined),
    [canCreateWorkspace],
  );
  return (
    <div className="relative z-20 mb-6">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-2 txt-tone-primary hover:bg-[#E8E8E8]/[0.08] px-2 py-1.5 rounded-[999px] transition-colors group text-left cursor-pointer"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="size-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden"
            style={getWorkspaceBadgeStyle(activeWorkspace?.logoColor)}
          >
            <div className="absolute inset-0 shadow-[inset_0px_-5px_6.6px_0px_rgba(0,0,0,0.25)] pointer-events-none rounded-lg" />
            {activeWorkspace?.logo ? (
              <img
                src={activeWorkspace.logo}
                alt={activeWorkspace.name}
                className="size-4 object-contain relative z-10"
              />
            ) : (
              <span className="text-sm font-bold text-white relative z-10">
                {activeWorkspace?.logoText || activeWorkspace?.name?.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="txt-role-body-lg font-medium txt-tone-primary truncate leading-tight">
              {activeWorkspace?.name || "Workspace"}
            </span>
            <span className="txt-role-body-sm text-white/40 truncate leading-tight">
              {activeWorkspace?.plan || "Free Plan"}
            </span>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "w-4 h-4 opacity-40 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#1E1F20] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-50">
            <div className="max-h-[240px] overflow-y-auto py-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace.slug}
                  type="button"
                  onClick={() => {
                    onSwitchWorkspace(workspace.slug);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 hover:bg-white/5 transition-colors group relative cursor-pointer",
                    activeWorkspace?.slug === workspace.slug
                      ? "text-white bg-white/[0.04]"
                      : "txt-tone-muted",
                  )}
                >
                  <div
                    className="size-6 rounded-md flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden"
                    style={getWorkspaceBadgeStyle(workspace.logoColor)}
                  >
                    <div className="absolute inset-0 shadow-[inset_0px_-5px_6.6px_0px_rgba(0,0,0,0.25)] pointer-events-none rounded-md" />
                    {workspace.logo ? (
                      <img
                        src={workspace.logo}
                        alt={workspace.name}
                        className="size-3 object-contain relative z-10"
                      />
                    ) : (
                      <span className="txt-role-kbd font-bold text-white relative z-10">
                        {workspace.logoText || workspace.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span
                      className={cn(
                        "txt-role-body-md truncate",
                        activeWorkspace?.slug !== workspace.slug &&
                          "group-hover:text-white transition-colors",
                      )}
                    >
                      {workspace.name}
                    </span>
                    <span className="txt-role-kbd text-white/35 truncate">
                      {workspace.plan}
                    </span>
                  </div>
                  {activeWorkspace?.slug === workspace.slug && (
                    <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
            <div className="h-px bg-white/5 mx-2" />
            <DeniedAction
              denied={!canCreateWorkspace}
              reason={createWorkspaceDeniedReason}
              tooltipAlign="left"
            >
              <button
                type="button"
                disabled={!canCreateWorkspace}
                onClick={() => {
                  if (!canCreateWorkspace) {
                    return;
                  }
                  onCreateWorkspace();
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 transition-colors group cursor-pointer",
                  canCreateWorkspace
                    ? "txt-tone-muted hover:bg-white/5"
                    : "text-white/25 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "size-6 rounded-md border border-dashed flex items-center justify-center shrink-0",
                    canCreateWorkspace ? "border-white/20" : "border-white/10",
                  )}
                >
                  <Plus size={12} className="text-white/70" />
                </div>
                <span
                  className={cn(
                    "truncate",
                    canCreateWorkspace && "group-hover:text-white transition-colors",
                  )}
                >
                  Create Workspace
                </span>
              </button>
            </DeniedAction>
          </div>
        </>
      )}
    </div>
  );
}
