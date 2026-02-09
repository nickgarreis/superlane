import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Camera, Check } from "lucide-react";
import { toast } from "sonner";
import type { Workspace } from "../../types";
import type {
  CompanySettingsData,
} from "./types";
import { CompanyBrandAssetsSection } from "./CompanyBrandAssetsSection";
import { CompanyMembersSection } from "./CompanyMembersSection";

type CompanyTabProps = {
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
};

export function CompanyTab({
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
}: CompanyTabProps) {
  const workspaceName = company?.workspace.name ?? activeWorkspace?.name ?? "Workspace";
  const [nameDraft, setNameDraft] = useState(workspaceName);
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [logoBusy, setLogoBusy] = useState(false);
  const [nameSaveStatus, setNameSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const hasEditedRef = useRef(false);

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

  const saveWorkspaceNameRef = useRef(saveWorkspaceName);
  useEffect(() => {
    saveWorkspaceNameRef.current = saveWorkspaceName;
  }, [saveWorkspaceName]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!canManageMembers || !hasEditedRef.current) {
      return;
    }

    if (nameDebounceRef.current) {
      clearTimeout(nameDebounceRef.current);
    }

    nameDebounceRef.current = setTimeout(() => {
      void saveWorkspaceNameRef.current(nameDraft);
    }, 800);

    return () => {
      if (nameDebounceRef.current) {
        clearTimeout(nameDebounceRef.current);
      }
    };
  }, [canManageMembers, nameDraft]);

  useEffect(() => {
    if (nameDebounceRef.current) {
      clearTimeout(nameDebounceRef.current);
    }
    hasEditedRef.current = false;
    isFirstRender.current = true;
    setNameDraft(workspaceName);
  }, [workspaceName]);

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
              maxLength={100}
              disabled={!canManageMembers}
              onChange={(event) => {
                if (!canManageMembers) {
                  return;
                }
                hasEditedRef.current = true;
                setNameDraft(event.target.value);
              }}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => logoFileInputRef.current?.click()}
            disabled={!canManageMembers || logoBusy}
            className="cursor-pointer px-4 py-2 bg-[#E8E8E8] text-bg-base rounded-full text-[13px] font-medium hover:bg-white transition-colors disabled:opacity-50"
          >
            Upload logo
          </button>
          <button
            onClick={handleRemoveLogo}
            disabled={!company?.workspace.logo || !canManageMembers || logoBusy}
            className="cursor-pointer px-4 py-2 bg-white/5 text-[#E8E8E8] border border-white/10 rounded-full text-[13px] font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Remove logo
          </button>
        </div>
      </div>

      <div className="w-full h-px bg-white/5" />

      <CompanyMembersSection
        members={members}
        pendingInvitations={pendingInvitations}
        hasOrganizationLink={hasOrganizationLink}
        canManageMembers={canManageMembers}
        onInviteMember={onInviteMember}
        onChangeMemberRole={onChangeMemberRole}
        onRemoveMember={onRemoveMember}
        onResendInvitation={onResendInvitation}
        onRevokeInvitation={onRevokeInvitation}
      />

      <div className="w-full h-px bg-white/5" />

      <CompanyBrandAssetsSection
        brandAssets={brandAssets}
        canManageBrandAssets={canManageBrandAssets}
        onUploadBrandAsset={onUploadBrandAsset}
        onRemoveBrandAsset={onRemoveBrandAsset}
      />

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
