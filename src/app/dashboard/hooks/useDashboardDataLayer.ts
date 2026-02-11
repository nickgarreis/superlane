import { useCallback, useMemo } from "react";
import { useConvex, useConvexAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
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
  const {
    activeWorkspaceSlug,
    setActiveWorkspaceSlug,
    isSettingsOpen,
    settingsTab,
    isSearchOpen,
    currentView,
    setIsSidebarOpen,
    setPendingHighlight,
    navigateView,
    openCreateWorkspace,
    closeCreateWorkspace,
    openSearch,
    navigate,
    location,
  } = navigation;

  const apiHandlers = useDashboardApiHandlers();
  const {
    ensureDefaultWorkspaceAction,
    createWorkspaceMutation,
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
    reconcileWorkspaceInvitationsAction,
    reconcileWorkspaceOrganizationMembershipsAction,
    ensureOrganizationLinkAction,
  } = apiHandlers;

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
    activeWorkspaceSlug,
    setActiveWorkspaceSlug,
    isSettingsOpen,
    settingsTab,
    isSearchOpen,
    currentView,
    viewerFallback,
    setIsSidebarOpen,
    setPendingHighlight,
    navigateView,
  });

  const canCreateWorkspace = data.viewerIdentity.role === "owner";

  const handleSwitchWorkspace = useCallback(
    (workspaceSlug: string) => {
      setActiveWorkspaceSlug(workspaceSlug);
      navigateView("tasks");
    },
    [navigateView, setActiveWorkspaceSlug],
  );

  const handleCreateWorkspace = useCallback(() => {
    if (!canCreateWorkspace) {
      toast.error("Only workspace owners can create workspaces");
      return;
    }
    openCreateWorkspace();
  }, [canCreateWorkspace, openCreateWorkspace]);

  const navigateToPath = useCallback((path: string) => navigate(path), [navigate]);
  const navigateToPathWithReplace = useCallback(
    (path: string, replace = false) => {
      navigate(path, { replace });
    },
    [navigate],
  );
  const getBrandAssetDownloadUrlQuery = useCallback(
    async (workspaceSlug: string, brandAssetId: string) => {
      const result = await convex.query(api.settings.getBrandAssetDownloadUrl, {
        workspaceSlug,
        brandAssetId: asBrandAssetId(brandAssetId),
      });
      if (!result) {
        return null;
      }
      return result.downloadUrl ?? null;
    },
    [convex],
  );

  const workspaceActions = useDashboardWorkspaceActions({
    canCreateWorkspace,
    resolvedWorkspaceSlug: data.resolvedWorkspaceSlug,
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
    getBrandAssetDownloadUrlQuery,
    computeFileChecksumSha256,
    uploadFileToConvexStorage,
    asStorageId,
    asUserId,
    asBrandAssetId,
    omitUndefined,
  });

  useDashboardLifecycleEffects({
    snapshot: data.snapshot,
    ensureDefaultWorkspace: ensureDefaultWorkspaceAction,
    setActiveWorkspaceSlug,
    preloadSearchPopupModule: loadSearchPopupModule,
    openSearch,
    locationPathname: location.pathname,
    projects: data.projects,
    navigateToPath: navigateToPathWithReplace,
    resolvedWorkspaceSlug: data.resolvedWorkspaceSlug,
    companySettings: data.companySummary,
    ensureOrganizationLinkAction,
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
