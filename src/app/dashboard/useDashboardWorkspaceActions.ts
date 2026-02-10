import { useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import type { AppView } from "../lib/routing";
import type {
  DashboardActionHandler,
  DashboardMutationHandler,
} from "./types";

type CreateWorkspacePayload = {
  name: string;
  logoFile?: File | null;
};

type UseDashboardWorkspaceActionsArgs = {
  canCreateWorkspace: boolean;
  resolvedWorkspaceSlug: string | null;
  setActiveWorkspaceSlug: (slug: string | null) => void;
  navigateToPath: (path: string) => void;
  navigateView: (view: AppView) => void;
  closeCreateWorkspace: () => void;
  createWorkspaceMutation: DashboardActionHandler<typeof api.workspaces.create>;
  reconcileWorkspaceInvitationsAction: DashboardActionHandler<typeof api.settings.reconcileWorkspaceInvitations>;
  reconcileWorkspaceOrganizationMembershipsAction: DashboardActionHandler<typeof api.organizationSync.reconcileWorkspaceOrganizationMemberships>;
  updateAccountProfileAction: DashboardActionHandler<typeof api.settings.updateAccountProfile>;
  generateAvatarUploadUrlMutation: DashboardMutationHandler<typeof api.settings.generateAvatarUploadUrl>;
  finalizeAvatarUploadMutation: DashboardMutationHandler<typeof api.settings.finalizeAvatarUpload>;
  removeAvatarMutation: DashboardMutationHandler<typeof api.settings.removeAvatar>;
  saveNotificationPreferencesMutation: DashboardMutationHandler<typeof api.settings.saveNotificationPreferences>;
  updateWorkspaceGeneralMutation: DashboardMutationHandler<typeof api.settings.updateWorkspaceGeneral>;
  generateWorkspaceLogoUploadUrlMutation: DashboardMutationHandler<typeof api.settings.generateWorkspaceLogoUploadUrl>;
  finalizeWorkspaceLogoUploadMutation: DashboardMutationHandler<typeof api.settings.finalizeWorkspaceLogoUpload>;
  inviteWorkspaceMemberAction: DashboardActionHandler<typeof api.settings.inviteWorkspaceMember>;
  resendWorkspaceInvitationAction: DashboardActionHandler<typeof api.settings.resendWorkspaceInvitation>;
  revokeWorkspaceInvitationAction: DashboardActionHandler<typeof api.settings.revokeWorkspaceInvitation>;
  changeWorkspaceMemberRoleAction: DashboardActionHandler<typeof api.settings.changeWorkspaceMemberRole>;
  removeWorkspaceMemberAction: DashboardActionHandler<typeof api.settings.removeWorkspaceMember>;
  generateBrandAssetUploadUrlMutation: DashboardMutationHandler<typeof api.settings.generateBrandAssetUploadUrl>;
  finalizeBrandAssetUploadMutation: DashboardMutationHandler<typeof api.settings.finalizeBrandAssetUpload>;
  removeBrandAssetMutation: DashboardMutationHandler<typeof api.settings.removeBrandAsset>;
  softDeleteWorkspaceMutation: DashboardMutationHandler<typeof api.settings.softDeleteWorkspace>;
  computeFileChecksumSha256: (file: File) => Promise<string>;
  uploadFileToConvexStorage: (uploadUrl: string, file: File) => Promise<string>;
  asStorageId: (value: string) => Id<"_storage">;
  asUserId: (value: string) => Id<"users">;
  asBrandAssetId: (value: string) => Id<"workspaceBrandAssets">;
  omitUndefined: <T extends Record<string, unknown>>(value: T) => T;
};

export const useDashboardWorkspaceActions = ({
  canCreateWorkspace,
  resolvedWorkspaceSlug,
  setActiveWorkspaceSlug,
  navigateToPath,
  navigateView,
  closeCreateWorkspace,
  createWorkspaceMutation,
  reconcileWorkspaceInvitationsAction,
  reconcileWorkspaceOrganizationMembershipsAction,
  updateAccountProfileAction,
  generateAvatarUploadUrlMutation,
  finalizeAvatarUploadMutation,
  removeAvatarMutation,
  saveNotificationPreferencesMutation,
  updateWorkspaceGeneralMutation,
  generateWorkspaceLogoUploadUrlMutation,
  finalizeWorkspaceLogoUploadMutation,
  inviteWorkspaceMemberAction,
  resendWorkspaceInvitationAction,
  revokeWorkspaceInvitationAction,
  changeWorkspaceMemberRoleAction,
  removeWorkspaceMemberAction,
  generateBrandAssetUploadUrlMutation,
  finalizeBrandAssetUploadMutation,
  removeBrandAssetMutation,
  softDeleteWorkspaceMutation,
  computeFileChecksumSha256,
  uploadFileToConvexStorage,
  asStorageId,
  asUserId,
  asBrandAssetId,
  omitUndefined,
}: UseDashboardWorkspaceActionsArgs) => {
  const runWorkspaceSettingsReconciliation = useCallback(
    async (workspaceSlug: string) => {
      const settlements = await Promise.allSettled([
        reconcileWorkspaceInvitationsAction({ workspaceSlug }),
        reconcileWorkspaceOrganizationMembershipsAction({ workspaceSlug }),
      ]);

      const actionLabels = [
        "reconcileWorkspaceInvitationsAction",
        "reconcileWorkspaceOrganizationMembershipsAction",
      ] as const;

      settlements.forEach((settlement, index) => {
        if (settlement.status === "rejected") {
          console.error(
            `[workspace settings reconciliation] ${actionLabels[index]} failed`,
            settlement.reason,
          );
        }
      });
    },
    [reconcileWorkspaceInvitationsAction, reconcileWorkspaceOrganizationMembershipsAction],
  );

  const handleSaveAccountSettings = useCallback(
    async (payload: { firstName: string; lastName: string; email: string }) => {
      await updateAccountProfileAction(payload);
    },
    [updateAccountProfileAction],
  );

  const handleUploadAccountAvatar = useCallback(
    async (file: File) => {
      const checksumSha256 = await computeFileChecksumSha256(file);
      const { uploadUrl } = await generateAvatarUploadUrlMutation({});
      const storageId = await uploadFileToConvexStorage(uploadUrl, file);

      await finalizeAvatarUploadMutation({
        storageId: asStorageId(storageId),
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        checksumSha256,
      });
    },
    [
      asStorageId,
      computeFileChecksumSha256,
      finalizeAvatarUploadMutation,
      generateAvatarUploadUrlMutation,
      uploadFileToConvexStorage,
    ],
  );

  const handleRemoveAccountAvatar = useCallback(async () => {
    await removeAvatarMutation({});
  }, [removeAvatarMutation]);

  const handleSaveSettingsNotifications = useCallback(
    async (payload: {
      channels: { email: boolean; desktop: boolean };
      events: { productUpdates: boolean; teamActivity: boolean };
    }) => {
      await saveNotificationPreferencesMutation(payload);
    },
    [saveNotificationPreferencesMutation],
  );

  const uploadWorkspaceLogoForSlug = useCallback(
    async (workspaceSlug: string, file: File) => {
      const checksumSha256 = await computeFileChecksumSha256(file);
      const { uploadUrl } = await generateWorkspaceLogoUploadUrlMutation({
        workspaceSlug,
      });
      const storageId = await uploadFileToConvexStorage(uploadUrl, file);

      await finalizeWorkspaceLogoUploadMutation({
        workspaceSlug,
        storageId: asStorageId(storageId),
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        checksumSha256,
      });
    },
    [
      asStorageId,
      computeFileChecksumSha256,
      finalizeWorkspaceLogoUploadMutation,
      generateWorkspaceLogoUploadUrlMutation,
      uploadFileToConvexStorage,
    ],
  );

  const handleCreateWorkspaceSubmit = useCallback(
    async (payload: CreateWorkspacePayload) => {
      if (!canCreateWorkspace) {
        throw new Error("Only workspace owners can create workspaces");
      }

      try {
        const createdWorkspace = await createWorkspaceMutation({
          name: payload.name,
        });

        if (payload.logoFile) {
          try {
            await uploadWorkspaceLogoForSlug(createdWorkspace.slug, payload.logoFile);
          } catch (logoError) {
            console.error(logoError);
            toast.error("Workspace created, but logo upload failed");
          }
        }

        setActiveWorkspaceSlug(createdWorkspace.slug);
        navigateView("tasks");
        closeCreateWorkspace();
        toast.success("Workspace created");
      } catch (error) {
        console.error(error);
        toast.error("Failed to create workspace");
        throw error;
      }
    },
    [
      canCreateWorkspace,
      closeCreateWorkspace,
      createWorkspaceMutation,
      navigateView,
      setActiveWorkspaceSlug,
      uploadWorkspaceLogoForSlug,
    ],
  );

  const handleUpdateWorkspaceGeneral = useCallback(
    async (payload: { name: string; logo?: string; logoColor?: string; logoText?: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }

      await updateWorkspaceGeneralMutation(
        omitUndefined({
          workspaceSlug: resolvedWorkspaceSlug,
          name: payload.name,
          logo: payload.logo,
          logoColor: payload.logoColor,
          logoText: payload.logoText,
        }),
      );
    },
    [omitUndefined, resolvedWorkspaceSlug, updateWorkspaceGeneralMutation],
  );

  const handleUploadWorkspaceLogo = useCallback(
    async (file: File) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await uploadWorkspaceLogoForSlug(resolvedWorkspaceSlug, file);
    },
    [resolvedWorkspaceSlug, uploadWorkspaceLogoForSlug],
  );

  const handleInviteWorkspaceMember = useCallback(
    async (payload: { email: string; role: "admin" | "member" }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await inviteWorkspaceMemberAction({
        workspaceSlug: resolvedWorkspaceSlug,
        email: payload.email,
        role: payload.role,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [inviteWorkspaceMemberAction, resolvedWorkspaceSlug, runWorkspaceSettingsReconciliation],
  );

  const handleChangeWorkspaceMemberRole = useCallback(
    async (payload: { userId: string; role: "admin" | "member" }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await changeWorkspaceMemberRoleAction({
        workspaceSlug: resolvedWorkspaceSlug,
        targetUserId: asUserId(payload.userId),
        role: payload.role,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [
      asUserId,
      changeWorkspaceMemberRoleAction,
      resolvedWorkspaceSlug,
      runWorkspaceSettingsReconciliation,
    ],
  );

  const handleRemoveWorkspaceMember = useCallback(
    async (payload: { userId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await removeWorkspaceMemberAction({
        workspaceSlug: resolvedWorkspaceSlug,
        targetUserId: asUserId(payload.userId),
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [asUserId, removeWorkspaceMemberAction, resolvedWorkspaceSlug, runWorkspaceSettingsReconciliation],
  );

  const handleResendWorkspaceInvitation = useCallback(
    async (payload: { invitationId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await resendWorkspaceInvitationAction({
        workspaceSlug: resolvedWorkspaceSlug,
        invitationId: payload.invitationId,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [resolvedWorkspaceSlug, resendWorkspaceInvitationAction, runWorkspaceSettingsReconciliation],
  );

  const handleRevokeWorkspaceInvitation = useCallback(
    async (payload: { invitationId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await revokeWorkspaceInvitationAction({
        workspaceSlug: resolvedWorkspaceSlug,
        invitationId: payload.invitationId,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [resolvedWorkspaceSlug, revokeWorkspaceInvitationAction, runWorkspaceSettingsReconciliation],
  );

  const handleUploadWorkspaceBrandAsset = useCallback(
    async (file: File) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      const checksumSha256 = await computeFileChecksumSha256(file);
      const { uploadUrl } = await generateBrandAssetUploadUrlMutation({
        workspaceSlug: resolvedWorkspaceSlug,
      });
      const storageId = await uploadFileToConvexStorage(uploadUrl, file);

      await finalizeBrandAssetUploadMutation({
        workspaceSlug: resolvedWorkspaceSlug,
        storageId: asStorageId(storageId),
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        checksumSha256,
      });
    },
    [
      asStorageId,
      computeFileChecksumSha256,
      finalizeBrandAssetUploadMutation,
      generateBrandAssetUploadUrlMutation,
      resolvedWorkspaceSlug,
      uploadFileToConvexStorage,
    ],
  );

  const handleRemoveWorkspaceBrandAsset = useCallback(
    async (payload: { brandAssetId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await removeBrandAssetMutation({
        workspaceSlug: resolvedWorkspaceSlug,
        brandAssetId: asBrandAssetId(payload.brandAssetId),
      });
    },
    [asBrandAssetId, removeBrandAssetMutation, resolvedWorkspaceSlug],
  );

  const handleSoftDeleteWorkspace = useCallback(async () => {
    if (!resolvedWorkspaceSlug) {
      throw new Error("No active workspace");
    }

    setActiveWorkspaceSlug(null);
    try {
      await softDeleteWorkspaceMutation({
        workspaceSlug: resolvedWorkspaceSlug,
      });
      navigateToPath("/tasks");
    } catch (error) {
      setActiveWorkspaceSlug(resolvedWorkspaceSlug);
      console.error(error);
      throw error;
    }
  }, [navigateToPath, resolvedWorkspaceSlug, setActiveWorkspaceSlug, softDeleteWorkspaceMutation]);

  return {
    runWorkspaceSettingsReconciliation,
    handleSaveAccountSettings,
    handleUploadAccountAvatar,
    handleRemoveAccountAvatar,
    handleSaveSettingsNotifications,
    handleCreateWorkspaceSubmit,
    handleUpdateWorkspaceGeneral,
    handleUploadWorkspaceLogo,
    handleInviteWorkspaceMember,
    handleChangeWorkspaceMemberRole,
    handleRemoveWorkspaceMember,
    handleResendWorkspaceInvitation,
    handleRevokeWorkspaceInvitation,
    handleUploadWorkspaceBrandAsset,
    handleRemoveWorkspaceBrandAsset,
    handleSoftDeleteWorkspace,
  };
};
