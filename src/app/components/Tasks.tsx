import React, { useState } from "react";
import { cn } from "../../lib/utils";
import svgPaths from "../../imports/svg-0erue6fqwq";
import HorizontalBorder from "../../imports/HorizontalBorder";
import { ProjectTasks } from "./ProjectTasks";
import { Task, ProjectData } from "../types";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import { Filter, Plus, ArrowUpDown } from "lucide-react";
import { ProjectLogo } from "./ProjectLogo";

export function Tasks({ 
    onToggleSidebar, 
    isSidebarOpen,
    projects,
    onUpdateProject 
}: { 
    onToggleSidebar: () => void, 
    isSidebarOpen: boolean,
    projects: Record<string, ProjectData>,
    onUpdateProject: (id: string, data: Partial<ProjectData>) => void
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"dueDate" | "name" | "status">("dueDate");
  const [isSortOpen, setIsSortOpen] = useState(false);
  
  const [filterProject, setFilterProject] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isAdding, setIsAdding] = useState(false);
  
  // Derived state from projects prop
  const allTasks = Object.values(projects).flatMap(p => 
      (p.tasks || []).map(t => ({ ...t, projectId: p.id }))
  );

  const filteredTasks = allTasks
    .filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        // If filters are active, match against selected IDs.
        // If NO filters are active, only show tasks from UNARCHIVED projects.
        const matchesProject = filterProject.length > 0 
            ? filterProject.includes(task.projectId)
            : !projects[task.projectId]?.archived;

        return matchesSearch && matchesProject;
    })
    .sort((a, b) => {
        if (sortBy === "name") return a.title.localeCompare(b.title);
        if (sortBy === "status") return Number(a.completed) - Number(b.completed);
        // Simple date sort (just string comparison for now as dates are formatted strings)
        return 0;
    });

  const handleUpdateTasks = (newTasks: any[]) => {
      // Group current tasks by project for easier updating
      const updatesByProject: Record<string, Task[]> = {};
      Object.values(projects).forEach(p => {
          updatesByProject[p.id] = [...(p.tasks || [])];
      });

      // 1. Identify Deleted Tasks
      // If a task ID was in filteredTasks but is NOT in newTasks, it was deleted.
      const previousIdsInView = new Set(filteredTasks.map(t => t.id));
      const newIdsInView = new Set(newTasks.map(t => t.id));
      
      const deletedIds = [...previousIdsInView].filter(id => !newIdsInView.has(id));
      
      deletedIds.forEach(id => {
          const task = allTasks.find(t => t.id === id);
          if (task) {
              const pId = task.projectId;
              if (updatesByProject[pId]) {
                  updatesByProject[pId] = updatesByProject[pId].filter(t => t.id !== id);
              }
          }
      });

      // 2. Identify New and Updated Tasks
      newTasks.forEach(t => {
          if (!t.projectId) {
              // New Task
              // Assign to first selected filter project or first available project
              const targetPId = filterProject.length > 0 ? filterProject[0] : Object.keys(projects)[0];
              if (targetPId && updatesByProject[targetPId]) {
                  // Strip projectId if it accidentally got there, though for new tasks it shouldn't be there
                  const { projectId, ...cleanTask } = t;
                  updatesByProject[targetPId].push(cleanTask);
              }
          } else {
              // Existing Task - Update it in its project
              const pId = t.projectId;
              if (updatesByProject[pId]) {
                  updatesByProject[pId] = updatesByProject[pId].map(existing => 
                      existing.id === t.id ? { ...t, projectId: undefined } : existing
                  );
              }
          }
      });

      // 3. Apply updates
      Object.entries(updatesByProject).forEach(([pId, updatedList]) => {
          // Simple equality check to avoid infinite loops or unnecessary updates
          // This is a shallow check, ideally we'd do deep check but this is okay for now
          // as long as onUpdateProject doesn't cause a re-render if value is same (it might).
          // Better to just fire it.
          
          // Clean up the tasks to ensure no projectId field remains
          const cleanList = updatedList.map(({ projectId, ...rest }: any) => rest);
          onUpdateProject(pId, { tasks: cleanList });
      });
  };

  return (
    <div className="flex-1 h-full bg-[#141515] text-[#E8E8E8] overflow-hidden font-['Roboto',sans-serif] flex flex-col relative">
      <div className={cn(
        "relative bg-[#191A1A] m-[8px] border border-white/5 rounded-[32px] flex-1 overflow-hidden flex flex-col transition-all duration-500 ease-in-out",
        isSidebarOpen ? "max-w-[1200px]" : "max-w-none"
      )}>
        
        {/* Top Border / Header */}
        <div className="w-full h-[57px] shrink-0">
             <HorizontalBorder onToggleSidebar={onToggleSidebar} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-[80px] py-[40px]">
            {/* Header Section */}
            <div className="flex gap-6 mb-10 items-center">
                <div className="flex-1">
                    <h1 className="text-[20px] font-medium text-[#E8E8E8] tracking-tight">Tasks</h1>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 z-10 relative">
                <div className="relative w-[384px] h-[36px]">
                    <div className="absolute inset-0 rounded-[18px] border border-[rgba(232,232,232,0.15)] pointer-events-none" />
                    <div className="flex items-center h-full px-3">
                        <div className="w-4 h-4 shrink-0 mr-2 opacity-40">
                            <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                                <path d={svgPaths.p3f80a980} fill="#E8E8E8" />
                            </svg>
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search tasks" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none text-[13.9px] text-[#E8E8E8] placeholder:text-[rgba(232,232,232,0.4)] focus:outline-none"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="text-[12px] font-medium text-[#58AFFF] hover:text-[#58AFFF]/80 transition-colors flex items-center gap-1 cursor-pointer mr-2"
                    >
                        <Plus size={14} /> Add Task
                    </button>

                    {/* Filter Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
                                filterProject.length > 0
                                    ? "bg-[#58AFFF]/20 text-[#58AFFF]" 
                                    : isFilterOpen 
                                        ? "bg-white/10 text-[#E8E8E8]" 
                                        : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/5"
                            )}
                            title="Filter by project"
                        >
                             <Filter size={16} strokeWidth={2} />
                        </button>
                        
                        {isFilterOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-60 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden p-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                                        Filter by Project
                                    </div>
                                    {Object.values(projects).filter(p => !p.archived).map(project => {
                                        const isSelected = filterProject.includes(project.id);
                                        return (
                                            <button
                                                key={project.id}
                                                onClick={() => {
                                                    setFilterProject(prev => 
                                                        prev.includes(project.id) 
                                                            ? prev.filter(id => id !== project.id) 
                                                            : [...prev, project.id]
                                                    );
                                                }}
                                                className="w-full px-2 py-1.5 rounded-lg text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3 group"
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 flex items-center justify-center transition-opacity",
                                                    isSelected ? "opacity-100" : "opacity-0"
                                                )}>
                                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                        <path d="M9 1L3.5 6.5L1 4" stroke="#E8E8E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                                <ProjectLogo size={16} category={project.category} />
                                                <span className={cn(
                                                    "truncate transition-colors",
                                                    isSelected ? "text-white" : "text-[#E8E8E8]/60 group-hover:text-[#E8E8E8]"
                                                )}>{project.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="w-px h-4 bg-white/10" />

                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className={cn(
                                "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200 cursor-pointer",
                                isSortOpen 
                                    ? "bg-white/10 text-[#E8E8E8]" 
                                    : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/5"
                            )}
                            title="Sort tasks"
                        >
                            <ArrowUpDown size={16} strokeWidth={2} />
                        </button>
                        
                        {isSortOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                                <div className="absolute right-0 top-full mt-2 w-48 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden p-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-white/30 tracking-wider">
                                        Sort by
                                    </div>
                                    {[
                                        { id: "dueDate", label: "Due Date" },
                                        { id: "name", label: "Name" },
                                        { id: "status", label: "Status" }
                                    ].map((option) => (
                                        <button
                                            key={option.id}
                                            onClick={() => {
                                                setSortBy(option.id as any);
                                                setIsSortOpen(false);
                                            }}
                                            className="w-full px-2 py-1.5 rounded-lg text-left text-[13px] hover:bg-white/5 transition-colors cursor-pointer flex items-center gap-3 group"
                                        >
                                            <div className={cn(
                                                "w-4 h-4 flex items-center justify-center transition-opacity",
                                                sortBy === option.id ? "opacity-100" : "opacity-0"
                                            )}>
                                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                                    <path d="M9 1L3.5 6.5L1 4" stroke="#E8E8E8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </div>
                                            <span className={cn(
                                                "transition-colors",
                                                sortBy === option.id ? "text-white" : "text-[#E8E8E8]/60 group-hover:text-[#E8E8E8]"
                                            )}>
                                                {option.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            <div className="">
                <ProjectTasks 
                    tasks={filteredTasks} 
                    onUpdateTasks={handleUpdateTasks}
                    hideHeader={true}
                    isAddingMode={isAdding}
                    onAddingModeChange={setIsAdding}
                />
            </div>
        </div>
      </div>
    </div>
  );
}