import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import type { Workspace } from "../../types";
import type { SettingsFocusTarget } from "../../dashboard/types";
import { reportUiError } from "../../lib/errors";
import type { CompanySettingsData } from "./types";
import { CompanyBrandAssetsSection } from "./CompanyBrandAssetsSection";
import { CompanyMembersSection } from "./CompanyMembersSection";
import { DeniedAction } from "../permissions/DeniedAction";
import { getWorkspaceGeneralDeniedReason } from "../../lib/permissionRules";
import {
  UNDERLINE_INPUT_CLASS,
} from "../ui/controlChrome";
type CompanyTabProps = {
  activeWorkspace?: Workspace;
  company: CompanySettingsData | null;
  loading: boolean;
  focusTarget?: SettingsFocusTarget | null;
  onUpdateWorkspaceGeneral: (payload: {
    name: string;
    logo?: string;
    logoColor?: string;
    logoText?: string;
  }) => Promise<void>;
  onUploadWorkspaceLogo: (file: File) => Promise<void>;
  onInviteMember: (payload: {
    email: string;
    role: "admin" | "member";
  }) => Promise<void>;
  onChangeMemberRole: (payload: {
    userId: string;
    role: "admin" | "member";
  }) => Promise<void>;
  onRemoveMember: (payload: { userId: string }) => Promise<void>;
  onResendInvitation: (payload: { invitationId: string }) => Promise<void>;
  onRevokeInvitation: (payload: { invitationId: string }) => Promise<void>;
  onUploadBrandAsset: (file: File) => Promise<void>;
  onRemoveBrandAsset: (payload: { brandAssetId: string }) => Promise<void>;
  onGetBrandAssetDownloadUrl: (payload: {
    brandAssetId: string;
  }) => Promise<string | null>;
};
export function CompanyTab({
  activeWorkspace,
  company,
  loading,
  focusTarget = null,
  onUpdateWorkspaceGeneral,
  onUploadWorkspaceLogo,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onResendInvitation,
  onRevokeInvitation,
  onUploadBrandAsset,
  onRemoveBrandAsset,
  onGetBrandAssetDownloadUrl,
}: CompanyTabProps) {
  const workspaceName =
    company?.workspace?.name ?? activeWorkspace?.name ?? "Workspace";
  const [nameDraft, setNameDraft] = useState(workspaceName);
  const [logoBusy, setLogoBusy] = useState(false);
  const logoFileInputRef = React.useRef<HTMLInputElement>(null);
  const nameDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isFirstRender = useRef(true);
  const hasEditedRef = useRef(false);
  const members = company?.members ?? [];
  const pendingInvitations = company?.pendingInvitations ?? [];
  const brandAssets = company?.brandAssets ?? [];
  const viewerRole = company?.viewerRole;
  const hasOrganizationLink = company?.capability?.hasOrganizationLink ?? false;
  const canManageWorkspaceGeneral =
    company?.capability?.canManageWorkspaceGeneral ?? false;
  const canManageMembers = company?.capability?.canManageMembers ?? false;
  const canManageBrandAssets =
    company?.capability?.canManageBrandAssets ?? false;
  const workspaceGeneralDeniedReason =
    getWorkspaceGeneralDeniedReason(viewerRole);
  const initials = useMemo(() => {
    if (company?.workspace?.logoText) {
      return company.workspace.logoText;
    }
    return workspaceName.charAt(0).toUpperCase() || "W";
  }, [company?.workspace?.logoText, workspaceName]);
  const saveWorkspaceName = useCallback(
    async (name: string) => {
      if (!company) {
        return;
      }
      const trimmed = name.trim();
      if (!trimmed || trimmed === company.workspace?.name) {
        return;
      }
      try {
        await onUpdateWorkspaceGeneral({ name: trimmed });
      } catch (error) {
        reportUiError("settings.company.updateName", error, {
          showToast: false,
        });
        toast.error("Failed to update workspace name");
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
    if (!canManageWorkspaceGeneral || !hasEditedRef.current) {
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
  }, [canManageWorkspaceGeneral, nameDraft]);
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
      reportUiError("settings.company.uploadLogo", error, { showToast: false });
      toast.error("Failed to update workspace logo");
    } finally {
      setLogoBusy(false);
      if (logoFileInputRef.current) {
        logoFileInputRef.current.value = "";
      }
    }
  };
  if (loading) {
    return (
      <div className="txt-tone-subtle txt-role-body-lg">
        Loading company settings...
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <input
            type="file"
            ref={logoFileInputRef}
            className="hidden"
            accept="image/png, image/jpeg, image/gif, image/webp"
            onChange={handleLogoFile}
          />
          <DeniedAction
            denied={!canManageWorkspaceGeneral}
            reason={workspaceGeneralDeniedReason}
            tooltipAlign="left"
          >
            <div
              className="w-[80px] h-[80px] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-inner shrink-0 border border-border-soft bg-brand-avatar overflow-hidden group relative cursor-pointer"
              style={
                company?.workspace?.logoColor
                  ? { backgroundColor: company.workspace.logoColor }
                  : undefined
              }
              onClick={() =>
                !logoBusy &&
                canManageWorkspaceGeneral &&
                logoFileInputRef.current?.click()
              }
            >
              {company?.workspace?.logo ? (
                <img
                  src={company.workspace.logo}
                  alt={company.workspace?.name ?? workspaceName}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
              {canManageWorkspaceGeneral && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity rounded-2xl">
                  <Camera size={20} className="text-white" />
                </div>
              )}
            </div>
          </DeniedAction>
          <div className="flex flex-col gap-2 flex-1 max-w-[460px] min-w-0">
            <DeniedAction
              denied={!canManageWorkspaceGeneral}
              reason={workspaceGeneralDeniedReason}
              tooltipAlign="left"
            >
              <input
                type="text"
                value={nameDraft}
                maxLength={100}
                disabled={!canManageWorkspaceGeneral}
                onChange={(event) => {
                  if (!canManageWorkspaceGeneral) {
                    return;
                  }
                  hasEditedRef.current = true;
                  setNameDraft(event.target.value);
                }}
                className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
              />
            </DeniedAction>
          </div>
        </div>
      </div>
      <CompanyMembersSection
        members={members}
        pendingInvitations={pendingInvitations}
        focusTarget={focusTarget}
        hasOrganizationLink={hasOrganizationLink}
        viewerRole={viewerRole}
        canManageMembers={canManageMembers}
        onInviteMember={onInviteMember}
        onChangeMemberRole={onChangeMemberRole}
        onRemoveMember={onRemoveMember}
        onResendInvitation={onResendInvitation}
        onRevokeInvitation={onRevokeInvitation}
      />
      <CompanyBrandAssetsSection
        brandAssets={brandAssets}
        focusTarget={focusTarget}
        canManageBrandAssets={canManageBrandAssets}
        viewerRole={viewerRole}
        onUploadBrandAsset={onUploadBrandAsset}
        onRemoveBrandAsset={onRemoveBrandAsset}
        onGetBrandAssetDownloadUrl={onGetBrandAssetDownloadUrl}
      />
    </div>
  );
}
