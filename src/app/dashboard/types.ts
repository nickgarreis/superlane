import type { Dispatch, SetStateAction } from "react";
import type { AppView } from "../lib/routing";
import type { ProjectData, ProjectFileTab } from "../types";

export type PendingHighlight = {
  projectId: string;
  type: "task" | "file";
  taskId?: string;
  fileName?: string;
  fileTab?: string;
};

export type SettingsTab = "Account" | "Notifications" | "Company" | "Billing";

export const SETTINGS_TABS: readonly SettingsTab[] = ["Account", "Notifications", "Company", "Billing"];

export const parseSettingsTab = (value: string | null | undefined): SettingsTab => {
  if (value && (SETTINGS_TABS as readonly string[]).includes(value)) {
    return value as SettingsTab;
  }
  return "Account";
};

export interface MainContentProjectActions {
  archive?: (id: string) => void;
  unarchive?: (id: string) => void;
  remove?: (id: string) => void;
  updateStatus?: (id: string, status: string) => void;
  updateProject?: (data: Partial<ProjectData>) => void;
}

export interface MainContentFileActions {
  create: (projectPublicId: string, tab: ProjectFileTab, file: File) => void;
  remove: (fileId: string) => void;
  download: (fileId: string) => void;
}

export type NavigationDestination = "archive";

export interface MainContentNavigationActions {
  navigate?: (view: AppView) => void;
  backTo?: NavigationDestination;
  back?: () => void;
}

export type DashboardContentModel =
  | { kind: "tasks" }
  | { kind: "archive" }
  | { kind: "main"; project: ProjectData; backTo?: NavigationDestination; back?: () => void }
  | { kind: "empty" };

export interface DashboardControllerArgs {
  currentView: AppView;
  projects: Record<string, ProjectData>;
  visibleProjects: Record<string, ProjectData>;
  setIsSidebarOpen: Dispatch<SetStateAction<boolean>>;
  setPendingHighlight: Dispatch<SetStateAction<PendingHighlight | null>>;
  navigateView: (view: AppView) => void;
}

export interface DashboardControllerResult {
  contentModel: DashboardContentModel;
  toggleSidebar: () => void;
  clearPendingHighlight: () => void;
}
