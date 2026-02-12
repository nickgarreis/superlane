import { useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import { reportUiError } from "../lib/errors";
import type { AppView } from "../lib/routing";
import { prepareUpload } from "./lib/uploadPipeline";
import { useWorkspaceMembershipActions } from "./useWorkspaceMembershipActions";
import type { DashboardActionHandler, DashboardMutationHandler } from "./types";
type CreateWorkspacePayload = { name: string; logoFile?: File | null };
type UseDashboardWorkspaceActionsArgs = {
  canCreateWorkspace: boolean;
  resolvedWorkspaceSlug: string | null;
  setActiveWorkspaceSlug: (slug: string | null) => void;
  navigateToPath: (path: string) => void;
  navigateView: (view: AppView) => void;
  closeCreateWorkspace: () => void;
  createWorkspaceMutation: DashboardActionHandler<typeof api.workspaces.create>;
  reconcileWorkspaceInvitationsAction: DashboardActionHandler<
    typeof api.settings.reconcileWorkspaceInvitations
  >;
  reconcileWorkspaceOrganizationMembershipsAction: DashboardActionHandler<
    typeof api.organizationSync.reconcileWorkspaceOrganizationMemberships
  >;
  requestPasswordResetAction: DashboardActionHandler<
    typeof api.auth.requestPasswordReset
  >;
  updateAccountProfileAction: DashboardActionHandler<
    typeof api.settings.updateAccountProfile
  >;
  generateAvatarUploadUrlMutation: DashboardMutationHandler<
    typeof api.settings.generateAvatarUploadUrl
  >;
  finalizeAvatarUploadMutation: DashboardMutationHandler<
    typeof api.settings.finalizeAvatarUpload
  >;
  removeAvatarMutation: DashboardMutationHandler<
    typeof api.settings.removeAvatar
  >;
  saveNotificationPreferencesMutation: DashboardMutationHandler<
    typeof api.settings.saveNotificationPreferences
  >;
  updateWorkspaceGeneralMutation: DashboardMutationHandler<
    typeof api.settings.updateWorkspaceGeneral
  >;
  generateWorkspaceLogoUploadUrlMutation: DashboardMutationHandler<
    typeof api.settings.generateWorkspaceLogoUploadUrl
  >;
  finalizeWorkspaceLogoUploadMutation: DashboardMutationHandler<
    typeof api.settings.finalizeWorkspaceLogoUpload
  >;
  inviteWorkspaceMemberAction: DashboardActionHandler<
    typeof api.settings.inviteWorkspaceMember
  >;
  resendWorkspaceInvitationAction: DashboardActionHandler<
    typeof api.settings.resendWorkspaceInvitation
  >;
  revokeWorkspaceInvitationAction: DashboardActionHandler<
    typeof api.settings.revokeWorkspaceInvitation
  >;
  changeWorkspaceMemberRoleAction: DashboardActionHandler<
    typeof api.settings.changeWorkspaceMemberRole
  >;
  removeWorkspaceMemberAction: DashboardActionHandler<
    typeof api.settings.removeWorkspaceMember
  >;
  generateBrandAssetUploadUrlMutation: DashboardMutationHandler<
    typeof api.settings.generateBrandAssetUploadUrl
  >;
  finalizeBrandAssetUploadMutation: DashboardMutationHandler<
    typeof api.settings.finalizeBrandAssetUpload
  >;
  removeBrandAssetMutation: DashboardMutationHandler<
    typeof api.settings.removeBrandAsset
  >;
  softDeleteWorkspaceMutation: DashboardMutationHandler<
    typeof api.settings.softDeleteWorkspace
  >;
  getBrandAssetDownloadUrlQuery: (
    workspaceSlug: string,
    brandAssetId: string,
  ) => Promise<string | null>;
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
  requestPasswordResetAction,
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
  getBrandAssetDownloadUrlQuery,
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
          reportUiError(
            "workspace.settings.reconciliation",
            settlement.reason,
            {
              showToast: false,
              details: { action: actionLabels[index], workspaceSlug },
            },
          );
        }
      });
    },
    [
      reconcileWorkspaceInvitationsAction,
      reconcileWorkspaceOrganizationMembershipsAction,
    ],
  );
  const handleSaveAccountSettings = useCallback(
    async (payload: { firstName: string; lastName: string; email: string }) => {
      await updateAccountProfileAction(payload);
    },
    [updateAccountProfileAction],
  );
  const handleRequestPasswordReset = useCallback(async () => {
    await requestPasswordResetAction({
      source: "settings",
    });
  }, [requestPasswordResetAction]);
  const handleUploadAccountAvatar = useCallback(
    async (file: File) => {
      const { checksumSha256, uploadUrl } = await prepareUpload(
        file,
        "",
        () => generateAvatarUploadUrlMutation({}),
        computeFileChecksumSha256,
      );
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
      events: {
        eventNotifications: boolean;
        teamActivities: boolean;
        productUpdates: boolean;
      };
    }) => {
      await saveNotificationPreferencesMutation(payload);
    },
    [saveNotificationPreferencesMutation],
  );
  const uploadWorkspaceLogoForSlug = useCallback(
    async (workspaceSlug: string, file: File) => {
      const { checksumSha256, uploadUrl } = await prepareUpload(
        file,
        workspaceSlug,
        (slug) =>
          generateWorkspaceLogoUploadUrlMutation({ workspaceSlug: slug }),
        computeFileChecksumSha256,
      );
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
            await uploadWorkspaceLogoForSlug(
              createdWorkspace.slug,
              payload.logoFile,
            );
          } catch (logoError) {
            reportUiError("workspace.create.logoUpload", logoError, {
              showToast: false,
              details: { workspaceSlug: createdWorkspace.slug },
            });
            toast.error("Workspace created, but logo upload failed");
          }
        }
        setActiveWorkspaceSlug(createdWorkspace.slug);
        navigateView("tasks");
        closeCreateWorkspace();
        toast.success("Workspace created");
      } catch (error) {
        reportUiError("workspace.create", error, { showToast: false });
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
    async (payload: {
      name: string;
      logo?: string;
      logoColor?: string;
      logoText?: string;
    }) => {
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
  const {
    handleInviteWorkspaceMember,
    handleChangeWorkspaceMemberRole,
    handleRemoveWorkspaceMember,
    handleResendWorkspaceInvitation,
    handleRevokeWorkspaceInvitation,
  } = useWorkspaceMembershipActions({
    resolvedWorkspaceSlug,
    asUserId,
    runWorkspaceSettingsReconciliation,
    inviteWorkspaceMemberAction,
    resendWorkspaceInvitationAction,
    revokeWorkspaceInvitationAction,
    changeWorkspaceMemberRoleAction,
    removeWorkspaceMemberAction,
  });
  const handleUploadWorkspaceBrandAsset = useCallback(
    async (file: File) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      const { checksumSha256, uploadUrl } = await prepareUpload(
        file,
        resolvedWorkspaceSlug,
        (slug) => generateBrandAssetUploadUrlMutation({ workspaceSlug: slug }),
        computeFileChecksumSha256,
      );
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
  const handleGetWorkspaceBrandAssetDownloadUrl = useCallback(
    async (payload: { brandAssetId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      return getBrandAssetDownloadUrlQuery(
        resolvedWorkspaceSlug,
        payload.brandAssetId,
      );
    },
    [getBrandAssetDownloadUrlQuery, resolvedWorkspaceSlug],
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
      reportUiError("workspace.softDelete", error, {
        showToast: false,
        details: { workspaceSlug: resolvedWorkspaceSlug },
      });
      throw error;
    }
  }, [
    navigateToPath,
    resolvedWorkspaceSlug,
    setActiveWorkspaceSlug,
    softDeleteWorkspaceMutation,
  ]);
  return {
    runWorkspaceSettingsReconciliation,
    handleSaveAccountSettings,
    handleRequestPasswordReset,
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
    handleGetWorkspaceBrandAssetDownloadUrl,
    handleSoftDeleteWorkspace,
  };
};
