import { useMemo } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
export const useDashboardApiHandlers = () => {
  const ensureDefaultWorkspaceAction = useAction(
    api.workspaces.ensureDefaultWorkspace,
  );
  const createWorkspaceMutation = useAction(api.workspaces.create);
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(api.projects.update);
  const archiveProjectMutation = useMutation(api.projects.archive);
  const unarchiveProjectMutation = useMutation(api.projects.unarchive);
  const removeProjectMutation = useMutation(api.projects.remove);
  const setProjectStatusMutation = useMutation(api.projects.setStatus);
  const markApprovalSeenMutation = useMutation(api.projects.markApprovalSeen);
  const updateReviewCommentsMutation = useMutation(
    api.projects.updateReviewComments,
  );
  const replaceProjectTasksMutation = useMutation(api.tasks.replaceForProject);
  const replaceWorkspaceTasksMutation = useMutation(
    api.tasks.replaceForWorkspace,
  );
  const createTaskMutation = useMutation(api.tasks.create);
  const updateTaskMutation = useMutation(api.tasks.update);
  const removeTaskMutation = useMutation(api.tasks.remove);
  const reorderTasksMutation = useMutation(api.tasks.reorder);
  const applyTaskDiffMutation = useMutation(api.tasks.applyDiff);
  const markActivityReadMutation = useMutation(api.activities.markActivityRead);
  const dismissActivityMutation = useMutation(api.activities.dismissActivity);
  const markAllReadMutation = useMutation(api.activities.markAllRead);
  const generateUploadUrlMutation = useMutation(api.files.generateUploadUrl);
  const finalizeProjectUploadAction = useAction(
    api.files.finalizeProjectUpload,
  );
  const finalizePendingDraftAttachmentUploadAction = useAction(
    api.files.finalizePendingDraftAttachmentUpload,
  );
  const discardPendingUploadMutation = useMutation(
    api.files.discardPendingUpload,
  );
  const discardPendingUploadsForSessionMutation = useMutation(
    api.files.discardPendingUploadsForSession,
  );
  const removeProjectFileMutation = useMutation(api.files.remove);
  const generateAvatarUploadUrlMutation = useMutation(
    api.settings.generateAvatarUploadUrl,
  );
  const finalizeAvatarUploadMutation = useMutation(
    api.settings.finalizeAvatarUpload,
  );
  const removeAvatarMutation = useMutation(api.settings.removeAvatar);
  const saveNotificationPreferencesMutation = useMutation(
    api.settings.saveNotificationPreferences,
  );
  const updateWorkspaceGeneralMutation = useMutation(
    api.settings.updateWorkspaceGeneral,
  );
  const generateWorkspaceLogoUploadUrlMutation = useMutation(
    api.settings.generateWorkspaceLogoUploadUrl,
  );
  const finalizeWorkspaceLogoUploadMutation = useMutation(
    api.settings.finalizeWorkspaceLogoUpload,
  );
  const generateBrandAssetUploadUrlMutation = useMutation(
    api.settings.generateBrandAssetUploadUrl,
  );
  const finalizeBrandAssetUploadMutation = useMutation(
    api.settings.finalizeBrandAssetUpload,
  );
  const removeBrandAssetMutation = useMutation(api.settings.removeBrandAsset);
  const softDeleteWorkspaceMutation = useMutation(
    api.settings.softDeleteWorkspace,
  );
  const requestPasswordResetAction = useAction(api.auth.requestPasswordReset);
  const syncCurrentUserLinkedIdentityProvidersAction = useAction(
    api.auth.syncCurrentUserLinkedIdentityProviders,
  );
  const updateAccountProfileAction = useAction(
    api.settings.updateAccountProfile,
  );
  const inviteWorkspaceMemberAction = useAction(
    api.settings.inviteWorkspaceMember,
  );
  const resendWorkspaceInvitationAction = useAction(
    api.settings.resendWorkspaceInvitation,
  );
  const revokeWorkspaceInvitationAction = useAction(
    api.settings.revokeWorkspaceInvitation,
  );
  const changeWorkspaceMemberRoleAction = useAction(
    api.settings.changeWorkspaceMemberRole,
  );
  const removeWorkspaceMemberAction = useAction(
    api.settings.removeWorkspaceMember,
  );
  const reconcileWorkspaceInvitationsAction = useAction(
    api.settings.reconcileWorkspaceInvitations,
  );
  const reconcileWorkspaceOrganizationMembershipsAction = useAction(
    api.organizationSync.reconcileWorkspaceOrganizationMemberships,
  );
  const ensureOrganizationLinkAction = useAction(
    api.workspaces.ensureOrganizationLink,
  );
  return useMemo(
    () => ({
      ensureDefaultWorkspaceAction,
      createWorkspaceMutation,
      createProjectMutation,
      updateProjectMutation,
      archiveProjectMutation,
      unarchiveProjectMutation,
      removeProjectMutation,
      setProjectStatusMutation,
      markApprovalSeenMutation,
      updateReviewCommentsMutation,
      replaceProjectTasksMutation,
      replaceWorkspaceTasksMutation,
      createTaskMutation,
      updateTaskMutation,
      removeTaskMutation,
      reorderTasksMutation,
      applyTaskDiffMutation,
      markActivityReadMutation,
      dismissActivityMutation,
      markAllReadMutation,
      generateUploadUrlMutation,
      finalizeProjectUploadAction,
      finalizePendingDraftAttachmentUploadAction,
      discardPendingUploadMutation,
      discardPendingUploadsForSessionMutation,
      removeProjectFileMutation,
      generateAvatarUploadUrlMutation,
      finalizeAvatarUploadMutation,
      removeAvatarMutation,
      saveNotificationPreferencesMutation,
      updateWorkspaceGeneralMutation,
      generateWorkspaceLogoUploadUrlMutation,
      finalizeWorkspaceLogoUploadMutation,
      generateBrandAssetUploadUrlMutation,
      finalizeBrandAssetUploadMutation,
      removeBrandAssetMutation,
      softDeleteWorkspaceMutation,
      requestPasswordResetAction,
      syncCurrentUserLinkedIdentityProvidersAction,
      updateAccountProfileAction,
      inviteWorkspaceMemberAction,
      resendWorkspaceInvitationAction,
      revokeWorkspaceInvitationAction,
      changeWorkspaceMemberRoleAction,
      removeWorkspaceMemberAction,
      reconcileWorkspaceInvitationsAction,
      reconcileWorkspaceOrganizationMembershipsAction,
      ensureOrganizationLinkAction,
    }),
    [
      archiveProjectMutation,
      changeWorkspaceMemberRoleAction,
      createProjectMutation,
      createTaskMutation,
      applyTaskDiffMutation,
      markActivityReadMutation,
      dismissActivityMutation,
      markAllReadMutation,
      createWorkspaceMutation,
      discardPendingUploadMutation,
      discardPendingUploadsForSessionMutation,
      ensureDefaultWorkspaceAction,
      ensureOrganizationLinkAction,
      finalizeAvatarUploadMutation,
      finalizeBrandAssetUploadMutation,
      finalizePendingDraftAttachmentUploadAction,
      finalizeProjectUploadAction,
      finalizeWorkspaceLogoUploadMutation,
      generateAvatarUploadUrlMutation,
      generateBrandAssetUploadUrlMutation,
      generateUploadUrlMutation,
      generateWorkspaceLogoUploadUrlMutation,
      inviteWorkspaceMemberAction,
      reconcileWorkspaceInvitationsAction,
      reconcileWorkspaceOrganizationMembershipsAction,
      removeAvatarMutation,
      removeBrandAssetMutation,
      removeProjectFileMutation,
      removeProjectMutation,
      removeTaskMutation,
      removeWorkspaceMemberAction,
      reorderTasksMutation,
      replaceProjectTasksMutation,
      replaceWorkspaceTasksMutation,
      resendWorkspaceInvitationAction,
      revokeWorkspaceInvitationAction,
      saveNotificationPreferencesMutation,
      setProjectStatusMutation,
      softDeleteWorkspaceMutation,
      requestPasswordResetAction,
      syncCurrentUserLinkedIdentityProvidersAction,
      unarchiveProjectMutation,
      updateAccountProfileAction,
      markApprovalSeenMutation,
      updateProjectMutation,
      updateTaskMutation,
      updateReviewCommentsMutation,
      updateWorkspaceGeneralMutation,
    ],
  );
};
