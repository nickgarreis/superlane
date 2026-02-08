import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Plus, Archive, ArchiveRestore, Trash2, CheckCircle2, Undo2, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import svgPaths from "../../imports/svg-0erue6fqwq";
import svgPathsStatus from "../../imports/svg-95p4xxlon7";
import { imgGroup } from "../../imports/svg-p2kdi";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import imgCalendar from "figma:asset/b24d4dcfb8874cd86a47db18a5e7dfe0a74d9496.png";
import HorizontalBorder from "../../imports/HorizontalBorder";
import { ChatSidebar } from "./ChatSidebar";
import { ProjectTasks } from "./ProjectTasks";
import { ProjectData, Task } from "../types";
import DeleteButton from "../../imports/DeleteButton";
import { ProjectLogo } from "./ProjectLogo";

// File thumbnails
import imgFile1 from "figma:asset/86b9c3843ae4733f84c25f8c5003a47372346c7b.png";
import imgFile2 from "figma:asset/ed2300ecc7d7f37175475469dd895c1a9c7a47a7.png";
import imgFile3 from "figma:asset/a6d8d90aa9a345c6a0a0841855776fa6f038f822.png";
import imgFile4 from "figma:asset/6ec5d42097faff5a5e15a92d842d637a67eb0f04.png";
import imgFile5 from "figma:asset/13b4fb46cd2c4b965c5823ea01fe2f6c7842b7bd.png";

export const ASSET_FILES: any[] = [
  { id: 101, name: "Brand_Logo_Primary.svg", type: "SVG", date: "12 Jan 2026, 09:30", img: imgFile1 },
  { id: 102, name: "Hero_Banner_Desktop.png", type: "PNG", date: "10 Jan 2026, 14:15", img: imgFile2 },
  { id: 103, name: "Product_Mockup_v2.png", type: "PNG", date: "8 Jan 2026, 11:00", img: imgFile3 },
  { id: 104, name: "Icon_Set_Export.zip", type: "ZIP", date: "5 Jan 2026, 16:45", img: imgFile4 },
  { id: 105, name: "UI_Kit_Components.fig", type: "FIG", date: "3 Jan 2026, 10:20", img: imgFile5 },
  { id: 106, name: "Color_Palette_Guide.pdf", type: "PDF", date: "1 Jan 2026, 08:00", img: imgFile1 },
];

export const CONTRACT_FILES: any[] = [
  { id: 201, name: "Master_Service_Agreement.pdf", type: "PDF", date: "15 Jan 2026, 10:00", img: imgFile4 },
  { id: 202, name: "NDA_Signed_2026.pdf", type: "PDF", date: "12 Jan 2026, 14:30", img: imgFile4 },
  { id: 203, name: "Statement_of_Work_v3.docx", type: "DOCX", date: "8 Jan 2026, 09:15", img: imgFile5 },
  { id: 204, name: "Invoice_Jan_2026.pdf", type: "PDF", date: "5 Jan 2026, 11:45", img: imgFile4 },
];

export const ATTACHMENT_FILES: any[] = [
  { id: 301, name: "Meeting_Notes_Kickoff.docx", type: "DOCX", date: "14 Jan 2026, 15:00", img: imgFile5 },
  { id: 302, name: "Wireframes_v1.pdf", type: "PDF", date: "11 Jan 2026, 13:20", img: imgFile2 },
  { id: 303, name: "Competitor_Screenshots.zip", type: "ZIP", date: "9 Jan 2026, 10:45", img: imgFile3 },
  { id: 304, name: "Feedback_Round1.xlsx", type: "XLSX", date: "6 Jan 2026, 16:30", img: imgFile4 },
  { id: 305, name: "Moodboard_References.png", type: "PNG", date: "4 Jan 2026, 12:10", img: imgFile1 },
];

