import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArchiveRestore, Archive, Undo2, Settings, HelpCircle, LogOut, ChevronDown, ChevronRight, Search, Plus, Lightbulb, Bug, ListChecks, Info, Maximize2 } from "lucide-react";
import { useDrag, useDrop } from "react-dnd";
import svgPaths from "../../imports/svg-pclbthwul8";
import { ProjectLogo } from "./ProjectLogo";
import { ProjectData, ViewerIdentity, Workspace } from "../types";
import { cn } from "../../lib/utils";
import { FeedbackPopup } from "./FeedbackPopup";
import { CompletedProjectsPopup } from "./CompletedProjectsPopup";
import type { AppView } from "../lib/routing";
import { partitionSidebarProjects } from "./sidebar/partitionProjects";
import { DeniedAction } from "./permissions/DeniedAction";
import { getCreateWorkspaceDeniedReason } from "../lib/permissionRules";

function CollapsibleContent({ isExpanded, children, className }: { isExpanded: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div 
      className={cn("grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]", isExpanded ? "opacity-100" : "opacity-0", className)}
      style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
    >
      <div className="min-h-0 overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// Context
const SidebarContext = createContext<{
  onNavigate: (view: AppView) => void;
  onSearch: () => void;
  onOpenCreateProject: () => void;
  currentView?: string;
  projects: Record<string, ProjectData>;
  activeWorkspace?: Workspace;
  workspaces: Workspace[];
  onSwitchWorkspace: (id: string) => void;
  onCreateWorkspace: () => void;
  canCreateWorkspace: boolean;
  onOpenSettings: (tab?: "Account" | "Notifications" | "Company" | "Billing") => void;
  onArchiveProject: (id: string) => void;
  onUnarchiveProject: (id: string) => void;
  onUpdateProjectStatus: (id: string, newStatus: string) => void;
  onEditProject: (project: ProjectData) => void;
  onViewReviewProject: (project: ProjectData) => void;
  onLogout: () => void;
}>({ 
  onNavigate: () => {}, 
  onSearch: () => {}, 
  onOpenCreateProject: () => {},
  projects: {},
  workspaces: [],
  onSwitchWorkspace: () => {},
  onCreateWorkspace: () => {},
  canCreateWorkspace: false,
  onOpenSettings: () => {},
  onArchiveProject: () => {},
  onUnarchiveProject: () => {},
  onUpdateProjectStatus: () => {},
  onEditProject: () => {},
  onViewReviewProject: () => {},
  onLogout: () => {}
});

// Components

function WorkspaceSwitcher() {
  const { activeWorkspace, workspaces, onSwitchWorkspace, onCreateWorkspace, canCreateWorkspace } = useContext(SidebarContext);
  const [isOpen, setIsOpen] = useState(false);
  const createWorkspaceDeniedReason = canCreateWorkspace
    ? null
    : getCreateWorkspaceDeniedReason(undefined);

  const bgStyle = activeWorkspace?.logoColor && !activeWorkspace.logoColor.includes('-') 
      ? { backgroundColor: activeWorkspace.logoColor } 
      : undefined;
  const bgClass = activeWorkspace?.logoColor && activeWorkspace.logoColor.includes('-')
      ? `bg-${activeWorkspace.logoColor}`
      : "bg-[#193cb8]";

  return (
    <div className="relative z-20 mb-6">
      <div 
        className="flex items-center justify-between p-2 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3 min-w-0">
            <div 
                className={cn("size-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden", !bgStyle && bgClass)} 
                style={bgStyle}
            >
                <div className="absolute inset-0 shadow-[inset_0px_-5px_6.6px_0px_rgba(0,0,0,0.25)] pointer-events-none rounded-lg" />
                {activeWorkspace?.logo ? (
                    <img src={activeWorkspace.logo} alt={activeWorkspace.name} className="size-4 object-contain relative z-10" />
                ) : (
                    <span className="text-sm font-bold text-white relative z-10">{activeWorkspace?.logoText || activeWorkspace?.name?.charAt(0)}</span>
                )}
            </div>
            <div className="flex flex-col min-w-0">
                <span className="text-[14px] font-medium text-[#E8E8E8] truncate leading-tight">{activeWorkspace?.name || "Workspace"}</span>
                <span className="text-[12px] text-white/40 truncate leading-tight">{activeWorkspace?.plan || "Free Plan"}</span>
            </div>
        </div>
        <div className="p-1 text-white/40 group-hover:text-white/80 transition-colors">
            <ChevronDown size={16} />
        </div>
      </div>

      {isOpen && (
        <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
            <div className="absolute top-full left-0 right-0 mt-1 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 flex flex-col gap-0.5">
            {workspaces.map(ws => {
                const wsBgStyle = ws.logoColor && !ws.logoColor.includes('-') 
                    ? { backgroundColor: ws.logoColor } 
                    : undefined;
                const wsBgClass = ws.logoColor && ws.logoColor.includes('-')
                    ? `bg-${ws.logoColor}`
                    : "bg-[#193cb8]";

                return (
                <div 
                    key={ws.id}
                    onClick={() => {
                        onSwitchWorkspace(ws.id);
                        setIsOpen(false);
                    }}
                    className={cn(
                        "px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 transition-all",
                        activeWorkspace?.id === ws.id ? 'bg-white/5' : 'opacity-60 hover:opacity-100'
                    )}
                >
                    <div className={cn("size-6 rounded flex items-center justify-center shrink-0 shadow-inner relative overflow-hidden", !wsBgStyle && wsBgClass)} style={wsBgStyle}>
                        <div className="absolute inset-0 shadow-[inset_0px_-5px_6.6px_0px_rgba(0,0,0,0.25)] pointer-events-none rounded"></div>
                        {ws.logo ? (
                            <img src={ws.logo} alt={ws.name} className="size-3 object-contain relative z-10" />
                        ) : (
                            <span className="text-[10px] font-bold text-white relative z-10">{ws.logoText || ws.name.charAt(0)}</span>
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className="text-[13px] font-medium text-[#E8E8E8] truncate">{ws.name}</span>
                        <span className="text-[10px] text-white/40 truncate">{ws.plan}</span>
                    </div>
                    {activeWorkspace?.id === ws.id && (
                        <div className="ml-auto text-white">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                    )}
                </div>
            )})}
            
            <div className="h-px bg-white/5 my-1 mx-2"></div>
            
            <DeniedAction denied={!canCreateWorkspace} reason={createWorkspaceDeniedReason} tooltipAlign="left">
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
                            : "text-white/25 cursor-not-allowed"
                    )}
                >
                    <div
                        className={cn(
                            "size-6 rounded border border-dashed flex items-center justify-center shrink-0",
                            canCreateWorkspace ? "border-white/20" : "border-white/10"
                        )}
                    >
                        <Plus size={12} />
                    </div>
                    <span className="text-[12px] font-medium">Create Workspace</span>
                </div>
            </DeniedAction>
            </div>
        </>
      )}
    </div>
  );
}

function DroppableSection({ status, children, onDrop }: { status: string, children: React.ReactNode, onDrop: (id: string, status: string) => void }) {
    const [{ isOver }, drop] = useDrop<{ id: string }, void, { isOver: boolean }>(() => ({
        accept: 'PROJECT',
        drop: (item: { id: string }) => {
            onDrop(item.id, status);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [status, onDrop]);

    return (
        <div ref={(element) => {
          drop(element);
        }} className={cn("rounded-lg transition-colors min-h-[10px]", isOver ? "bg-white/5 ring-1 ring-[#58AFFF]/30" : "")}>
            {children}
        </div>
    );
}

function SidebarItem({ 
    icon, 
    label, 
    onClick, 
    onIntent,
    isActive, 
    onUnarchive,
    onArchive,
    onUncomplete,
    className,
    shortcut,
    badge,
    projectId,
    projectStatus,
    isDraft,
    isReview,
    completionDate
}: { 
    icon: React.ReactNode, 
    label: string, 
    onClick: () => void, 
    onIntent?: () => void,
    isActive?: boolean, 
    onUnarchive?: () => void,
    onArchive?: () => void,
    onUncomplete?: () => void,
    className?: string,
    shortcut?: string,
    badge?: number | string,
    projectId?: string,
    projectStatus?: string,
    isDraft?: boolean,
    isReview?: boolean,
    completionDate?: string
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag<{ id?: string; status?: string }, void, { isDragging: boolean }>(() => ({
      type: 'PROJECT',
      item: { id: projectId, status: projectStatus },
      canDrag: !!projectId,
      collect: (monitor) => ({
          isDragging: monitor.isDragging(),
      }),
  }), [projectId, projectStatus]);

  if (projectId) {
      drag(ref);
  }

  return (
    <div 
      ref={ref}
      style={{ opacity: isDragging ? 0.5 : 1 }}
      className={cn(
        "h-[34px] flex items-center px-3 rounded-lg cursor-pointer transition-all duration-150 group select-none relative shrink-0",
        className,
        isActive 
          ? 'bg-white/[0.08] text-[#E8E8E8] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]' 
          : 'text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/[0.04]'
      )}
      onClick={onClick}
      onMouseEnter={onIntent}
      onFocus={onIntent}
      tabIndex={onIntent ? 0 : undefined}
      title={label}
    >
        {/* Active indicator bar - removed */}
        <div className={cn(
            "shrink-0 mr-2.5 text-current transition-opacity [&_svg]:size-4",
            isActive ? "opacity-100" : "opacity-70 group-hover:opacity-100"
        )}>
            {icon}
        </div>
        <span className="text-[13px] font-medium truncate flex-1 leading-none pt-0.5">{label}</span>

        {shortcut && (
             <span className="hidden group-hover:flex items-center text-[10px] font-medium text-white/30 border border-white/10 px-1.5 py-0.5 rounded ml-2 transition-colors">
                {shortcut}
             </span>
        )}
        
        {badge && (
            <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-[#58AFFF]/10 text-[#58AFFF] text-[11px] font-medium ml-2">
                {badge}
            </span>
        )}

        {isDraft && (
            <span className="flex items-center text-[10px] font-medium text-[#58AFFF] bg-[#58AFFF]/10 px-2 py-0.5 rounded-full ml-2 shrink-0 whitespace-nowrap">
                Continue
            </span>
        )}

        {isReview && (
            <span className="flex items-center text-[10px] font-medium text-[#f97316] bg-[#f97316]/10 px-2 py-0.5 rounded-full ml-2 shrink-0 whitespace-nowrap">
                In Review
            </span>
        )}
        
        {completionDate && (
            <span className="text-[10px] text-white/30 ml-2 shrink-0 whitespace-nowrap">
                {completionDate}
            </span>
        )}
        
        {/* Uncomplete button - revert to Active */}
        {onUncomplete && (
            <div 
                className={cn(
                    "transition-opacity p-1 hover:bg-white/10 rounded ml-1 cursor-pointer",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onUncomplete();
                }}
                title="Revert to Active"
            >
                <Undo2 size={14} className="text-[#E8E8E8]/60" />
            </div>
        )}
        
        {/* Unarchive button for archived projects */}
        {onUnarchive && (
            <div 
                className={cn(
                    "transition-opacity p-1 hover:bg-white/10 rounded ml-2 cursor-pointer",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onUnarchive();
                }}
                title="Unarchive project"
            >
                <ArchiveRestore size={14} className="text-[#E8E8E8]/60" />
            </div>
        )}

        {/* Archive button for active projects */}
        {onArchive && (
            <div 
                className={cn(
                    "transition-opacity p-1 hover:bg-white/10 rounded ml-2 cursor-pointer",
                    isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                onClick={(e) => {
                    e.stopPropagation();
                    onArchive();
                }}
                title="Archive project"
            >
                <Archive size={14} className="text-[#E8E8E8]/60" />
            </div>
        )}
    </div>
  );
}

function SectionHeader({ title, count, action, isCollapsible, isExpanded, onToggle, className, tooltip, onExpandPopup }: { title: string, count?: number, action?: React.ReactNode, isCollapsible?: boolean, isExpanded?: boolean, onToggle?: () => void, className?: string, tooltip?: string, onExpandPopup?: () => void }) {
    const [showTooltip, setShowTooltip] = useState(false);
    const infoRef = useRef<HTMLDivElement>(null);
    const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

    useEffect(() => {
        if (showTooltip && infoRef.current) {
            const rect = infoRef.current.getBoundingClientRect();
            const tooltipWidth = 200;
            let left = rect.left + rect.width / 2 - tooltipWidth / 2;
            if (left < 8) left = 8;
            if (left + tooltipWidth > window.innerWidth - 8) left = window.innerWidth - 8 - tooltipWidth;
            setTooltipPos({
                top: rect.top - 8,
                left,
            });
        }
    }, [showTooltip]);

    return (
        <div 
            className={cn("flex items-center justify-between px-3 py-2 group", isCollapsible && "cursor-pointer", className)}
            onClick={isCollapsible ? onToggle : undefined}
        >
            <div className="flex items-center gap-2">
                {isCollapsible && (
                    <ChevronRight 
                        size={12} 
                        className={cn("text-white/30 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]", isExpanded && "rotate-90")} 
                    />
                )}
                <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 group-hover:text-white/55 transition-colors select-none">
                    {title}
                </span>
                {typeof count === 'number' && (
                    <span className="text-[10px] text-white/20 tabular-nums">
                        {count}
                    </span>
                )}
                {tooltip && (
                    <div 
                        ref={infoRef}
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Info size={12} className="text-white/30 hover:text-white/50 transition-colors cursor-default" />
                    </div>
                )}
            </div>
            <div className="flex items-center gap-1">
                {action}
                {onExpandPopup && (
                    <div
                        className="p-1 hover:bg-white/10 rounded cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpandPopup();
                        }}
                        title="View all"
                    >
                        <Maximize2 size={12} className="text-white/40" />
                    </div>
                )}
            </div>
        </div>
    );
}

function SvgIcon({ path }: { path: string }) {
    return (
        <svg className="size-4" viewBox="0 0 20 20" fill="none">
            <path d={path} fill="currentColor" fillOpacity="0.8" />
        </svg>
    );
}

export function Sidebar({
    onNavigate, 
    onSearch, 
    onSearchIntent,
    onOpenCreateProject,
    onOpenCreateProjectIntent,
    currentView,
    projects,
    viewerIdentity,
    activeWorkspace,
    workspaces,
    onSwitchWorkspace,
    onCreateWorkspace,
    canCreateWorkspace,
    onOpenSettings,
    onOpenSettingsIntent,
    onArchiveProject,
    onUnarchiveProject,
    onUpdateProjectStatus,
    onEditProject,
    onViewReviewProject,
    onLogout
}: {
    onNavigate: (view: AppView) => void;
    onSearch: () => void;
    onSearchIntent?: () => void;
    onOpenCreateProject: () => void;
    onOpenCreateProjectIntent?: () => void;
    currentView?: string;
    projects: Record<string, ProjectData>;
    viewerIdentity: ViewerIdentity;
    activeWorkspace?: Workspace;
    workspaces: Workspace[];
    onSwitchWorkspace: (id: string) => void;
    onCreateWorkspace: () => void;
    canCreateWorkspace: boolean;
    onOpenSettings: (tab?: "Account" | "Notifications" | "Company" | "Billing") => void;
    onOpenSettingsIntent?: () => void;
    onArchiveProject: (id: string) => void;
    onUnarchiveProject: (id: string) => void;
    onUpdateProjectStatus: (id: string, newStatus: string) => void;
    onEditProject: (project: ProjectData) => void;
    onViewReviewProject: (project: ProjectData) => void;
    onLogout: () => void;
}) {
    
    const [isProjectsExpanded, setIsProjectsExpanded] = useState(true);
    const [isCompletedExpanded, setIsCompletedExpanded] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [feedbackType, setFeedbackType] = useState<"feature" | "bug" | null>(null);
    const [isCompletedPopupOpen, setIsCompletedPopupOpen] = useState(false);
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
                .toUpperCase()
            || "U",
        [viewerName],
    );

    const { activeProjects, completedProjects, activeCompletedProject } = useMemo(
        () => partitionSidebarProjects(projects, currentView),
        [projects, currentView],
    );

    // Auto-close logic for the main Projects section if it becomes empty (though rare as it's the main list)
    const prevProjectCount = useRef(activeProjects.length);
    useEffect(() => {
        if (prevProjectCount.current > 0 && activeProjects.length === 0) {
            setIsProjectsExpanded(false);
        } else if (activeProjects.length > 0 && !isProjectsExpanded && prevProjectCount.current === 0) {
            // Auto open if projects are added
             setIsProjectsExpanded(true);
        }
        prevProjectCount.current = activeProjects.length;
    }, [activeProjects.length, isProjectsExpanded]);

    // Auto-expand Completed section when a project is newly completed
    const prevCompletedCount = useRef(completedProjects.length);
    useEffect(() => {
        if (completedProjects.length > prevCompletedCount.current) {
            setIsCompletedExpanded(true);
        }
        prevCompletedCount.current = completedProjects.length;
    }, [completedProjects.length]);

    const handleDrop = useCallback((id: string, section: string) => {
        // If dropped in "Projects" (general list), we essentially just want to ensure it's unarchived.
        // We might not change status if it's already active/review/draft, but if coming from archive, unarchive it.
        if (section === "Projects") {
             onUnarchiveProject(id);
             setIsProjectsExpanded(true);
        }
    }, [onUnarchiveProject]);

    const sidebarContextValue = useMemo(
        () => ({
            onNavigate,
            onSearch,
            onOpenCreateProject,
            currentView,
            projects,
            activeWorkspace,
            workspaces,
            onSwitchWorkspace,
            onCreateWorkspace,
            canCreateWorkspace,
            onOpenSettings,
            onArchiveProject,
            onUnarchiveProject,
            onUpdateProjectStatus,
            onEditProject,
            onViewReviewProject,
            onLogout,
        }),
        [
            activeWorkspace,
            canCreateWorkspace,
            currentView,
            onArchiveProject,
            onCreateWorkspace,
            onEditProject,
            onLogout,
            onNavigate,
            onOpenCreateProject,
            onOpenSettings,
            onSearch,
            onSwitchWorkspace,
            onUnarchiveProject,
            onUpdateProjectStatus,
            onViewReviewProject,
            projects,
            workspaces,
        ],
    );

    return (
        <SidebarContext.Provider value={sidebarContextValue}>
            <div className="flex flex-col h-full w-full bg-transparent px-3 py-4 select-none">
                <WorkspaceSwitcher />
                
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
                        onClick={() => onNavigate('tasks')} 
                        isActive={currentView === 'tasks'} 
                    />
                    <SidebarItem 
                        icon={<Archive size={16} />} 
                        label="Archive" 
                        onClick={() => onNavigate('archive')} 
                        isActive={currentView === 'archive' || currentView?.startsWith('archive-project:')} 
                    />
                    <SidebarItem 
                        icon={<Plus size={16} />} 
                        label="Create Project" 
                        onClick={onOpenCreateProject} 
                        onIntent={onOpenCreateProjectIntent}
                        className="text-[#58AFFF]/80 hover:text-[#58AFFF] hover:bg-[#58AFFF]/10 mt-1"
                    />
                </div>

                <div className="flex-1 min-h-0 -mx-3 px-3 flex flex-col relative">
                    <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide">
                        <SectionHeader 
                            title="Projects" 
                            count={activeProjects.length}
                            isCollapsible
                            isExpanded={isProjectsExpanded}
                            onToggle={() => setIsProjectsExpanded(!isProjectsExpanded)}
                            className="sticky top-0 z-10 bg-bg-base mt-0 border-b border-transparent transition-colors duration-200"
                        />
                        <CollapsibleContent isExpanded={isProjectsExpanded}>
                            <div className="flex flex-col gap-0.5 pb-2">
                                {activeProjects.length > 0 ? (
                                    activeProjects.map(project => {
                                        const projectIsDraft = project.status.label === "Draft";
                                        const projectIsReview = project.status.label === "Review";
                                        return (
                                         <SidebarItem 
                                            key={project.id}
                                            projectId={project.id}
                                            icon={<ProjectLogo size={16} category={project.category} />} 
                                            label={project.name} 
                                            onClick={() => {
                                                if (projectIsDraft) {
                                                    onEditProject(project);
                                                } else if (projectIsReview) {
                                                    onViewReviewProject(project);
                                                } else {
                                                    onNavigate(`project:${project.id}`);
                                                }
                                            }} 
                                            isActive={!projectIsDraft && !projectIsReview && currentView === `project:${project.id}`}
                                            isDraft={projectIsDraft}
                                            isReview={projectIsReview}
                                        />
                                        );
                                    })
                                ) : (
                                    <div className="px-3 py-1.5 text-[12px] text-white/30 italic">No projects</div>
                                )}
                            </div>
                        </CollapsibleContent>
                    </div>

                    {completedProjects.length > 0 && (
                        <div className="shrink-0 pb-2 flex flex-col min-h-0">
                            {/* Section divider */}
                            <div className="mx-3 mb-1 h-px bg-gradient-to-r from-white/[0.06] via-white/[0.04] to-transparent shrink-0" />
                            <div 
                                className="flex items-center justify-between px-3 py-2 cursor-pointer group"
                                onClick={() => setIsCompletedPopupOpen(true)}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-medium uppercase tracking-wider text-white/40 group-hover:text-white/55 transition-colors select-none">
                                        Completed
                                    </span>
                                    <span className="text-[10px] text-white/20 tabular-nums">
                                        {completedProjects.length}
                                    </span>
                                </div>
                                <div
                                    className="p-1 hover:bg-white/10 rounded cursor-pointer transition-all opacity-0 group-hover:opacity-100"
                                    title="View all"
                                >
                                    <Maximize2 size={12} className="text-white/40" />
                                </div>
                            </div>
                            {activeCompletedProject && (
                                <div className="flex flex-col gap-0.5">
                                    <SidebarItem
                                        key={activeCompletedProject.id}
                                        projectId={activeCompletedProject.id}
                                        icon={<ProjectLogo size={16} category={activeCompletedProject.category} />}
                                        label={activeCompletedProject.name}
                                        onClick={() => onNavigate(`project:${activeCompletedProject.id}`)}
                                        isActive={true}
                                        completionDate={activeCompletedProject.completedAt
                                            ? new Date(activeCompletedProject.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                                            : ''}
                                    />
                                </div>
                            )}
                        </div>
                    )}


                </div>

                {/* Footer Section */}
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
                        onClick={() => {}} 
                    />
                    
                    <div className="relative mt-3">
                        <div 
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group"
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
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
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden py-1.5 z-50 flex flex-col gap-0.5">
                                    <div 
                                        className="px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group"
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            setFeedbackType("feature");
                                        }}
                                    >
                                        <Lightbulb size={14} className="text-white/60 group-hover:text-white transition-colors" />
                                        <span className="text-[13px] font-medium">Request a feature</span>
                                    </div>
                                    <div 
                                        className="px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group"
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            setFeedbackType("bug");
                                        }}
                                    >
                                        <Bug size={14} className="text-white/60 group-hover:text-white transition-colors" />
                                        <span className="text-[13px] font-medium">Report a bug</span>
                                    </div>
                                    <div className="h-px bg-white/5 my-0.5 mx-2" />
                                    <div 
                                        className="px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group"
                                        onClick={() => {
                                            setIsProfileOpen(false);
                                            onLogout();
                                        }}
                                    >
                                        <LogOut size={14} className="text-white/60 group-hover:text-white transition-colors" />
                                        <span className="text-[13px] font-medium">Log out</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            <FeedbackPopup
                isOpen={feedbackType !== null}
                type={feedbackType || "feature"}
                onClose={() => setFeedbackType(null)}
            />
            <CompletedProjectsPopup
                isOpen={isCompletedPopupOpen}
                onClose={() => setIsCompletedPopupOpen(false)}
                projects={projects}
                viewerRole={viewerIdentity.role}
                onNavigateToProject={(id) => {
                    onNavigate(`project:${id}`);
                    setIsCompletedPopupOpen(false);
                }}
                onUncompleteProject={(id) => onUpdateProjectStatus(id, "Active")}
            />
        </SidebarContext.Provider>
    );
}
