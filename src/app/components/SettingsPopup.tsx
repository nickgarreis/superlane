import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Building2,
  Camera,
  Check,
  ChevronDown,
  CreditCard,
  Download,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
  User,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { cn } from "../../lib/utils";
import type { Workspace } from "../types";

// File-type thumbnail assets (same assets used in MainContent.tsx)
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

type SettingsTab = "Account" | "Notifications" | "Company" | "Billing";
type CompanyRole = "owner" | "admin" | "member";

type AccountSettingsData = {
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
};

type NotificationSettingsData = {
  channels: {
    email: boolean;
    desktop: boolean;
  };
  events: {
    productUpdates: boolean;
    teamActivity: boolean;
  };
};

type CompanyMember = {
  userId: string;
  name: string;
  email: string;
  role: CompanyRole;
  status: "active" | "invited" | "removed";
  avatarUrl: string | null;
};

type CompanyPendingInvitation = {
  invitationId: string;
  email: string;
  state: "pending" | "accepted" | "expired" | "revoked";
  requestedRole: "admin" | "member";
  expiresAt: string;
};

type CompanyBrandAsset = {
  id: string;
  name: string;
  type: string;
  displayDateEpochMs: number;
  sizeBytes: number;
  mimeType: string;
  downloadUrl: string | null;
};

/** Pick the best preview source for a brand asset: real image when possible, type-icon fallback otherwise. */
const getAssetPreviewSrc = (asset: CompanyBrandAsset): string => {
  if (asset.downloadUrl && asset.mimeType.startsWith("image/")) {
    return asset.downloadUrl;
  }
  return FILE_THUMBNAIL_BY_TYPE[asset.type] ?? imgFile4;
};

type CompanySettingsData = {
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
    canManageMembers: boolean;
    canManageBrandAssets: boolean;
    canDeleteWorkspace: boolean;
  };
  members: CompanyMember[];
  pendingInvitations: CompanyPendingInvitation[];
  brandAssets: CompanyBrandAsset[];
  viewerRole: CompanyRole;
};

interface SettingsPopupProps {
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
  onRemoveWorkspaceLogo: () => Promise<void>;
  onInviteMember: (payload: { email: string; role: "admin" | "member" }) => Promise<void>;
  onChangeMemberRole: (payload: { userId: string; role: "admin" | "member" }) => Promise<void>;
  onRemoveMember: (payload: { userId: string }) => Promise<void>;
  onResendInvitation: (payload: { invitationId: string }) => Promise<void>;
  onRevokeInvitation: (payload: { invitationId: string }) => Promise<void>;

  onUploadBrandAsset: (file: File) => Promise<void>;
  onRemoveBrandAsset: (payload: { brandAssetId: string }) => Promise<void>;
  onSoftDeleteWorkspace: () => Promise<void>;
}