function MenuIcon({ isArchived, isCompleted, onArchive, onUnarchive, onDelete, onComplete, onUncomplete }: { isArchived?: boolean, isCompleted?: boolean, onArchive?: () => void, onUnarchive?: () => void, onDelete?: () => void, onComplete?: () => void, onUncomplete?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      <div 
        className="w-9 h-9 rounded-full bg-[#E8E8E8]/[0.06] flex items-center justify-center border border-transparent backdrop-blur-[6px] shrink-0 cursor-pointer hover:bg-[#E8E8E8]/[0.1] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
               <path d={svgPaths.p1100df00} fill="#E8E8E8" />
          </svg>
      </div>
      
      {isOpen && (
        <>
            <div className="fixed inset-0 z-20" onClick={() => setIsOpen(false)} />
            <div className="absolute left-full top-0 ml-2 w-[180px] bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-2xl overflow-hidden py-1.5 z-30 flex flex-col gap-0.5">
                {/* Complete button - for active (non-completed, non-archived) projects only */}
                {!isCompleted && !isArchived && onComplete && (
                    <div 
                       className="px-2 py-1.5 hover:bg-[#22c55e]/10 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#22c55e] transition-colors group"
                       onClick={() => {
                         onComplete();
                         setIsOpen(false);
                       }}
                    >
                       <CheckCircle2 className="w-4 h-4 text-[#22c55e]/80 group-hover:text-[#22c55e] transition-colors" />
                       <span className="text-[13px] font-medium">Complete</span>
                    </div>
                )}

                {/* Revert to Active - only for completed projects */}
                {!isArchived && isCompleted && onUncomplete && (
                    <div 
                       className="px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group"
                       onClick={() => {
                         onUncomplete();
                         setIsOpen(false);
                       }}
                    >
                       <Undo2 className="w-4 h-4 text-[#E8E8E8]/60 group-hover:text-white transition-colors" />
                       <span className="text-[13px] font-medium">Revert to Active</span>
                    </div>
                )}

                {/* Archive/Unarchive - hide for completed projects */}
                {!isCompleted && (
                <div 
                   className="px-2 py-1.5 hover:bg-white/5 cursor-pointer flex items-center gap-3 rounded-lg mx-1 text-[#E8E8E8] transition-colors group"
                   onClick={() => {
                     if (isArchived) {
                        if (onUnarchive) onUnarchive();
                     } else {
                        if (onArchive) onArchive();
                     }
                     setIsOpen(false);
                   }}
                >
                   {isArchived ? (
                       <ArchiveRestore className="w-4 h-4 text-[#E8E8E8]/60 group-hover:text-white transition-colors" />
                   ) : (
                       <Archive className="w-4 h-4 text-[#E8E8E8]/60 group-hover:text-white transition-colors" />
                   )}
                   <span className="text-[13px] font-medium">{isArchived ? "Unarchive" : "Archive"}</span>
                </div>
                )}
            </div>
        </>
      )}
    </div>
  );
}

