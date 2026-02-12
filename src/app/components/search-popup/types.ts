import type React from "react";
import type { ProjectData, ProjectFileData, Task } from "../../types";
import type { AppView } from "../../lib/routing";
export interface SearchResult {
  id: string;
  type: "project" | "task" | "file" | "action";
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  category?: string;
  status?: { label: string; color: string; bgColor: string; dotColor: string };
  action: () => void;
  projectId?: string;
  taskCompleted?: boolean;
  fileType?: string;
  fileTab?: string;
}
export interface SearchIndexedProject {
  project: ProjectData;
  searchable: string;
}
export interface SearchIndexedTask {
  projectId: string;
  projectName: string;
  taskId: string;
  title: string;
  assigneeName: string;
  dueDateLabel: string;
  completed: boolean;
  searchable: string;
}
export interface SearchIndexedFile {
  key: string;
  name: string;
  type: string;
  tab: string;
  projectId: string | null;
  dateLabel: string;
  searchable: string;
}
export interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Record<string, ProjectData>;
  workspaceTasks?: Task[];
  files: ProjectFileData[];
  workspaceFilesPaginationStatus?:
    | "LoadingFirstPage"
    | "CanLoadMore"
    | "LoadingMore"
    | "Exhausted";
  loadMoreWorkspaceFiles?: (numItems: number) => void;
  onNavigate: (view: AppView) => void;
  onOpenInbox: () => void;
  onOpenCreateProject: () => void;
  onOpenSettings: (tab?: string) => void;
  onHighlightNavigate?: (
    projectId: string,
    highlight: {
      type: "task" | "file";
      taskId?: string;
      fileName?: string;
      fileTab?: string;
    },
  ) => void;
}
export type QuickAction = {
  id: string;
  label: string;
  icon: React.ReactNode;
  keyword: string;
};
