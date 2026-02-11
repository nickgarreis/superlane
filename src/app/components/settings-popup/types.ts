import type { Workspace } from "../../types";

import imgFile1 from "figma:asset/86b9c3843ae4733f84c25f8c5003a47372346c7b.png";
import imgFile2 from "figma:asset/ed2300ecc7d7f37175475469dd895c1a9c7a47a7.png";
import imgFile3 from "figma:asset/a6d8d90aa9a345c6a0a0841855776fa6f038f822.png";
import imgFile4 from "figma:asset/6ec5d42097faff5a5e15a92d842d637a67eb0f04.png";
import imgFile5 from "figma:asset/13b4fb46cd2c4b965c5823ea01fe2f6c7842b7bd.png";

export type SettingsTab = "Account" | "Notifications" | "Company" | "Billing";
export type CompanyRole = "owner" | "admin" | "member";

export type AccountSettingsData = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
};

export type NotificationSettingsData = {
  events: {
    eventNotifications: boolean;
    teamActivities: boolean;
    productUpdates: boolean;
  };
};

export type CompanyMember = {
  userId: string;
  name: string;
  email: string;
  role: CompanyRole;
  status: "active" | "invited" | "removed";
  avatarUrl: string | null;
};

export type CompanyPendingInvitation = {
  invitationId: string;
  email: string;
  state: "pending" | "accepted" | "expired" | "revoked";
  requestedRole: "admin" | "member";
  expiresAt: string;
};

export type CompanyBrandAsset = {
  id: string;
  name: string;
  type: string;
  displayDateEpochMs: number;
  sizeBytes: number;
  mimeType: string;
  downloadUrl: string | null;
};

export type CompanySettingsData = {
  workspace: {
    id: string;
    slug: string;
    name: string;
    plan: string;
    logo: string | null;
    logoColor: string | null;
    logoText: string | null;
    workosOrganizationId: string | null;
  };
  capability: {
    hasOrganizationLink: boolean;
    canManageWorkspaceGeneral: boolean;
    canManageMembers: boolean;
    canManageBrandAssets: boolean;
    canDeleteWorkspace: boolean;
  };
  members: CompanyMember[];
  pendingInvitations: CompanyPendingInvitation[];
  brandAssets: CompanyBrandAsset[];
  viewerRole: CompanyRole;
};

export interface SettingsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  activeWorkspace?: Workspace;

  account: AccountSettingsData | null;
  notifications: NotificationSettingsData | null;
  company: CompanySettingsData | null;
  loadingCompany: boolean;

  onSaveAccount: (payload: { firstName: string; lastName: string; email: string }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
  onSaveNotifications: (payload: NotificationSettingsData) => Promise<void>;

  onUpdateWorkspaceGeneral: (payload: {
    name: string;
    logo?: string;
    logoColor?: string;
    logoText?: string;
  }) => Promise<void>;
  onUploadWorkspaceLogo: (file: File) => Promise<void>;
  onInviteMember: (payload: { email: string; role: "admin" | "member" }) => Promise<void>;
  onChangeMemberRole: (payload: { userId: string; role: "admin" | "member" }) => Promise<void>;
  onRemoveMember: (payload: { userId: string }) => Promise<void>;
  onResendInvitation: (payload: { invitationId: string }) => Promise<void>;
  onRevokeInvitation: (payload: { invitationId: string }) => Promise<void>;

  onUploadBrandAsset: (file: File) => Promise<void>;
  onRemoveBrandAsset: (payload: { brandAssetId: string }) => Promise<void>;
  onGetBrandAssetDownloadUrl: (payload: { brandAssetId: string }) => Promise<string | null>;
  onSoftDeleteWorkspace: () => Promise<void>;
}

export const FILE_THUMBNAIL_BY_TYPE: Record<string, string> = {
  SVG: imgFile1,
  PNG: imgFile2,
  ZIP: imgFile3,
  PDF: imgFile4,
  DOCX: imgFile5,
  FIG: imgFile5,
  XLSX: imgFile4,
  FILE: imgFile4,
};

export const bytesToHumanReadable = (bytes: number) => {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "-";
  }
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }
  return `${size.toFixed(size >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

/** Pick the best preview source for a brand asset: real image when possible, type-icon fallback otherwise. */
export const getAssetPreviewSrc = (asset: CompanyBrandAsset): string => {
  if (asset.downloadUrl && asset.mimeType.startsWith("image/")) {
    return asset.downloadUrl;
  }
  return FILE_THUMBNAIL_BY_TYPE[asset.type] ?? imgFile4;
};