export function MainContent({ 
    onToggleSidebar, 
    isSidebarOpen,
    project, 
    onArchiveProject, 
    onUnarchiveProject, 
    onDeleteProject,
    allProjects,
    onNavigate,
    onUpdateStatus,
    onUpdateProject,
    backTo,
    onBack,
    pendingHighlight,
    onClearPendingHighlight
}: { 
    onToggleSidebar: () => void, 
    isSidebarOpen: boolean,
    project: ProjectData, 
    onArchiveProject?: (id: string) => void, 
    onUnarchiveProject?: (id: string) => void, 
    onDeleteProject?: (id: string) => void,
    allProjects?: Record<string, ProjectData>,
    onNavigate?: (view: string) => void,
    onUpdateStatus?: (id: string, status: string) => void,
    onUpdateProject?: (data: Partial<ProjectData>) => void,
    backTo?: string,
    onBack?: () => void,
    pendingHighlight?: { type: "task" | "file"; taskId?: string; fileName?: string; fileTab?: string } | null,
    onClearPendingHighlight?: () => void
}) {
  const [activeTab, setActiveTab] = useState("Assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [assets, setAssets] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Combine all files for mention dropdown in ChatSidebar
  const allFiles = useMemo(() => {
    const seen = new Set<number | string>();
    const combined: Array<{ id: number | string; name: string; type: string }> = [];
    for (const f of [...assets, ...contracts, ...attachments]) {
      if (!seen.has(f.id)) {
        seen.add(f.id);
        combined.push({ id: f.id, name: f.name, type: f.type });
      }
    }
    return combined;
  }, [assets, contracts, attachments]);

  // ── Mention-click → task / file highlight ──────────────────────
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [highlightedFileId, setHighlightedFileId] = useState<number | null>(null);
  const fileRowRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const handleMentionClick = useCallback(
    (type: "task" | "file" | "user", label: string) => {
      if (type === "task") {
        const task = (project.tasks || []).find(
          (t) => t.title === label
        );
        if (task) {
          setHighlightedTaskId(task.id);
        }
      } else if (type === "file") {
        // Search across all three file tabs
        const inAssets = assets.find((f) => f.name === label);
        if (inAssets) { setActiveTab("Assets"); setHighlightedFileId(inAssets.id); return; }
        const inContracts = contracts.find((f) => f.name === label);
        if (inContracts) { setActiveTab("Contract"); setHighlightedFileId(inContracts.id); return; }
        const inAttachments = attachments.find((f) => f.name === label);
        if (inAttachments) { setActiveTab("Attachments"); setHighlightedFileId(inAttachments.id); return; }
      }
      // type === "user" → no navigation action, pulse animation on badge is sufficient
    },
    [project.tasks, assets, contracts, attachments]
  );

  const handleHighlightDone = useCallback(() => {
    setHighlightedTaskId(null);
  }, []);

  // File row flash + scroll-into-view
  useEffect(() => {
    if (highlightedFileId == null) return;
    // Delay to allow tab switch + render to complete before querying refs
    const timeout = setTimeout(() => {
      const el = fileRowRefs.current[highlightedFileId];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.remove("file-row-flash");
        void el.offsetWidth;
        el.classList.add("file-row-flash");
      }
    }, 50);
    const clearTimer = setTimeout(() => {
      setHighlightedFileId(null);
    }, 1650);
    return () => {
      clearTimeout(timeout);
      clearTimeout(clearTimer);
    };
  }, [highlightedFileId]);

  // ── Consume pendingHighlight from search navigation ──────────
  useEffect(() => {
    if (!pendingHighlight) return;
    if (pendingHighlight.type === "task" && pendingHighlight.taskId) {
      setHighlightedTaskId(pendingHighlight.taskId);
    } else if (pendingHighlight.type === "file" && pendingHighlight.fileName) {
      // Switch to the correct tab first
      if (pendingHighlight.fileTab) {
        setActiveTab(pendingHighlight.fileTab);
      }
      // Find the file ID by name across all tabs
      const allCombined = [...ASSET_FILES, ...CONTRACT_FILES, ...ATTACHMENT_FILES, ...(project.attachments || [])];
      const file = allCombined.find(f => f.name === pendingHighlight.fileName);
      if (file) {
        setHighlightedFileId(file.id);
      }
    }
    onClearPendingHighlight?.();
  }, [pendingHighlight]);
  
  // Initialize state when project changes
  useEffect(() => {
    setAssets([...ASSET_FILES]);
    setContracts([...CONTRACT_FILES]);
    setAttachments([...ATTACHMENT_FILES, ...(project.attachments || [])]);
  }, [project.id]); // Re-initialize when project ID changes

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const newFile = {
          id: Date.now(),
          name: file.name,
          type: file.name.split('.').pop()?.toUpperCase() || "FILE",
          date: new Date().toLocaleDateString('de-DE', { day: 'numeric', month: 'short', year: 'numeric' }) + ", " + new Date().toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }),
          img: imgFile4 // Generic icon
      };

      if (activeTab === "Assets") {
          setAssets(prev => [newFile, ...prev]);
      } else if (activeTab === "Contract") {
          setContracts(prev => [newFile, ...prev]);
      } else {
          setAttachments(prev => [newFile, ...prev]);
      }
      
      toast.success(`Successfully uploaded ${file.name}`);
      
      if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  const handleRemoveFile = (id: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (activeTab === "Assets") {
          setAssets(prev => prev.filter(f => f.id !== id));
      } else if (activeTab === "Contract") {
          setContracts(prev => prev.filter(f => f.id !== id));
      } else {
          setAttachments(prev => prev.filter(f => f.id !== id));
      }
      toast.success("File removed");
  };

  const currentFiles = activeTab === "Assets" ? assets : (
    activeTab === "Contract" ? contracts : attachments
  );
  
  const filteredFiles = currentFiles
    .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        return 0;
    });

  return (
    <div className="flex-1 h-full bg-[#141515] text-[#E8E8E8] overflow-hidden font-['Roboto',sans-serif] flex flex-col relative">
      <div className={cn(
        "relative bg-[#191A1A] m-[8px] border border-white/5 rounded-[32px] flex-1 overflow-hidden flex flex-col transition-all duration-500 ease-in-out",
        isSidebarOpen ? "max-w-[1200px]" : "max-w-none"
      )}>
        
        {/* Top Border / Header */}
        <div className="w-full h-[57px] shrink-0">
             <HorizontalBorder onToggleSidebar={onToggleSidebar} onToggleChat={() => setIsChatOpen(true)} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-[80px] py-[40px]">
            {/* Back button for archive navigation */}
            {backTo && onBack && (
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-[13px] text-white/50 hover:text-white/80 transition-colors mb-6 cursor-pointer group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Back to Archive</span>
                </button>
            )}
            {/* Header Section */}
            <div className="flex gap-6 mb-10 items-center">
            <ProjectLogo size={140} category={project.category} />
            
            <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-5 w-full">
                <h1 className="text-[22.7px] font-medium text-[#E8E8E8] leading-[33.6px]">{project.name}</h1>
                <MenuIcon 
                    isArchived={project.archived}
                    isCompleted={project.status.label === "Completed"}
                    onArchive={() => onArchiveProject?.(project.id)} 
                    onUnarchive={() => onUnarchiveProject?.(project.id)}
                    onDelete={() => onDeleteProject?.(project.id)}
                    onComplete={() => onUpdateStatus?.(project.id, "Completed")}
                    onUncomplete={() => onUpdateStatus?.(project.id, "Active")}
                />
                </div>
                <div className="max-w-[672px]">
                    <p className="text-[15.4px] text-[rgba(232,232,232,0.6)] font-normal leading-[24px]">
                    {project.description}
                    </p>
                </div>
            </div>
            </div>

            {/* Meta Grid - Minimalistic */}
            <div className="flex items-center gap-12 pt-[24px] pb-[55px] w-full border-t border-[rgba(232,232,232,0.05)] pr-[0px] pl-[0px]">
            <div className="flex flex-col gap-1.5">
                <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Created by</div>
                <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full overflow-hidden shrink-0">
                    <img src={project.creator.avatar} alt={project.creator.name} className="w-full h-full object-cover" />
                </div>
                <span className="text-[14px] font-medium text-[#E8E8E8]">{project.creator.name}</span>
                </div>
            </div>
            
            <div className="flex flex-col gap-1.5 relative z-20">
                <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Status</div>
                <div
                    className={cn(
                        "flex gap-[6px] items-center relative shrink-0 px-3 py-1 rounded-full self-start select-none",
                        project.archived ? "opacity-80" : ""
                    )}
                    style={{ backgroundColor: project.archived ? "rgba(156, 163, 175, 0.1)" : project.status.bgColor }}
                >
                    <div className="relative shrink-0 size-[16px]">
                      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
                        <g>
                          <path d={svgPathsStatus.p2d5480} fill={project.archived ? "#9CA3AF" : project.status.color} />
                          <path d={svgPathsStatus.pc8d3c00} fill={project.archived ? "#9CA3AF" : project.status.color} />
                        </g>
                      </svg>
                    </div>
                    <span className="text-[13px] leading-[20px] font-medium" style={{ color: project.archived ? "#9CA3AF" : project.status.color }}>
                        {project.archived ? "Archived" : project.status.label}
                    </span>
                </div>
            </div>

            <div className="flex flex-col gap-1.5">
                <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Scope</div>
                <div className="text-[14px] font-medium text-[#E8E8E8]">{project.scope || project.category}</div>
            </div>
            
            <div className="flex flex-col gap-1.5">
                <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Deadline</div>
                <div className="text-[14px] font-medium text-[#E8E8E8]">{project.deadline}</div>
            </div>

            {project.completedAt && (
                <div className="flex flex-col gap-1.5">
                    <div className="text-[12px] font-medium text-white/40 uppercase tracking-wide">Completed on</div>
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
                        <span className="text-[14px] font-medium text-[#22c55e]">
                            {new Date(project.completedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>
                </div>
            )}
            </div>

            <ProjectTasks 
                key={project.id}
                tasks={project.tasks || []} 
                onUpdateTasks={(newTasks) => onUpdateProject?.({ tasks: newTasks })} 
                highlightedTaskId={highlightedTaskId}
                onHighlightDone={handleHighlightDone}
            />

            {/* Tabs & Action */}
            <div className="flex items-center justify-between mb-8 pt-[45px] pr-[0px] pb-[0px] pl-[0px]">
            <div className="flex gap-4">
                <button 
                    onClick={() => setActiveTab("Assets")}
                    className={cn(
                        "px-[17px] py-[7px] text-[14px] font-medium rounded-full transition-all cursor-pointer", 
                        activeTab === "Assets" ? "bg-[rgba(232,232,232,0.05)] text-[#E8E8E8] backdrop-blur-[6px]" : "text-[#E8E8E8]/60 hover:text-[#E8E8E8]"
                    )}
                >
                    Assets
                </button>
                <button 
                    onClick={() => setActiveTab("Contract")}
                    className={cn(
                        "px-[17px] py-[7px] text-[14px] font-medium rounded-full transition-all cursor-pointer", 
                        activeTab === "Contract" ? "bg-[rgba(232,232,232,0.05)] text-[#E8E8E8] backdrop-blur-[6px]" : "text-[#E8E8E8]/60 hover:text-[#E8E8E8]"
                    )}
                >
                    Contract
                </button>
                <button 
                    onClick={() => setActiveTab("Attachments")}
                    className={cn(
                        "px-[17px] py-[7px] text-[14px] font-medium rounded-full transition-all cursor-pointer", 
                        activeTab === "Attachments" ? "bg-[rgba(232,232,232,0.05)] text-[#E8E8E8] backdrop-blur-[6px]" : "text-[#E8E8E8]/60 hover:text-[#E8E8E8]"
                    )}
                >
                    Attachments
                </button>
            </div>
            
            <button 
                onClick={handleUploadClick}
                className="flex items-center gap-1 pl-[9px] pr-[13px] py-[7.75px] bg-[#E8E8E8] rounded-full hover:bg-white transition-colors cursor-pointer"
            >
                <div className="w-4 h-4 shrink-0">
                    <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                        <path d={svgPaths.p34261000} fill="black" fillOpacity="0.667" />
                    </svg>
                </div>
                <span className="text-[13px] font-medium text-[#141415] leading-[19.5px]">
                    Add {activeTab === "Assets" ? "asset" : (activeTab === "Contract" ? "contract" : "attachment")}
                </span>
            </button>
            <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
            />
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
                            placeholder="Search content" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none text-[13.9px] text-[#E8E8E8] placeholder:text-[rgba(232,232,232,0.4)] focus:outline-none"
                        />
                    </div>
                </div>
                
                <div className="relative">
                    <button 
                        onClick={() => setIsSortOpen(!isSortOpen)}
                        className="flex items-center gap-2 text-[14px] font-medium text-[rgba(232,232,232,0.6)] hover:text-[#E8E8E8] transition-colors cursor-pointer"
                    >
                        {sortBy === "relevance" ? "Relevance" : "Name (A-Z)"}
                        <div className="w-4 h-4 shrink-0">
                            <svg className="w-full h-full" viewBox="0 0 16 16" fill="none">
                                <path d={svgPaths.p7659d00} fill="#E8E8E8" fillOpacity="0.8" />
                            </svg>
                        </div>
                    </button>
                    
                    {isSortOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsSortOpen(false)} />
                            <div className="absolute right-0 top-full mt-2 w-40 bg-[#1A1A1C] border border-[#262626] rounded-xl shadow-xl overflow-hidden py-1 z-20">
                                <button
                                    onClick={() => {
                                        setSortBy("relevance");
                                        setIsSortOpen(false);
                                    }}
                                    className={cn(
                                        "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors",
                                        sortBy === "relevance" ? "text-white font-medium" : "text-white/60"
                                    )}
                                >
                                    Relevance
                                </button>
                                <button
                                    onClick={() => {
                                        setSortBy("name");
                                        setIsSortOpen(false);
                                    }}
                                    className={cn(
                                        "w-full px-4 py-2 text-left text-[13px] hover:bg-white/5 transition-colors",
                                        sortBy === "name" ? "text-white font-medium" : "text-white/60"
                                    )}
                                >
                                    Name (A-Z)
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* File List */}
            <div className="flex flex-col gap-2">
                <AnimatePresence initial={false} key={project.id + '-' + activeTab}>
                {filteredFiles.map((file) => (
                    <motion.div
                        key={file.id}
                        ref={(el: HTMLDivElement | null) => { fileRowRefs.current[file.id] = el; }}
                        layout
                        exit={{ opacity: 0 }}
                        className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 relative"
                    >
                        <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
                            <img src={file.img} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors mb-0.5">{file.name}</h3>
                            <div className="flex items-center gap-2 text-xs text-white/40">
                                <span className="uppercase">{file.type}</span>
                                <span>•</span>
                                <span>{file.date}</span>
                            </div>
                        </div>

                        {/* Remove Button */}
                        <div 
                            className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 w-[88px] h-[34px]"
                            onClick={(e) => handleRemoveFile(file.id, e)}
                        >
                            <DeleteButton />
                        </div>
                    </motion.div>
                ))}
                </AnimatePresence>
                {filteredFiles.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-white/40">
                        <p className="text-sm">
                          {searchQuery
                            ? `No files found matching "${searchQuery}"`
                            : `No ${activeTab === "Assets" ? "assets" : activeTab === "Contract" ? "contracts" : "attachments"} yet`}
                        </p>
                    </div>
                )}
            </div>
        </div>

        <div className="absolute inset-0 z-50 pointer-events-none rounded-[32px] overflow-hidden">
            <ChatSidebar 
                isOpen={isChatOpen} 
                onClose={() => setIsChatOpen(false)} 
                activeProject={project}
                allProjects={allProjects || {}}
                onSwitchProject={onNavigate}
                onMentionClick={handleMentionClick}
                allFiles={allFiles}
            />
        </div>
      </div>
    </div>
  );
}