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

const LINKED_IDENTITY_SYNC_RETRY_DELAYS_MS = [0, 300, 1000, 2500] as const;
const LINKED_IDENTITY_SYNC_RETRYABLE_REASONS = new Set<
  "unauthorized" | "not_provisioned" | "sync_failed"
>(["unauthorized", "not_provisioned", "sync_failed"]);

type LinkedIdentitySyncActionResult = {
  synced: boolean;
  linkedIdentityProviders: string[];
  reason?: "unauthorized" | "not_provisioned" | "sync_failed";
};

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
    const signature = `${user?.id ?? "authenticated-user"}:${authenticationMethod ?? "unknown"}`;
    if (linkedIdentitySyncSignatureRef.current === signature) {
      return;
    }
    linkedIdentitySyncSignatureRef.current = signature;

    let isCancelled = false;
    let pendingRetryTimeout: ReturnType<typeof setTimeout> | null = null;

    const runSyncWithRetries = async () => {
      for (
        let attemptIndex = 0;
        attemptIndex < LINKED_IDENTITY_SYNC_RETRY_DELAYS_MS.length;
        attemptIndex += 1
      ) {
        const retryDelayMs = LINKED_IDENTITY_SYNC_RETRY_DELAYS_MS[attemptIndex];
        if (retryDelayMs > 0) {
          await new Promise<void>((resolve) => {
            pendingRetryTimeout = setTimeout(() => {
              pendingRetryTimeout = null;
              resolve();
            }, retryDelayMs);
          });
          if (isCancelled) {
            return;
          }
        }

        let result: LinkedIdentitySyncActionResult;
        try {
          result = (await syncCurrentUserLinkedIdentityProvidersAction({
            sessionAuthenticationMethod: authenticationMethod ?? undefined,
          })) as LinkedIdentitySyncActionResult;
        } catch (error) {
          const isFinalAttempt =
            attemptIndex === LINKED_IDENTITY_SYNC_RETRY_DELAYS_MS.length - 1;
          if (!isFinalAttempt) {
            continue;
          }
          linkedIdentitySyncSignatureRef.current = null;
          if (isCancelled) {
            return;
          }
          reportUiError("dashboard.syncLinkedIdentityProviders", error, {
            showToast: false,
            details: {
              signature,
              attempts: attemptIndex + 1,
              reason: "thrown_error",
            },
          });
          return;
        }

        if (result.synced) {
          return;
        }

        const reason = result.reason ?? "sync_failed";
        const isRetryable =
          result.reason !== undefined &&
          LINKED_IDENTITY_SYNC_RETRYABLE_REASONS.has(result.reason);
        const isFinalAttempt =
          attemptIndex === LINKED_IDENTITY_SYNC_RETRY_DELAYS_MS.length - 1;
        if (isRetryable && !isFinalAttempt) {
          continue;
        }

        linkedIdentitySyncSignatureRef.current = null;
        if (isCancelled) {
          return;
        }
        reportUiError(
          "dashboard.syncLinkedIdentityProviders",
          new Error(
            `Linked identity sync did not complete (reason: ${reason}) after ${attemptIndex + 1} attempt(s)`,
          ),
          {
            showToast: false,
            details: {
              signature,
              attempts: attemptIndex + 1,
              reason,
              linkedIdentityProviderCount: result.linkedIdentityProviders.length,
            },
          },
        );
        return;
      }

    };

    void runSyncWithRetries();

    return () => {
      isCancelled = true;
      if (pendingRetryTimeout !== null) {
        clearTimeout(pendingRetryTimeout);
      }
    };
  }, [
    authenticationMethod,
    isAuthenticated,
    syncCurrentUserLinkedIdentityProvidersAction,
    user?.id,
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
