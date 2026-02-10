import React, { Suspense, useState, useRef, useEffect, useCallback, useMemo } from "react";
import { CheckCircle2, Download, Trash2, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/utils";
import { motion } from "motion/react";
import svgPathsStatus from "../../imports/svg-95p4xxlon7";
import HorizontalBorder from "../../imports/HorizontalBorder";
import { ProjectTasks } from "./ProjectTasks";
import { ProjectData, ProjectFileData, ProjectFileTab, ViewerIdentity, WorkspaceMember } from "../types";
import { ProjectLogo } from "./ProjectLogo";
import type {
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
  PendingHighlight,
} from "../dashboard/types";
import { formatFileDisplayDate, formatProjectDeadlineShort } from "../lib/dates";
import { safeScrollIntoView } from "../lib/dom";
import { scheduleIdlePrefetch } from "../lib/prefetch";
import { MenuIcon } from "./main-content/MenuIcon";
import { FileSection } from "./main-content/FileSection";

// File thumbnails
import imgFile1 from "figma:asset/86b9c3843ae4733f84c25f8c5003a47372346c7b.png";
import imgFile2 from "figma:asset/ed2300ecc7d7f37175475469dd895c1a9c7a47a7.png";
import imgFile3 from "figma:asset/a6d8d90aa9a345c6a0a0841855776fa6f038f822.png";
import imgFile4 from "figma:asset/6ec5d42097faff5a5e15a92d842d637a67eb0f04.png";
import imgFile5 from "figma:asset/13b4fb46cd2c4b965c5823ea01fe2f6c7842b7bd.png";

const FILE_THUMBNAIL_BY_TYPE: Record<string, string> = {
  SVG: imgFile1,
  PNG: imgFile2,
  ZIP: imgFile3,
  PDF: imgFile4,
  DOCX: imgFile5,
  FIG: imgFile5,
  XLSX: imgFile4,
  FILE: imgFile4,
};

const PROJECT_FILE_TABS: readonly ProjectFileTab[] = ["Assets", "Contract", "Attachments"];

const isProjectFileTab = (value: string): value is ProjectFileTab =>
  (PROJECT_FILE_TABS as readonly string[]).includes(value);

const loadChatSidebarModule = () => import("./ChatSidebar");
const LazyChatSidebar = React.lazy(async () => {
  const module = await loadChatSidebarModule();
  return { default: module.ChatSidebar };
});

interface MainContentProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  project: ProjectData;
  projectFiles: ProjectFileData[];
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  fileActions: MainContentFileActions;
  projectActions: MainContentProjectActions;
  navigationActions?: MainContentNavigationActions;
  allProjects?: Record<string, ProjectData>;
  pendingHighlight?: PendingHighlight | null;
  onClearPendingHighlight?: () => void;
}

