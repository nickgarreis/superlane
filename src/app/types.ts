export type Workspace = {
  id: string;
  name: string;
  plan: string;
  logo?: string;
  logoColor?: string;
  logoText?: string;
};

export interface Task {
  id: string;
  title: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  completed: boolean;
}

export interface ProjectDraftData {
  selectedService: string;
  projectName: string;
  selectedJob: string;
  description: string;
  isAIEnabled: boolean;
  deadline?: string; // ISO date string
  lastStep: number;
}

export type ProjectStatus = "Draft" | "Review" | "Active" | "Completed";
export type ProjectFileTab = "Assets" | "Contract" | "Attachments";

export interface ProjectData {
  id: string;
  name: string;
  description: string;
  creator: {
    name: string;
    avatar: string;
  };
  status: {
    label: string;
    color: string;
    bgColor: string;
    dotColor: string;
  };
  previousStatus?: {
    label: string;
    color: string;
    bgColor: string;
    dotColor: string;
  };
  category: string;
  scope?: string;
  deadline: string;
  workspaceId?: string;
  archived?: boolean;
  archivedAt?: string;
  completedAt?: string;
  draftData?: ProjectDraftData;
  attachments?: Array<{
    id: number | string;
    name: string;
    type: string;
    date: string;
    img: string;
  }>;
  tasks?: Task[];
  comments?: Array<{
    id: string;
    author: { name: string; avatar: string };
    content: string;
    timestamp: string;
  }>;
}

export interface DbWorkspaceRecord {
  id: string;
  slug: string;
  name: string;
  plan: string;
  logo?: string;
  logoColor?: string;
  logoText?: string;
  workosOrganizationId?: string;
}

export interface DbTaskRecord {
  id: string;
  projectPublicId: string;
  taskId: string;
  title: string;
  assignee: {
    name: string;
    avatar: string;
  };
  dueDate: string;
  completed: boolean;
}

export interface ProjectFileData {
  id: string;
  projectPublicId: string;
  tab: ProjectFileTab;
  name: string;
  type: string;
  displayDate: string;
  thumbnailRef?: string | null;
}

export interface DbProjectRecord {
  id: string;
  publicId: string;
  workspaceId: string;
  creatorUserId: string;
  name: string;
  description: string;
  category: string;
  scope?: string;
  deadline?: string;
  status: ProjectStatus;
  previousStatus?: ProjectStatus | null;
  archived: boolean;
  archivedAt?: number | null;
  completedAt?: number | null;
  draftData?: ProjectDraftData | null;
  attachments?: Array<{
    id: number | string;
    name: string;
    type: string;
    date: string;
    img: string;
  }>;
  reviewComments?: Array<{
    id: string;
    author: { name: string; avatar: string };
    content: string;
    timestamp: string;
  }>;
}
