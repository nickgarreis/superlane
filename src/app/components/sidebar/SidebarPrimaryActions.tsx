import React from "react";
import { Archive, Inbox, ListChecks, Plus, Search } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import type { SidebarPrimaryActionsProps } from "./types";
export function SidebarPrimaryActions({
  currentView,
  inboxUnreadCount,
  onSearch,
  onSearchIntent,
  onNavigate,
  onOpenInbox,
  onOpenCreateProject,
  onOpenCreateProjectIntent,
}: SidebarPrimaryActionsProps) {
  const inboxBadge =
    inboxUnreadCount > 0
      ? (inboxUnreadCount > 99 ? "99+" : String(inboxUnreadCount))
      : undefined;

  return (
    <div className="flex flex-col gap-0.5 mb-6">
      <SidebarItem
        icon={<Search size={16} />}
        label="Search"
        onClick={onSearch}
        onIntent={onSearchIntent}
        shortcut="⌘K"
      />
      <SidebarItem
        icon={<ListChecks size={16} />}
        label="Tasks"
        onClick={() => onNavigate("tasks")}
        isActive={currentView === "tasks"}
      />
      <SidebarItem
        icon={<Archive size={16} />}
        label="Archive"
        onClick={() => onNavigate("archive")}
        isActive={
          currentView === "archive" ||
          currentView?.startsWith("archive-project:")
        }
        shortcut="⌘A"
      />
      <SidebarItem
        icon={<Inbox size={16} />}
        label="Inbox"
        onClick={onOpenInbox}
        badge={inboxBadge}
        shortcut="⌘I"
      />
      <SidebarItem
        icon={<Plus size={16} />}
        label="Create Project"
        onClick={onOpenCreateProject}
        onIntent={onOpenCreateProjectIntent}
        className="txt-tone-accent hover:txt-tone-accent mt-1"
        shortcut="⌘P"
      />
    </div>
  );
}
