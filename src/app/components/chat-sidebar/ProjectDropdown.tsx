import React from "react";
import { Check, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "../../../lib/utils";
import type { ProjectData } from "../../types";
import type { AppView } from "../../lib/routing";
import { Z_LAYERS } from "../../lib/zLayers";
import { ProjectLogo } from "../ProjectLogo";
import {
  MENU_CHECK_ICON_CLASS,
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "../ui/menuChrome";
type ProjectDropdownProps = {
  activeProject: ProjectData;
  sortedProjects: ProjectData[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchProject?: (view: AppView) => void;
};
export function ProjectDropdown({
  activeProject,
  sortedProjects,
  isOpen,
  onOpenChange,
  onSwitchProject,
}: ProjectDropdownProps) {
  React.useEffect(() => {
    if (!isOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onOpenChange]);
  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`Open project dropdown. Current project: ${activeProject.name}`}
        className="flex items-center gap-2 txt-tone-primary txt-role-body-lg hover:bg-surface-hover-soft px-2 py-1.5 -ml-2 rounded-lg transition-colors group cursor-pointer"
      >
        <div className={cn("shrink-0", activeProject.archived && "opacity-60")}>
          <ProjectLogo size={18} category={activeProject.category} />
        </div>
        <span className="group-hover:text-white transition-colors truncate max-w-[200px]">
          {activeProject.name}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 opacity-40 transition-transform duration-200",
            isOpen && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: Z_LAYERS.overlay }}
              onClick={() => onOpenChange(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -4, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              className={cn(
                "absolute top-full left-0 mt-1 w-[220px]",
                MENU_SURFACE_CLASS,
              )}
              style={{ zIndex: Z_LAYERS.dropdown }}
            >
              <div className="max-h-[200px] overflow-y-auto py-1">
                {sortedProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => {
                      if (onSwitchProject) {
                        onSwitchProject(`project:${project.id}`);
                      }
                      onOpenChange(false);
                    }}
                    className={cn(
                      MENU_ITEM_CLASS,
                      activeProject.id === project.id
                        ? MENU_ITEM_ACTIVE_CLASS
                        : "txt-tone-muted",
                    )}
                  >
                    <div
                      className={cn(
                        "shrink-0",
                        project.archived && "opacity-60",
                      )}
                    >
                      <ProjectLogo size={14} category={project.category} />
                    </div>
                    <span
                      className={cn(
                        "truncate flex-1",
                        activeProject.id !== project.id &&
                          "group-hover:text-white transition-colors",
                      )}
                    >
                      {project.name}
                    </span>
                    {activeProject.id === project.id && (
                      <Check className={MENU_CHECK_ICON_CLASS} />
                    )}
                    {project.archived && (
                      <span className="txt-role-micro text-text-muted-weak uppercase tracking-wider shrink-0">
                        Archived
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