export function MainContent({ 
    onToggleSidebar, 
    isSidebarOpen,
    project, 
    projectFiles,
    workspaceMembers,
    viewerIdentity,
    fileActions,
    projectActions,
    navigationActions,
    allProjects,
    pendingHighlight,
    onClearPendingHighlight
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState<ProjectFileTab>("Assets");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasLoadedChatSidebar, setHasLoadedChatSidebar] = useState(false);

  const handleOpenChat = useCallback(() => {
    setHasLoadedChatSidebar(true);
    void loadChatSidebarModule();
    setIsChatOpen(true);
  }, []);

  useEffect(() => scheduleIdlePrefetch(() => loadChatSidebarModule(), 2500), []);

  const filesByTab = useMemo(() => {
    const grouped: Record<ProjectFileTab, ProjectFileData[]> = {
      Assets: [],
      Contract: [],
      Attachments: [],
    };

    projectFiles.forEach((file) => {
      grouped[file.tab].push(file);
    });

    return grouped;
  }, [projectFiles]);

  // Combine all files for mention dropdown in ChatSidebar
  const allFiles = useMemo(() => {
    const seen = new Set<string>();
    const combined: Array<{ id: string; name: string; type: string }> = [];
    for (const f of projectFiles) {
      if (!seen.has(f.id)) {
        seen.add(f.id);
        combined.push({ id: f.id, name: f.name, type: f.type });
      }
    }
    return combined;
  }, [projectFiles]);

  // ── Mention-click → task / file highlight ──────────────────────
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(null);
  const [highlightedFileId, setHighlightedFileId] = useState<string | null>(null);
  const fileRowRefs = useRef<Record<string, HTMLDivElement | null>>({});

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
        const file = projectFiles.find((entry) => entry.name === label);
        if (file) {
          setActiveTab(file.tab);
          setHighlightedFileId(file.id);
          return;
        }
      }
      // type === "user" → no navigation action, pulse animation on badge is sufficient
    },
    [project.tasks, projectFiles]
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
        safeScrollIntoView(el, { behavior: "smooth", block: "center" });
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
    if (pendingHighlight.projectId && pendingHighlight.projectId !== project.id) return;

    if (pendingHighlight.type === "task" && pendingHighlight.taskId) {
      setHighlightedTaskId(pendingHighlight.taskId);
      onClearPendingHighlight?.();
    } else if (pendingHighlight.type === "file" && pendingHighlight.fileName) {
      // Switch to the correct tab first
      if (pendingHighlight.fileTab && isProjectFileTab(pendingHighlight.fileTab)) {
        setActiveTab(pendingHighlight.fileTab);
      }
      const file = projectFiles.find(
        (entry) =>
          entry.name === pendingHighlight.fileName
          && (!pendingHighlight.fileTab || entry.tab === pendingHighlight.fileTab),
      ) ?? projectFiles.find((entry) => entry.name === pendingHighlight.fileName);

      if (file) {
        setHighlightedFileId(file.id);
        onClearPendingHighlight?.();
      }
    }
  }, [pendingHighlight, project.id, projectFiles, onClearPendingHighlight]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canMutateProjectFiles =
    !project.archived && project.status.label !== "Completed" && !project.completedAt;
  const fileMutationDisabledMessage = "Files can only be modified for active projects";

  const handleUploadClick = useCallback(() => {
    if (!canMutateProjectFiles) {
      return;
    }
    fileInputRef.current?.click();
  }, [canMutateProjectFiles]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (!canMutateProjectFiles) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      fileActions.create(project.id, activeTab, file);

      if (fileInputRef.current) fileInputRef.current.value = "";
  }, [activeTab, canMutateProjectFiles, fileActions, project.id]);
  
  const handleRemoveFile = useCallback((id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!canMutateProjectFiles) {
        return;
      }
      fileActions.remove(id);
  }, [canMutateProjectFiles, fileActions]);

  const currentFiles = filesByTab[activeTab];

  const filteredFiles = useMemo(
    () =>
      currentFiles
        .filter((file) => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
          if (sortBy === "name") return a.name.localeCompare(b.name);
          return 0;
        }),
    [currentFiles, searchQuery, sortBy],
  );
  const shouldOptimizeFileRows = filteredFiles.length > 40;
  const fileRowStyle = useMemo(
    () => (
      shouldOptimizeFileRows
        ? ({ contentVisibility: "auto", containIntrinsicSize: "72px" } as const)
        : undefined
    ),
    [shouldOptimizeFileRows],
  );

  const renderedFileRows = useMemo(
    () =>
      filteredFiles.map((file) => (
        <motion.div
          key={file.id}
          ref={(el: HTMLDivElement | null) => { fileRowRefs.current[file.id] = el; }}
          layout
          exit={{ opacity: 0 }}
          className="project-file-row group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors cursor-pointer border border-transparent hover:border-white/5 relative"
          style={fileRowStyle}
        >
          <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
            <img
              src={file.thumbnailRef || FILE_THUMBNAIL_BY_TYPE[file.type] || imgFile4}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-white group-hover:text-white transition-colors mb-0.5">{file.name}</h3>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="uppercase">{file.type}</span>
              <span>•</span>
              <span>{formatFileDisplayDate(file.displayDateEpochMs)}</span>
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-3">
            {file.downloadable !== false && (
              <button
                title="Download"
                onClick={(event) => {
                  event.stopPropagation();
                  fileActions.download(file.id);
                }}
                className="text-[#58AFFF] hover:text-[#7fc0ff] transition-colors cursor-pointer"
              >
                <Download size={14} />
              </button>
            )}
            <button
              title={canMutateProjectFiles ? "Remove" : fileMutationDisabledMessage}
              onClick={(e) => handleRemoveFile(file.id, e)}
              disabled={!canMutateProjectFiles}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                canMutateProjectFiles
                  ? "hover:bg-red-500/10 hover:text-red-500 text-white/20 cursor-pointer"
                  : "text-white/10 cursor-not-allowed",
              )}
            >
              <Trash2 size={14} />
            </button>
          </div>
        </motion.div>
      )),
    [
      canMutateProjectFiles,
      fileActions,
      fileMutationDisabledMessage,
      fileRowStyle,
      filteredFiles,
      handleRemoveFile,
    ],
  );
  const canCreateProjectTasks =
    !project.archived && project.status.label === "Active" && !project.completedAt;

  return (
    <div className="flex-1 h-full bg-bg-base text-[#E8E8E8] overflow-hidden font-['Roboto',sans-serif] flex flex-col relative">
      <div className="relative bg-bg-surface m-[8px] border border-white/5 rounded-[32px] flex-1 overflow-hidden flex flex-col transition-all duration-500 ease-in-out">
        
        {/* Top Border / Header */}
        <div className="w-full h-[57px] shrink-0">
             <HorizontalBorder onToggleSidebar={onToggleSidebar} onToggleChat={handleOpenChat} />
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-[80px] py-[40px]">
            {/* Back button for archive navigation */}
            {navigationActions?.backTo && navigationActions?.back && (
                <button 
                    onClick={navigationActions.back}
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
                    viewerRole={viewerIdentity.role}
                    onArchive={() => projectActions.archive?.(project.id)} 
                    onUnarchive={() => projectActions.unarchive?.(project.id)}
                    onDelete={() => projectActions.remove?.(project.id)}
                    onComplete={() => projectActions.updateStatus?.(project.id, "Completed")}
                    onUncomplete={() => projectActions.updateStatus?.(project.id, "Active")}
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
                    {project.creator.avatar ? (
                        <img src={project.creator.avatar} alt={project.creator.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-white/10 flex items-center justify-center text-[8px] font-medium text-white/80">
                            {project.creator.name.slice(0, 1).toUpperCase()}
                        </div>
                    )}
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
                <div className="text-[14px] font-medium text-[#E8E8E8]">
                  {formatProjectDeadlineShort(project.deadlineEpochMs) || "Not set"}
                </div>
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
                onUpdateTasks={(newTasks) => projectActions.updateProject?.({ tasks: newTasks })} 
                highlightedTaskId={highlightedTaskId}
                onHighlightDone={handleHighlightDone}
                assignableMembers={workspaceMembers}
                viewerIdentity={viewerIdentity}
                canAddTasks={canCreateProjectTasks}
                addTaskDisabledMessage="Tasks can only be created for active projects"
                canEditTasks={canCreateProjectTasks}
                editTaskDisabledMessage="Tasks can only be edited for active projects"
            />

            <FileSection
              projectId={project.id}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              handleUploadClick={handleUploadClick}
              fileInputRef={fileInputRef}
              handleFileChange={handleFileChange}
              canMutateProjectFiles={canMutateProjectFiles}
              fileMutationDisabledMessage={fileMutationDisabledMessage}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              isSortOpen={isSortOpen}
              setIsSortOpen={setIsSortOpen}
              shouldOptimizeFileRows={shouldOptimizeFileRows}
              renderedFileRows={renderedFileRows}
              filteredFilesLength={filteredFiles.length}
            />
        </div>

        <div className="absolute inset-0 z-50 pointer-events-none rounded-[32px] overflow-hidden">
            {(hasLoadedChatSidebar || isChatOpen) && (
              <Suspense fallback={null}>
                <LazyChatSidebar
                  isOpen={isChatOpen}
                  onClose={() => setIsChatOpen(false)}
                  activeProject={project}
                  allProjects={allProjects || {}}
                  onSwitchProject={navigationActions?.navigate}
                  onMentionClick={handleMentionClick}
                  allFiles={allFiles}
                  workspaceMembers={workspaceMembers}
                  viewerIdentity={viewerIdentity}
                />
              </Suspense>
            )}
        </div>
      </div>
    </div>
  );
}
