export type Workspace = {
  id: string;
  slug: string;
  name: string;
  plan: string;
  logo?: string;
  logoColor?: string;
  logoText?: string;
};
export type WorkspaceRole = "owner" | "admin" | "member";
export interface WorkspaceMember {
  userId: string;
  workosUserId: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: WorkspaceRole;
  isViewer: boolean;
}
export interface ViewerIdentity {
  userId: string | null;
  workosUserId: string | null;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: WorkspaceRole | null;
}
export type ProjectVisibility = "workspace" | "private";
export interface CommentReaction {
  emoji: string;
  users: string[];
  userIds: string[];
}
export interface CollaborationComment {
  id: string;
  author: { userId: string; name: string; avatar: string };
  content: string;
  timestamp: string;
  timestampEpochMs?: number;
  replyCount?: number;
  replies: CollaborationComment[];
  resolved?: boolean;
  edited?: boolean;
  reactions?: CommentReaction[];
}
export interface ReviewComment {
  id: string;
  author: { userId?: string; name: string; avatar: string };
  content: string;
  timestamp: string;
}
export interface Task {
  id: string;
  title: string;
  projectId?: string;
  assignee: { userId?: string; name: string; avatar: string };
  dueDateEpochMs?: number | null;
  completed: boolean;
}
export interface ProjectDraftData {
  selectedService: string;
  projectName: string;
  selectedJob: string;
  description: string;
  isAIEnabled: boolean;
  deadlineEpochMs?: number | null;
  lastStep: number;
}
export type ProjectStatus = "Draft" | "Review" | "Active" | "Completed";
export type ProjectFileTab = "Assets" | "Contract" | "Attachments";
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  creator: { userId?: string; name: string; avatar: string };
  status: { label: string; color: string; bgColor: string; dotColor: string };
  previousStatus?: {
    label: string;
    color: string;
    bgColor: string;
    dotColor: string;
  };
  category: string;
  scope?: string;
  deadlineEpochMs?: number | null;
  workspaceId?: string;
  archived?: boolean;
  archivedAt?: number | null;
  completedAt?: number | null;
  lastApprovedAt?: number | null;
  draftData?: ProjectDraftData;
  attachments?: Array<{
    id: number | string;
    name: string;
    type: string;
    dateEpochMs?: number | null;
    img: string;
  }>;
  tasks?: Task[];
  comments?: ReviewComment[];
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
  projectPublicId?: string | null;
  taskId: string;
  title: string;
  assignee: { userId?: string; name: string; avatar: string };
  dueDateEpochMs?: number | null;
  completed: boolean;
}
export interface ProjectFileData {
  id: string;
  projectPublicId: string;
  tab: ProjectFileTab;
  name: string;
  type: string;
  displayDateEpochMs: number;
  thumbnailRef?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  downloadable?: boolean;
}
export type PendingDraftAttachmentUpload = {
  clientId: string;
  file: File;
  name: string;
  type: string;
  status: "uploading" | "uploaded" | "error";
  error?: string;
  pendingUploadId?: string;
};
export interface DbProjectRecord {
  id: string;
  publicId: string;
  workspaceId: string;
  creatorUserId: string;
  name: string;
  description: string;
  category: string;
  scope?: string;
  deadlineEpochMs?: number | null;
  status: ProjectStatus;
  previousStatus?: ProjectStatus | null;
  archived: boolean;
  archivedAt?: number | null;
  completedAt?: number | null;
  lastApprovedAt?: number | null;
  draftData?: ProjectDraftData | null;
  attachments?: Array<{
    id: number | string;
    name: string;
    type: string;
    dateEpochMs?: number | null;
    img: string;
  }>;
  reviewComments?: ReviewComment[];
}

export type WorkspaceActivityKind =
  | "project"
  | "task"
  | "collaboration"
  | "file"
  | "membership"
  | "workspace"
  | "organization";

export interface WorkspaceActivity {
  id: string;
  kind: WorkspaceActivityKind;
  action: string;
  actorType: "user" | "system";
  actorUserId: string | null;
  actorName: string;
  actorAvatarUrl: string | null;
  projectPublicId: string | null;
  projectName: string | null;
  projectCategory?: string | null;
  projectVisibility: ProjectVisibility;
  projectOwnerUserId: string | null;
  taskId: string | null;
  taskTitle: string | null;
  fileName: string | null;
  fileTab: ProjectFileTab | null;
  targetUserId: string | null;
  targetUserName: string | null;
  targetUserAvatarUrl?: string | null;
  targetRole: WorkspaceRole | null;
  fromValue: string | null;
  toValue: string | null;
  message: string | null;
  errorCode: string | null;
  createdAt: number;
  isRead?: boolean;
}
