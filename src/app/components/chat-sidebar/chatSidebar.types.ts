import type { AppView } from "../../lib/routing";
import type {
  ProjectData,
  Task,
  ViewerIdentity,
  WorkspaceMember,
} from "../../types";

export interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeProject: ProjectData;
  activeProjectTasks: Task[];
  allProjects: Record<string, ProjectData>;
  workspaceMembers: WorkspaceMember[];
  viewerIdentity: ViewerIdentity;
  onSwitchProject?: (view: AppView) => void;
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
  allFiles?: Array<{ id: number | string; name: string; type: string }>;
}
