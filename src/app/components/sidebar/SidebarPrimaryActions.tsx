import React from "react";
import { Archive, ListChecks, Plus, Search } from "lucide-react";
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
        isActive={currentView === "archive" || currentView?.startsWith("archive-project:")}
      />
      <SidebarItem
        icon={<Plus size={16} />}
        label="Create Project"
        onClick={onOpenCreateProject}
        onIntent={onOpenCreateProjectIntent}
        className="text-[#58AFFF]/80 hover:text-[#58AFFF] hover:bg-[#58AFFF]/10 mt-1"
      />
    </div>
  );
}
