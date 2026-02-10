import { useCallback, useMemo } from "react";
import { useConvex, useConvexAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { toast } from "sonner";
import {
  loadCreateProjectPopupModule,
  loadCreateWorkspacePopupModule,
  loadSearchPopupModule,
  loadSettingsPopupModule,
} from "../components/DashboardPopups";
import { useDashboardData } from "../useDashboardData";
import { useDashboardNavigation } from "../useDashboardNavigation";
import { useDashboardWorkspaceActions } from "../useDashboardWorkspaceActions";
import { useDashboardApiHandlers } from "./useDashboardApiHandlers";
import { useDashboardLifecycleEffects } from "./useDashboardLifecycleEffects";
import {
  asBrandAssetId,
  asStorageId,
  asUserId,
  computeFileChecksumSha256,
  omitUndefined,
  uploadFileToConvexStorage,
} from "../lib/uploadHelpers";

export function useDashboardDataLayer() {
  const { user, signOut } = useAuth();
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();

  const navigation = useDashboardNavigation({
    preloadSearchPopup: () => {
      void loadSearchPopupModule();
    },
    preloadCreateProjectPopup: () => {
      void loadCreateProjectPopupModule();
    },
    preloadCreateWorkspacePopup: () => {
      void loadCreateWorkspacePopupModule();
    },
    preloadSettingsPopup: () => {
      void loadSettingsPopupModule();
    },
  });

  const apiHandlers = useDashboardApiHandlers();

  const viewerFallback = useMemo(
    () => ({
      name:
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
        || user?.email
        || "Unknown user",
      email: user?.email ?? "",
      avatarUrl: user?.profilePictureUrl ?? null,
    }),
    [user?.email, user?.firstName, user?.lastName, user?.profilePictureUrl],
  );

  const data = useDashboardData({
    isAuthenticated,
    activeWorkspaceSlug: navigation.activeWorkspaceSlug,
    setActiveWorkspaceSlug: navigation.setActiveWorkspaceSlug,
    isSettingsOpen: navigation.isSettingsOpen,
    isSearchOpen: navigation.isSearchOpen,
    currentView: navigation.currentView,
    viewerFallback,
    setIsSidebarOpen: navigation.setIsSidebarOpen,
    setPendingHighlight: navigation.setPendingHighlight,
    navigateView: navigation.navigateView,
  });

  const canCreateWorkspace = data.viewerIdentity.role === "owner";

  const handleSwitchWorkspace = useCallback(
    (workspaceSlug: string) => {
      navigation.setActiveWorkspaceSlug(workspaceSlug);
      navigation.navigateView("tasks");
    },
    [navigation],
  );

  const handleCreateWorkspace = useCallback(() => {
    if (!canCreateWorkspace) {
      toast.error("Only workspace owners can create workspaces");
      return;
    }
    navigation.openCreateWorkspace();
  }, [canCreateWorkspace, navigation]);

  const workspaceActions = useDashboardWorkspaceActions({
    canCreateWorkspace,
    resolvedWorkspaceSlug: data.resolvedWorkspaceSlug,
    setActiveWorkspaceSlug: navigation.setActiveWorkspaceSlug,
    navigateToPath: (path) => navigation.navigate(path),
    navigateView: navigation.navigateView,
    closeCreateWorkspace: navigation.closeCreateWorkspace,
    createWorkspaceMutation: apiHandlers.createWorkspaceMutation,
    reconcileWorkspaceInvitationsAction: apiHandlers.reconcileWorkspaceInvitationsAction,
    reconcileWorkspaceOrganizationMembershipsAction: apiHandlers.reconcileWorkspaceOrganizationMembershipsAction,
    updateAccountProfileAction: apiHandlers.updateAccountProfileAction,
    generateAvatarUploadUrlMutation: apiHandlers.generateAvatarUploadUrlMutation,
    finalizeAvatarUploadMutation: apiHandlers.finalizeAvatarUploadMutation,
    removeAvatarMutation: apiHandlers.removeAvatarMutation,
    saveNotificationPreferencesMutation: apiHandlers.saveNotificationPreferencesMutation,
    updateWorkspaceGeneralMutation: apiHandlers.updateWorkspaceGeneralMutation,
    generateWorkspaceLogoUploadUrlMutation: apiHandlers.generateWorkspaceLogoUploadUrlMutation,
    finalizeWorkspaceLogoUploadMutation: apiHandlers.finalizeWorkspaceLogoUploadMutation,
    inviteWorkspaceMemberAction: apiHandlers.inviteWorkspaceMemberAction,
    resendWorkspaceInvitationAction: apiHandlers.resendWorkspaceInvitationAction,
    revokeWorkspaceInvitationAction: apiHandlers.revokeWorkspaceInvitationAction,
    changeWorkspaceMemberRoleAction: apiHandlers.changeWorkspaceMemberRoleAction,
    removeWorkspaceMemberAction: apiHandlers.removeWorkspaceMemberAction,
    generateBrandAssetUploadUrlMutation: apiHandlers.generateBrandAssetUploadUrlMutation,
    finalizeBrandAssetUploadMutation: apiHandlers.finalizeBrandAssetUploadMutation,
    removeBrandAssetMutation: apiHandlers.removeBrandAssetMutation,
    softDeleteWorkspaceMutation: apiHandlers.softDeleteWorkspaceMutation,
    computeFileChecksumSha256,
    uploadFileToConvexStorage,
    asStorageId,
    asUserId,
    asBrandAssetId,
    omitUndefined,
  });

  useDashboardLifecycleEffects({
    snapshot: data.snapshot,
    ensureDefaultWorkspace: apiHandlers.ensureDefaultWorkspaceAction,
    setActiveWorkspaceSlug: navigation.setActiveWorkspaceSlug,
    preloadSearchPopupModule: loadSearchPopupModule,
    openSearch: navigation.openSearch,
    locationPathname: navigation.location.pathname,
    projects: data.projects,
    navigateToPath: (path, replace = false) => navigation.navigate(path, { replace }),
    resolvedWorkspaceSlug: data.resolvedWorkspaceSlug,
    companySettings: data.companySettings,
    ensureOrganizationLinkAction: apiHandlers.ensureOrganizationLinkAction,
    runWorkspaceSettingsReconciliation: workspaceActions.runWorkspaceSettingsReconciliation,
  });

  return {
    user,
    signOut,
    convex,
    navigation,
    apiHandlers,
    viewerFallback,
    data,
    canCreateWorkspace,
    handleSwitchWorkspace,
    handleCreateWorkspace,
    workspaceActions,
  };
}

export type DashboardDataLayer = ReturnType<typeof useDashboardDataLayer>;
