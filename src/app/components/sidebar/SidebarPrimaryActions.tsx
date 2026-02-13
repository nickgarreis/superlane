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
        icon={(
          <div className="relative flex size-4 items-center justify-center leading-none">
            <Inbox size={16} />
            {inboxUnreadCount > 0 ? (
              <span
                data-testid="inbox-unread-dot"
                aria-hidden="true"
                className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-sky-500"
              />
            ) : null}
          </div>
        )}
        label="Inbox"
        onClick={onOpenInbox}
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
