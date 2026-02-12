import React from "react";
import { Activity, Archive, ListChecks, Plus, Search } from "lucide-react";
import { SidebarItem } from "./SidebarItem";
import type { SidebarPrimaryActionsProps } from "./types";
export function SidebarPrimaryActions({
  currentView,
  onSearch,
  onSearchIntent,
  onNavigate,
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
      />
      <SidebarItem
        icon={<Activity size={16} />}
        label="Activities"
        onClick={() => onNavigate("activities")}
        isActive={currentView === "activities"}
      />
      <SidebarItem
        icon={<Plus size={16} />}
        label="Create Project"
        onClick={onOpenCreateProject}
        onIntent={onOpenCreateProjectIntent}
        className="txt-tone-accent hover:txt-tone-accent mt-1"
      />
    </div>
  );
}
