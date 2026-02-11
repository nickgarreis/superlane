import React, { useMemo, useState } from "react";
import { ChevronDown, Plus } from "lucide-react";
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
        className="w-full flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group text-left"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3 min-w-0">
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
        <div className="p-1 text-white/40 group-hover:text-white/80 transition-colors">
          <ChevronDown size={16} />
        </div>
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#181818] border border-[#262626] rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 flex flex-col gap-0.5">
            {workspaces.map((workspace) => (
              <div
                key={workspace.slug}
                onClick={() => {
                  onSwitchWorkspace(workspace.slug);
                  setIsOpen(false);
                }}
                className={cn(
                  "px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 transition-all",
                  activeWorkspace?.slug === workspace.slug
                    ? "bg-white/5"
                    : "opacity-60 hover:opacity-100",
                )}
              >
                <div
                  className="size-6 rounded flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden"
                  style={getWorkspaceBadgeStyle(workspace.logoColor)}
                >
                  <div className="absolute inset-0 shadow-[inset_0px_-5px_6.6px_0px_rgba(0,0,0,0.25)] pointer-events-none rounded" />
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
                <div className="flex flex-col min-w-0">
                  <span className="txt-role-body-md font-medium txt-tone-primary truncate">
                    {workspace.name}
                  </span>
                  <span className="txt-role-kbd text-white/40 truncate">
                    {workspace.plan}
                  </span>
                </div>
                {activeWorkspace?.slug === workspace.slug && (
                  <div className="ml-auto text-white">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
            <div className="h-px bg-white/5 my-1 mx-2" />
            <DeniedAction
              denied={!canCreateWorkspace}
              reason={createWorkspaceDeniedReason}
              tooltipAlign="left"
            >
              <div
                onClick={() => {
                  if (!canCreateWorkspace) {
                    return;
                  }
                  onCreateWorkspace();
                  setIsOpen(false);
                }}
                className={cn(
                  "px-2 py-1.5 flex items-center gap-3 rounded-lg mx-1 transition-colors",
                  canCreateWorkspace
                    ? "hover:bg-white/5 cursor-pointer text-white/60 hover:text-white"
                    : "text-white/25 cursor-not-allowed",
                )}
              >
                <div
                  className={cn(
                    "size-6 rounded border border-dashed flex items-center justify-center shrink-0",
                    canCreateWorkspace ? "border-white/20" : "border-white/10",
                  )}
                >
                  <Plus size={12} />
                </div>
                <span className="txt-role-body-sm font-medium">
                  Create Workspace
                </span>
              </div>
            </DeniedAction>
          </div>
        </>
      )}
    </div>
  );
}
