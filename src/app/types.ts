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