import React, {
  Suspense,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  useDeferredValue,
} from "react";
import HorizontalBorder from "../../imports/HorizontalBorder";
import { ProjectTasks } from "./ProjectTasks";
import {
  ProjectData,
  ProjectFileData,
  ProjectFileTab,
  Task,
  ViewerIdentity,
  WorkspaceMember,
} from "../types";
import type {
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
  PendingHighlight,
} from "../dashboard/types";
import { scheduleIdlePrefetch } from "../lib/prefetch";
import { FileSection } from "./main-content/FileSection";
import { ProjectOverview } from "./main-content/ProjectOverview";
import { MainContentFileRows } from "./main-content/MainContentFileRows";
import { useMainContentHighlighting } from "./main-content/useMainContentHighlighting";
const loadChatSidebarModule = () => import("./ChatSidebar");
const LazyChatSidebar = React.lazy(async () => {
  const module = await loadChatSidebarModule();
  return { default: module.ChatSidebar };
});
interface MainContentProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  layoutMode?: "page" | "popup";
  project: ProjectData;
  projectTasks: Task[];
  projectFiles: ProjectFileData[];
  projectFilesPaginationStatus:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreProjectFiles: (numItems: number) => void;
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
  layoutMode = "page",
  project,
  projectTasks,
  projectFiles,
  projectFilesPaginationStatus,
  loadMoreProjectFiles,
  workspaceMembers,
  viewerIdentity,
  fileActions,
  projectActions,
  navigationActions,
  allProjects,
  pendingHighlight,
  onClearPendingHighlight,
}: MainContentProps) {
  const [activeTab, setActiveTab] = useState<ProjectFileTab>("Assets");
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [sortBy, setSortBy] = useState<"relevance" | "name">("relevance");
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [hasLoadedChatSidebar, setHasLoadedChatSidebar] = useState(false);
  const handleOpenChat = useCallback(() => {
    setHasLoadedChatSidebar(true);
    void loadChatSidebarModule();
    setIsChatOpen(true);
  }, []);
  useEffect(
    () => scheduleIdlePrefetch(() => loadChatSidebarModule(), 2500),
    [],
  );
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
  const allFiles = useMemo(() => {
    const seen = new Set<string>();
    const combined: Array<{ id: string; name: string; type: string }> = [];
    for (const file of projectFiles) {
      if (!seen.has(file.id)) {
        seen.add(file.id);
        combined.push({ id: file.id, name: file.name, type: file.type });
      }
    }
    return combined;
  }, [projectFiles]);
  const {
    highlightedTaskId,
    handleTaskHighlightDone,
    fileRowRefs,
    handleMentionClick,
  } = useMainContentHighlighting({
    projectId: project.id,
    tasks: projectTasks,
    projectFiles,
    pendingHighlight,
    onClearPendingHighlight,
    setActiveTab,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const handleSetActiveTab = useCallback((tab: ProjectFileTab) => {
    const previousScrollTop = contentScrollRef.current?.scrollTop;
    setActiveTab(tab);
    if (previousScrollTop == null) {
      return;
    }
    requestAnimationFrame(() => {
      if (!contentScrollRef.current) {
        return;
      }
      contentScrollRef.current.scrollTop = previousScrollTop;
    });
  }, []);
  const canMutateProjectFiles =
    !project.archived &&
    project.status.label !== "Completed" &&
    !project.completedAt;
  const fileMutationDisabledMessage =
    "Files can only be modified for active projects";
  const handleUploadClick = useCallback(() => {
    if (!canMutateProjectFiles) {
      return;
    }
    fileInputRef.current?.click();
  }, [canMutateProjectFiles]);
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (!canMutateProjectFiles) {
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }
      fileActions.create(project.id, activeTab, file);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [activeTab, canMutateProjectFiles, fileActions, project.id],
  );
  const handleRemoveFile = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!canMutateProjectFiles) {
        return;
      }
      fileActions.remove(id);
    },
    [canMutateProjectFiles, fileActions],
  );
  const currentFiles = filesByTab[activeTab];
  const filteredFiles = useMemo(
    () =>
      currentFiles
        .filter((file) =>
          file.name.toLowerCase().includes(deferredSearchQuery.toLowerCase()),
        )
        .sort((a, b) => {
          if (sortBy === "name") return a.name.localeCompare(b.name);
          return 0;
        }),
    [currentFiles, deferredSearchQuery, sortBy],
  );
  const shouldOptimizeFileRows = filteredFiles.length > 40;
  const fileRowStyle = useMemo(
    () =>
      shouldOptimizeFileRows
        ? ({ contentVisibility: "auto", containIntrinsicSize: "72px" } as const)
        : undefined,
    [shouldOptimizeFileRows],
  );
  const canCreateProjectTasks =
    !project.archived &&
    project.status.label === "Active" &&
    !project.completedAt;
  const handleMainContentScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (projectFilesPaginationStatus !== "CanLoadMore") {
        return;
      }
      const element = event.currentTarget;
      const remaining =
        element.scrollHeight - element.scrollTop - element.clientHeight;
      if (remaining <= 240) {
        loadMoreProjectFiles(100);
      }
    },
    [loadMoreProjectFiles, projectFilesPaginationStatus],
  );
  return (
    <div
      className={`flex-1 h-full txt-tone-primary overflow-hidden font-app flex flex-col relative ${
        layoutMode === "popup" ? "bg-transparent" : "bg-bg-base"
      }`}
    >
      <div
        className={`relative rounded-none flex-1 overflow-hidden flex flex-col transition-all duration-500 ease-in-out ${
          layoutMode === "popup"
            ? "bg-bg-popup rounded-[28px]"
            : "bg-bg-surface"
        }`}
      >
        {layoutMode === "page" && (
          <div className="w-full h-[57px] shrink-0">
            <HorizontalBorder
              onToggleSidebar={onToggleSidebar}
              onToggleChat={handleOpenChat}
            />
          </div>
        )}
        <div
          ref={contentScrollRef}
          className={`flex-1 overflow-y-auto py-[40px] ${
            layoutMode === "popup" ? "px-[56px]" : "px-[80px]"
          }`}
          onScroll={handleMainContentScroll}
        >
          <ProjectOverview
            project={project}
            viewerIdentity={viewerIdentity}
            projectActions={projectActions}
            navigationActions={navigationActions}
          />
          <ProjectTasks
            key={project.id}
            tasks={projectTasks}
            onUpdateTasks={(newTasks) =>
              projectActions.updateProject?.({ tasks: newTasks })
            }
            highlightedTaskId={highlightedTaskId}
            onHighlightDone={handleTaskHighlightDone}
            assignableMembers={workspaceMembers}
            viewerIdentity={viewerIdentity}
            canAddTasks={canCreateProjectTasks}
            addTaskDisabledMessage="Tasks can only be created for active projects"
            canEditTasks={canCreateProjectTasks}
            editTaskDisabledMessage="Tasks can only be edited for active projects"
          />
          <FileSection
            activeTab={activeTab}
            setActiveTab={handleSetActiveTab}
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
            renderedFileRows={
              <MainContentFileRows
                filteredFiles={filteredFiles}
                fileRowRefs={fileRowRefs}
                fileActions={fileActions}
                canMutateProjectFiles={canMutateProjectFiles}
                fileMutationDisabledMessage={fileMutationDisabledMessage}
                onRemoveFile={handleRemoveFile}
                fileRowStyle={fileRowStyle}
              />
            }
            filteredFilesLength={filteredFiles.length}
          />
        </div>
        <div className="absolute inset-0 z-50 pointer-events-none rounded-none overflow-hidden">
          {(hasLoadedChatSidebar || isChatOpen) && (
            <Suspense fallback={null}>
              <LazyChatSidebar
                isOpen={isChatOpen}
                onClose={() => setIsChatOpen(false)}
                activeProject={project}
                activeProjectTasks={projectTasks}
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
