import { useCallback, useEffect, useMemo, useRef } from "react";
import { useConvex, useConvexAuth } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { reportUiError } from "../../lib/errors";
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
  asActivityEventId,
  asBrandAssetId,
  asStorageId,
  asUserId,
  computeFileChecksumSha256,
  omitUndefined,
  uploadFileToConvexStorage,
} from "../lib/uploadHelpers";
export function useDashboardDataLayer() {
  const { user, signOut, authenticationMethod } = useAuth();
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
    completedProjectDetailId,
    setIsSidebarOpen,
    setPendingHighlight,
    navigateView,
    openCreateWorkspace,
    closeCreateWorkspace,
    openInbox,
    openSearch,
    openCreateProject,
    handleOpenSettings,
    navigate,
    location,
  } = navigation;
  const apiHandlers = useDashboardApiHandlers();
  const {
    ensureDefaultWorkspaceAction,
    createWorkspaceMutation,
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
    markActivityReadMutation,
    dismissActivityMutation,
    markAllReadMutation,
    generateBrandAssetUploadUrlMutation,
    finalizeBrandAssetUploadMutation,
    removeBrandAssetMutation,
    softDeleteWorkspaceMutation,
    reconcileWorkspaceInvitationsAction,
    reconcileWorkspaceOrganizationMembershipsAction,
    ensureOrganizationLinkAction,
    syncCurrentUserLinkedIdentityProvidersAction,
  } = apiHandlers;
  const linkedIdentitySyncSignatureRef = useRef<string | null>(null);
  const viewerFallback = useMemo(
    () => ({
      name:
        [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim() ||
        user?.email ||
        "Unknown user",
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
    completedProjectDetailId,
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
  const handleMarkInboxActivityRead = useCallback(
    async (activityId: string) => {
      if (!data.resolvedWorkspaceSlug) {
        return;
      }
      await markActivityReadMutation({
        workspaceSlug: data.resolvedWorkspaceSlug,
        activityEventId: asActivityEventId(activityId),
      });
    },
    [data.resolvedWorkspaceSlug, markActivityReadMutation],
  );
  const handleMarkAllInboxActivitiesRead = useCallback(async () => {
    if (!data.resolvedWorkspaceSlug) {
      return;
    }
    await markAllReadMutation({
      workspaceSlug: data.resolvedWorkspaceSlug,
    });
  }, [data.resolvedWorkspaceSlug, markAllReadMutation]);
  const handleDismissInboxActivity = useCallback(
    async (activityId: string) => {
      if (!data.resolvedWorkspaceSlug) {
        return;
      }
      await dismissActivityMutation({
        workspaceSlug: data.resolvedWorkspaceSlug,
        activityEventId: asActivityEventId(activityId),
      });
    },
    [data.resolvedWorkspaceSlug, dismissActivityMutation],
  );
  const navigateToPath = useCallback(
    (path: string) => {
      if (location.pathname === path) {
        return;
      }
      navigate(path);
    },
    [location.pathname, navigate],
  );
  const navigateToPathWithReplace = useCallback(
    (path: string, replace = false) => {
      if (location.pathname === path) {
        return;
      }
      navigate(path, { replace });
    },
    [location.pathname, navigate],
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
    requestPasswordResetAction,
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
  useEffect(() => {
    if (!isAuthenticated) {
      linkedIdentitySyncSignatureRef.current = null;
      return;
    }
    const signature = `${user?.email ?? "authenticated-user"}:${authenticationMethod ?? "unknown"}`;
    if (linkedIdentitySyncSignatureRef.current === signature) {
      return;
    }
    linkedIdentitySyncSignatureRef.current = signature;
    void Promise.resolve(
      syncCurrentUserLinkedIdentityProvidersAction({
        sessionAuthenticationMethod: authenticationMethod ?? undefined,
      }),
    ).catch((error) => {
      linkedIdentitySyncSignatureRef.current = null;
      reportUiError("dashboard.syncLinkedIdentityProviders", error, {
        showToast: false,
      });
    });
  }, [
    authenticationMethod,
    isAuthenticated,
    syncCurrentUserLinkedIdentityProvidersAction,
    user?.email,
  ]);
  useDashboardLifecycleEffects({
    snapshot: data.snapshot,
    projectsPaginationStatus: data.projectsPaginationStatus,
    ensureDefaultWorkspace: ensureDefaultWorkspaceAction,
    setActiveWorkspaceSlug,
    preloadSearchPopupModule: loadSearchPopupModule,
    openSearch,
    openInbox,
    openCreateProject,
    openSettings: handleOpenSettings,
    locationPathname: location.pathname,
    locationSearch: location.search,
    projects: data.projects,
    navigateToPath: navigateToPathWithReplace,
    resolvedWorkspaceSlug: data.resolvedWorkspaceSlug,
    companySettings: data.companySummary,
    ensureOrganizationLinkAction,
    runWorkspaceSettingsReconciliation:
      workspaceActions.runWorkspaceSettingsReconciliation,
  });
  return {
    user,
    signOut,
    authenticationMethod,
    convex,
    navigation,
    apiHandlers,
    viewerFallback,
    data,
    canCreateWorkspace,
    handleSwitchWorkspace,
    handleCreateWorkspace,
    handleMarkInboxActivityRead,
    handleMarkAllInboxActivitiesRead,
    handleDismissInboxActivity,
    workspaceActions,
  };
}
export type DashboardDataLayer = ReturnType<typeof useDashboardDataLayer>;