const bytesToHumanReadable = (bytes: number) => {
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

export function SettingsPopup({
  isOpen,
  onClose,
  initialTab = "Account",
  activeWorkspace,
  account,
  notifications,
  company,
  loadingCompany,
  onSaveAccount,
  onUploadAvatar,
  onRemoveAvatar,
  onSaveNotifications,
  onUpdateWorkspaceGeneral,
  onUploadWorkspaceLogo,
  onRemoveWorkspaceLogo,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onResendInvitation,
  onRevokeInvitation,
  onUploadBrandAsset,
  onRemoveBrandAsset,
  onSoftDeleteWorkspace,
}: SettingsPopupProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[980px] h-[680px] bg-bg-base border border-white/10 rounded-[24px] shadow-2xl flex overflow-hidden font-['Roboto',sans-serif] text-[#E8E8E8]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="w-[240px] flex flex-col py-6 px-4 shrink-0 bg-bg-base">
          <div className="px-2 mb-6 mt-2">
            <span className="text-[18px] font-medium text-[#E8E8E8]">Settings</span>
          </div>

          <div className="flex flex-col gap-1">
            {[
              { id: "Account", icon: User, label: "My Account" },
              { id: "Notifications", icon: Bell, label: "Notifications" },
              { id: "Company", icon: Building2, label: "Company" },
              { id: "Billing", icon: CreditCard, label: "Billing & Plans" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as SettingsTab)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all group outline-none cursor-pointer",
                  activeTab === item.id
                    ? "bg-white/10 text-[#E8E8E8]"
                    : "text-[#E8E8E8]/60 hover:text-[#E8E8E8] hover:bg-white/5",
                )}
              >
                <item.icon
                  size={16}
                  strokeWidth={2}
                  className={cn(
                    "transition-colors",
                    activeTab === item.id ? "text-[#E8E8E8]" : "text-[#E8E8E8]/60 group-hover:text-[#E8E8E8]",
                  )}
                />
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="ml-auto w-1 h-1 rounded-full bg-white"
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 bg-bg-surface m-2 rounded-[20px] border border-white/5 flex flex-col overflow-hidden relative">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full text-white/40 hover:text-white transition-colors outline-none cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <div className="max-w-[700px] mx-auto py-12 px-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-8">
                    <h2 className="text-[24px] font-medium text-[#E8E8E8] mb-2">
                      {activeTab === "Account"
                        ? "My Account"
                        : activeTab === "Notifications"
                          ? "Notifications"
                          : activeTab === "Company"
                            ? "Company"
                            : "Billing & Plans"}
                    </h2>
                    <p className="text-[14px] text-[#E8E8E8]/60">
                      {activeTab === "Account" && "Manage your personal profile and preferences."}
                      {activeTab === "Notifications" && "Control your app notification settings."}
                      {activeTab === "Company" && "Manage workspace settings, members, and brand assets."}
                      {activeTab === "Billing" && "Billing is coming soon. This panel is read-only for now."}
                    </p>
                  </div>

                  {activeTab === "Account" && account && (
                    <AccountSettings
                      data={account}
                      onSave={onSaveAccount}
                      onUploadAvatar={onUploadAvatar}
                      onRemoveAvatar={onRemoveAvatar}
                    />
                  )}

                  {activeTab === "Notifications" && notifications && (
                    <NotificationSettings
                      data={notifications}
                      onSave={onSaveNotifications}
                    />
                  )}

                  {activeTab === "Company" && (
                    <WorkspaceSettings
                      activeWorkspace={activeWorkspace}
                      company={company}
                      loading={loadingCompany}
                      onUpdateWorkspaceGeneral={onUpdateWorkspaceGeneral}
                      onUploadWorkspaceLogo={onUploadWorkspaceLogo}
                      onRemoveWorkspaceLogo={onRemoveWorkspaceLogo}
                      onInviteMember={onInviteMember}
                      onChangeMemberRole={onChangeMemberRole}
                      onRemoveMember={onRemoveMember}
                      onResendInvitation={onResendInvitation}
                      onRevokeInvitation={onRevokeInvitation}
                      onUploadBrandAsset={onUploadBrandAsset}
                      onRemoveBrandAsset={onRemoveBrandAsset}
                      onSoftDeleteWorkspace={onSoftDeleteWorkspace}
                    />
                  )}

                  {activeTab === "Billing" && <BillingSettings />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountSettings({
  data,
  onSave,
  onUploadAvatar,
  onRemoveAvatar,
}: {
  data: AccountSettingsData;
  onSave: (payload: { firstName: string; lastName: string; email: string }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
}) {
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [email, setEmail] = useState(data.email);
  const [saving, setSaving] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setEmail(data.email);
  }, [data.firstName, data.lastName, data.email]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({ firstName, lastName, email });
      toast.success("Account updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update account");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setAvatarBusy(true);
    try {
      await onUploadAvatar(file);
      toast.success("Profile picture updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile picture");
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarBusy(true);
    try {
      await onRemoveAvatar();
      toast.success("Profile picture removed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove profile picture");
    } finally {
      setAvatarBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start gap-6 pb-8 border-b border-white/5">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleAvatarFile}
        />

        <div
          className="w-[100px] h-[100px] rounded-full overflow-hidden border border-white/10 shrink-0 group relative cursor-pointer bg-[#2A2A2C]"
          onClick={() => fileInputRef.current?.click()}
        >
          {data.avatarUrl ? (
            <img src={data.avatarUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#E8E8E8]/40">
              <User size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[12px] font-medium text-white">Change</span>
          </div>
        </div>

        <div className="flex flex-col pt-2 gap-3">
          <h3 className="text-[16px] font-medium text-[#E8E8E8]">Profile Picture</h3>
          <div className="flex gap-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarBusy}
              className="cursor-pointer px-4 py-2 bg-[#E8E8E8] text-bg-base rounded-full text-[13px] font-medium hover:bg-white transition-colors disabled:opacity-60"
            >
              Upload new
            </button>
            <button
              onClick={handleRemoveAvatar}
              disabled={!data.avatarUrl || avatarBusy}
              className="cursor-pointer px-4 py-2 bg-white/5 text-[#E8E8E8] border border-white/10 rounded-full text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Remove
            </button>
          </div>
          <p className="text-[13px] text-[#E8E8E8]/40 max-w-[320px]">
            JPG, PNG or GIF. Max file size 2MB.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#E8E8E8]/80">First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-medium text-[#E8E8E8]/80">Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[13px] font-medium text-[#E8E8E8]/80">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
          />
        </div>
      </div>

      <div className="pt-6 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer px-6 py-2.5 bg-[#E8E8E8] hover:bg-white text-bg-base rounded-full text-[14px] font-medium transition-colors shadow-lg shadow-white/5 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-start justify-between py-5 border-b border-white/5 last:border-0 group">
      <div className="flex flex-col gap-1 pr-8">
        <span className="text-[14px] font-medium text-[#E8E8E8]/90 group-hover:text-white transition-colors">{label}</span>
        <span className="text-[13px] text-[#E8E8E8]/50">{description}</span>
      </div>
      <button
        onClick={onToggle}
        className={cn(
          "w-[44px] h-[24px] rounded-full relative transition-colors shrink-0 cursor-pointer",
          checked ? "bg-[#10b981]" : "bg-white/10",
        )}
      >
        <motion.div
          className={cn(
            "absolute top-[2px] w-[20px] h-[20px] rounded-full shadow-sm transition-all",
            checked ? "bg-white left-[22px]" : "bg-[#E8E8E8] left-[2px]",
          )}
          layout
          transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
      </button>
    </div>
  );
}

function NotificationSettings({
  data,
  onSave,
}: {
  data: NotificationSettingsData;
  onSave: (payload: NotificationSettingsData) => Promise<void>;
}) {
  const [state, setState] = useState<NotificationSettingsData>(data);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setState(data);
  }, [data]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(state);
      toast.success("Notification preferences updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update notification preferences");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col rounded-xl">
        <ToggleRow
          label="Email Channel"
          description="Allow email delivery for enabled events."
          checked={state.channels.email}
          onToggle={() => setState((current) => ({
            ...current,
            channels: { ...current.channels, email: !current.channels.email },
          }))}
        />
        <ToggleRow
          label="Desktop Channel"
          description="Allow in-app/browser notifications for enabled events."
          checked={state.channels.desktop}
          onToggle={() => setState((current) => ({
            ...current,
            channels: { ...current.channels, desktop: !current.channels.desktop },
          }))}
        />
        <ToggleRow
          label="Product Updates"
          description="Receive announcements and product change notifications."
          checked={state.events.productUpdates}
          onToggle={() => setState((current) => ({
            ...current,
            events: { ...current.events, productUpdates: !current.events.productUpdates },
          }))}
        />
        <ToggleRow
          label="Team Activity"
          description="Receive notifications for comments and team actions."
          checked={state.events.teamActivity}
          onToggle={() => setState((current) => ({
            ...current,
            events: { ...current.events, teamActivity: !current.events.teamActivity },
          }))}
        />
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="cursor-pointer px-6 py-2.5 bg-[#E8E8E8] hover:bg-white text-bg-base rounded-full text-[14px] font-medium transition-colors shadow-lg shadow-white/5 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}

function WorkspaceSettings({
  activeWorkspace,
  company,
  loading,
  onUpdateWorkspaceGeneral,
  onUploadWorkspaceLogo,
  onRemoveWorkspaceLogo,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onResendInvitation,
  onRevokeInvitation,
  onUploadBrandAsset,
  onRemoveBrandAsset,
  onSoftDeleteWorkspace,
}: {
  activeWorkspace?: Workspace;
  company: CompanySettingsData | null;
  loading: boolean;
  onUpdateWorkspaceGeneral: (payload: {
    name: string;
    logo?: string;
    logoColor?: string;
    logoText?: string;
  }) => Promise<void>;
  onUploadWorkspaceLogo: (file: File) => Promise<void>;
  onRemoveWorkspaceLogo: () => Promise<void>;
  onInviteMember: (payload: { email: string; role: "admin" | "member" }) => Promise<void>;
  onChangeMemberRole: (payload: { userId: string; role: "admin" | "member" }) => Promise<void>;
  onRemoveMember: (payload: { userId: string }) => Promise<void>;
  onResendInvitation: (payload: { invitationId: string }) => Promise<void>;
  onRevokeInvitation: (payload: { invitationId: string }) => Promise<void>;
  onUploadBrandAsset: (file: File) => Promise<void>;
  onRemoveBrandAsset: (payload: { brandAssetId: string }) => Promise<void>;
  onSoftDeleteWorkspace: () => Promise<void>;
}) {
  const workspaceName = company?.workspace.name ?? activeWorkspace?.name ?? "Workspace";
  const [nameDraft, setNameDraft] = useState(workspaceName);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [isInviteRoleOpen, setIsInviteRoleOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [nameSaveStatus, setNameSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setNameDraft(workspaceName);
    isFirstRender.current = true;
  }, [workspaceName]);

  const members = company?.members ?? [];
  const pendingInvitations = company?.pendingInvitations ?? [];
  const brandAssets = company?.brandAssets ?? [];

  const hasOrganizationLink = company?.capability.hasOrganizationLink ?? false;
  const canManageMembers = company?.capability.canManageMembers ?? false;
  const canManageBrandAssets = company?.capability.canManageBrandAssets ?? false;
  const canDeleteWorkspace = company?.capability.canDeleteWorkspace ?? false;

  const initials = useMemo(() => {
    if (company?.workspace.logoText) {
      return company.workspace.logoText;
    }
    return workspaceName.charAt(0).toUpperCase() || "W";
  }, [company?.workspace.logoText, workspaceName]);

  const saveWorkspaceName = useCallback(
    async (name: string) => {
      if (!company) {
        return;
      }
      const trimmed = name.trim();
      if (!trimmed || trimmed === company.workspace.name) {
        return;
      }
      setNameSaveStatus("saving");
      try {
        await onUpdateWorkspaceGeneral({ name: trimmed });
        setNameSaveStatus("saved");
        setTimeout(() => setNameSaveStatus("idle"), 1500);
      } catch (error) {
        console.error(error);
        toast.error("Failed to update workspace name");
        setNameSaveStatus("idle");
      }
    },
    [company, onUpdateWorkspaceGeneral],
  );

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (nameDebounceRef.current) {
      clearTimeout(nameDebounceRef.current);
    }

    nameDebounceRef.current = setTimeout(() => {
      void saveWorkspaceName(nameDraft);
    }, 800);

    return () => {
      if (nameDebounceRef.current) {
        clearTimeout(nameDebounceRef.current);
      }
    };
  }, [nameDraft, saveWorkspaceName]);

  const handleLogoFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setLogoBusy(true);
    try {
      await onUploadWorkspaceLogo(file);
      toast.success("Workspace logo updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update workspace logo");
    } finally {
      setLogoBusy(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveLogo = async () => {
    setLogoBusy(true);
    try {
      await onRemoveWorkspaceLogo();
      toast.success("Workspace logo removed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to remove workspace logo");
    } finally {
      setLogoBusy(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      return;
    }
    setInviting(true);
    try {
      await onInviteMember({ email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail("");
      setInviteRole("member");
      toast.success("Invitation sent");
    } catch (error) {
      console.error(error);
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleUploadBrandAsset = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    try {
      await onUploadBrandAsset(file);
      toast.success("Brand asset uploaded");
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload brand asset");
    } finally {
      event.currentTarget.value = "";
    }
  };

  const handleSoftDeleteWorkspace = async () => {
    const confirmed = window.confirm("Delete this workspace? This will immediately remove access for all members.");
    if (!confirmed) {
      return;
    }

    setDeletingWorkspace(true);
    try {
      await onSoftDeleteWorkspace();
      toast.success("Workspace deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete workspace");
    } finally {
      setDeletingWorkspace(false);
    }
  };

  if (loading) {
    return <div className="text-[#E8E8E8]/60 text-[14px]">Loading company settings...</div>;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <h3 className="text-[16px] font-medium text-[#E8E8E8]">General</h3>

        <div className="flex items-start gap-6">
          <input
            type="file"
            ref={logoFileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleLogoFile}
          />

          <div
            className="w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-inner shrink-0 border border-white/10 bg-blue-600 overflow-hidden group relative cursor-pointer"
            style={company?.workspace.logoColor ? { backgroundColor: company.workspace.logoColor } : undefined}
            onClick={() => !logoBusy && canManageMembers && logoFileInputRef.current?.click()}
          >
            {company?.workspace.logo ? (
              <img src={company.workspace.logo} alt={company.workspace.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
            {canManageMembers && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                <Camera size={20} className="text-white" />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 flex-1 max-w-[460px]">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-medium text-[#E8E8E8]/60">Workspace Name</label>
              {nameSaveStatus !== "idle" && (
                <span className="text-[12px] text-[#E8E8E8]/40 flex items-center gap-1.5">
                  {nameSaveStatus === "saving" && "Saving..."}
                  {nameSaveStatus === "saved" && (
                    <>
                      <Check size={12} className="text-emerald-400" />
                      <span className="text-emerald-400/70">Saved</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <input
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <h3 className="text-[16px] font-medium text-[#E8E8E8]">Members</h3>
          <p className="text-[13px] text-[#E8E8E8]/40">Manage workspace access and invitations.</p>
        </div>

        {!hasOrganizationLink && (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-100">
            This workspace is not linked to a WorkOS organization. Member management is disabled until it is linked.
          </div>
        )}

        <div className="flex flex-col gap-3 pb-2">
          <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider">Invite Team Members</h4>
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2.5 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
                disabled={!canManageMembers || !hasOrganizationLink || inviting}
              />
            </div>

            <div className="relative">
              {isInviteRoleOpen && <div className="fixed inset-0 z-10" onClick={() => setIsInviteRoleOpen(false)} />}
              <button
                onClick={() => setIsInviteRoleOpen((current) => !current)}
                disabled={!canManageMembers || !hasOrganizationLink || inviting}
                className="h-[42px] px-3 bg-transparent border-b border-white/10 rounded-none text-[13px] font-medium text-[#E8E8E8] flex items-center gap-2 hover:border-white/40 transition-colors min-w-[100px] justify-between relative z-20 cursor-pointer disabled:opacity-50"
              >
                {inviteRole}
                <ChevronDown size={14} className="text-white/40" />
              </button>

              {isInviteRoleOpen && (
                <div className="absolute right-0 top-full mt-1 w-[120px] bg-[#1A1A1C] border border-[#262626] rounded-lg shadow-xl overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                  {["member", "admin"].map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        setInviteRole(role as "admin" | "member");
                        setIsInviteRoleOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-[13px] hover:bg-white/5 cursor-pointer text-[#E8E8E8]"
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleInvite}
              disabled={!inviteEmail || !canManageMembers || !hasOrganizationLink || inviting}
              className="h-[42px] px-5 bg-[#E8E8E8] text-bg-base hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
            >
              {inviting ? "Inviting..." : "Invite"}
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider mb-4">Members ({members.length + pendingInvitations.length})</h4>
          <div className="flex flex-col">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[12px] font-medium text-white overflow-hidden shadow-inner">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      member.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#E8E8E8]">{member.name}</span>
                    <span className="text-[12px] text-[#E8E8E8]/40">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.role === "owner" ? (
                    <span className="px-3 py-1 text-[12px] text-[#E8E8E8]/70">owner</span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(event) => {
                        const role = event.target.value as "admin" | "member";
                        void onChangeMemberRole({ userId: member.userId, role })
                          .then(() => toast.success("Member role updated"))
                          .catch((error) => {
                            console.error(error);
                            toast.error("Failed to update member role");
                          });
                      }}
                      disabled={!canManageMembers || !hasOrganizationLink}
                      className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[12px] text-[#E8E8E8] outline-none disabled:opacity-50"
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  )}

                  {member.role !== "owner" && (
                    <button
                      className="text-[12px] text-red-400/80 hover:text-red-400 transition-colors font-medium cursor-pointer disabled:opacity-50"
                      disabled={!canManageMembers || !hasOrganizationLink}
                      onClick={() => {
                        void onRemoveMember({ userId: member.userId })
                          .then(() => toast.success("Member removed"))
                          .catch((error) => {
                            console.error(error);
                            toast.error("Failed to remove member");
                          });
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            ))}

            {pendingInvitations.map((invitation) => (
              <div
                key={invitation.invitationId}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[12px] font-medium text-white/60 overflow-hidden shadow-inner border border-dashed border-white/20">
                    {invitation.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-medium text-[#E8E8E8]/70">{invitation.email}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-300/80 rounded">Pending</span>
                    </div>
                    <span className="text-[12px] text-[#E8E8E8]/40">
                      {invitation.requestedRole} · expires {new Date(invitation.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    title="Resend invitation"
                    className="p-1.5 hover:bg-white/10 text-[#E8E8E8]/30 hover:text-[#58AFFF] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    disabled={!canManageMembers || !hasOrganizationLink}
                    onClick={() => {
                      void onResendInvitation({ invitationId: invitation.invitationId })
                        .then(() => toast.success("Invitation resent"))
                        .catch((error) => {
                          console.error(error);
                          toast.error("Failed to resend invitation");
                        });
                    }}
                  >
                    <RotateCcw size={14} />
                  </button>
                  <button
                    title="Revoke invitation"
                    className="p-1.5 hover:bg-red-500/10 text-[#E8E8E8]/30 hover:text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    disabled={!canManageMembers || !hasOrganizationLink}
                    onClick={() => {
                      void onRevokeInvitation({ invitationId: invitation.invitationId })
                        .then(() => toast.success("Invitation revoked"))
                        .catch((error) => {
                          console.error(error);
                          toast.error("Failed to revoke invitation");
                        });
                    }}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[16px] font-medium text-[#E8E8E8]">Brand Assets</h3>
            <p className="text-[13px] text-[#E8E8E8]/40">Workspace-level brand files.</p>
          </div>
          <label className="inline-flex items-center gap-2 px-3 py-2 bg-[#E8E8E8] rounded-full text-bg-base text-[13px] font-medium cursor-pointer disabled:opacity-50">
            <Upload size={14} /> Upload
            <input
              type="file"
              className="hidden"
              disabled={!canManageBrandAssets}
              onChange={handleUploadBrandAsset}
            />
          </label>
        </div>

        <div className="flex flex-col gap-2">
          {brandAssets.length === 0 && <p className="text-[13px] text-[#E8E8E8]/40">No brand assets uploaded.</p>}
          {brandAssets.map((asset) => (
            <div key={asset.id} className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 relative">
              {/* Thumbnail preview */}
              <div className="w-10 h-12 shrink-0 bg-white rounded flex items-center justify-center overflow-hidden shadow-sm relative">
                <img
                  src={getAssetPreviewSrc(asset)}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Name + metadata */}
              <div className="flex-1 min-w-0 flex flex-col">
                <span className="text-[14px] text-[#E8E8E8] truncate">{asset.name}</span>
                <span className="text-[12px] text-[#E8E8E8]/40">
                  {asset.type} • {bytesToHumanReadable(asset.sizeBytes)} • {new Date(asset.displayDateEpochMs).toLocaleDateString()}
                </span>
              </div>
              {/* Actions – visible on row hover */}
              <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="text-[12px] text-[#58AFFF] hover:text-[#7fc0ff] transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={!asset.downloadUrl}
                  onClick={() => {
                    if (!asset.downloadUrl) {
                      return;
                    }
                    window.open(asset.downloadUrl, "_blank", "noopener,noreferrer");
                  }}
                >
                  <Download size={14} />
                </button>
                <button
                  className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-white/20 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={!canManageBrandAssets}
                  onClick={() => {
                    void onRemoveBrandAsset({ brandAssetId: asset.id })
                      .then(() => toast.success("Brand asset removed"))
                      .catch((error) => {
                        console.error(error);
                        toast.error("Failed to remove brand asset");
                      });
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      <div className="flex flex-col gap-4">
        <h3 className="text-[16px] font-medium text-red-400">Danger Zone</h3>
        <div className="flex items-center justify-between p-4 border border-red-500/10 rounded-xl bg-red-500/[0.02]">
          <div className="flex flex-col gap-1">
            <span className="text-[14px] font-medium text-[#E8E8E8]">Delete Workspace</span>
            <span className="text-[12px] text-[#E8E8E8]/50">
              Permanently disables this workspace in the app and removes member access.
            </span>
          </div>
          <button
            onClick={handleSoftDeleteWorkspace}
            disabled={!canDeleteWorkspace || deletingWorkspace}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[13px] font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {deletingWorkspace ? "Deleting..." : "Delete Workspace"}
          </button>
        </div>
      </div>
    </div>
  );
}

function BillingSettings() {
  return (
    <div className="flex flex-col gap-8 opacity-90">
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
        <p className="text-[14px] text-[#E8E8E8] mb-2">Billing is coming soon</p>
        <p className="text-[13px] text-[#E8E8E8]/50">
          Plan, payment methods, and invoices are intentionally read-only in this phase.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[14px] font-medium text-[#E8E8E8]">Payment Method</h4>
          <button
            disabled
            className="text-[13px] text-[#E8E8E8]/35 flex items-center gap-1 transition-colors cursor-not-allowed"
          >
            <Plus size={14} /> Add new (Coming soon)
          </button>
        </div>

        <div className="flex items-center gap-4 py-4 border-b border-white/5">
          <div className="w-12 h-8 bg-[#2A2A2C] rounded border border-white/10 flex items-center justify-center shrink-0" />
          <div className="flex flex-col flex-1">
            <span className="text-[14px] font-medium text-[#E8E8E8]">No active payment method</span>
            <span className="text-[12px] text-[#E8E8E8]/50">Billing backend is not enabled yet.</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <h4 className="text-[14px] font-medium text-[#E8E8E8]">Billing History</h4>
          <button disabled className="text-[13px] text-[#E8E8E8]/35 cursor-not-allowed">
            Download all (Coming soon)
          </button>
        </div>
        <div className="text-[13px] text-[#E8E8E8]/45">No invoices available.</div>
      </div>
    </div>
  );
}
