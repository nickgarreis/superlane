import React, { Suspense, useCallback, useEffect, useMemo, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useAction, useConvex, useConvexAuth, useMutation } from "convex/react";
import { useAuth } from "@workos-inc/authkit-react";
import { AnimatePresence, motion } from "motion/react";
import { Toaster, toast } from "sonner";
import imgAvatar from "figma:asset/fea98b130b1d6a04ebf9c88afab5cd53fbd3e447.png";
import imgLogo from "figma:asset/c3a996a7bf06b0777eaf43cb323cfde0872e163e.png";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ArchivePage } from "../components/ArchivePage";
import { MainContent } from "../components/MainContent";
import { Sidebar } from "../components/Sidebar";
import { Tasks } from "../components/Tasks";
import { isProtectedPath, pathToView, viewToPath, type AppView } from "../lib/routing";
import { scheduleIdlePrefetch } from "../lib/prefetch";
import { parseProjectStatus } from "../lib/status";
import { useDashboardData } from "./useDashboardData";
import { useDashboardCommands } from "./useDashboardCommands";
import { useDashboardNavigation } from "./useDashboardNavigation";
import type {
  ProjectData,
  ProjectDraftData,
  ProjectFileTab,
  ReviewComment,
  Task,
} from "../types";
import {
  parseSettingsTab,
  MainContentFileActions,
  MainContentNavigationActions,
  MainContentProjectActions,
} from "./types";

const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((entry) => entry.toString(16).padStart(2, "0"))
    .join("");

const computeFileChecksumSha256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return bytesToHex(new Uint8Array(digest));
};

const asStorageId = (value: string) => value as Id<"_storage">;
const asUserId = (value: string) => value as Id<"users">;
const asBrandAssetId = (value: string) => value as Id<"workspaceBrandAssets">;
const asPendingUploadId = (value: string) => value as Id<"pendingFileUploads">;
const asProjectFileId = (value: string) => value as Id<"projectFiles">;

const getProjectPublicIdSuffix = (): string => {
  if (typeof crypto !== "undefined") {
    if (typeof crypto.randomUUID === "function") {
      return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    }
    if (typeof crypto.getRandomValues === "function") {
      const randomBytes = new Uint8Array(8);
      crypto.getRandomValues(randomBytes);
      return Array.from(randomBytes, (byte) => byte.toString(36).padStart(2, "0")).join("").slice(0, 12);
    }
  }

  return Math.random().toString(36).slice(2, 14);
};

const buildGeneratedProjectPublicId = (name?: string): string =>
  `${(name || "untitled").toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${getProjectPublicIdSuffix()}`;

type CreateProjectPayload = {
  name?: string;
  description?: string;
  category?: string;
  scope?: string;
  deadlineEpochMs?: number | null;
  status?: string;
  draftData?: ProjectDraftData | null;
  _editProjectId?: string;
  _generatedId?: string;
  attachmentPendingUploadIds?: string[];
};

type CreateWorkspacePayload = {
  name: string;
  logoFile?: File | null;
};

const uploadFileToConvexStorage = async (
  uploadUrl: string,
  file: File,
) => {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Type": file.type || "application/octet-stream",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed with status ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.storageId) {
    throw new Error("Upload response missing storageId");
  }
  return String(payload.storageId);
};

const loadSearchPopupModule = () => import("../components/SearchPopup");
const loadCreateProjectPopupModule = () => import("../components/CreateProjectPopup");
const loadCreateWorkspacePopupModule = () => import("../components/CreateWorkspacePopup");
const loadSettingsPopupModule = () => import("../components/SettingsPopup");

const LazySearchPopup = React.lazy(async () => {
  const module = await loadSearchPopupModule();
  return { default: module.SearchPopup };
});
const LazyCreateProjectPopup = React.lazy(async () => {
  const module = await loadCreateProjectPopupModule();
  return { default: module.CreateProjectPopup };
});
const LazyCreateWorkspacePopup = React.lazy(async () => {
  const module = await loadCreateWorkspacePopupModule();
  return { default: module.CreateWorkspacePopup };
});
const LazySettingsPopup = React.lazy(async () => {
  const module = await loadSettingsPopupModule();
  return { default: module.SettingsPopup };
});

const PopupLoadingFallback = (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 backdrop-blur-sm text-[#E8E8E8]/80 font-['Roboto',sans-serif] text-sm">
    Loading...
  </div>
);

export default function DashboardShell() {
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
    location,
    navigate,
    currentView,
    settingsTab,
    isSettingsOpen,
    isSidebarOpen,
    setIsSidebarOpen,
    isSearchOpen,
    setIsSearchOpen,
    isCreateProjectOpen,
    isCreateWorkspaceOpen,
    highlightedArchiveProjectId,
    setHighlightedArchiveProjectId,
    pendingHighlight,
    setPendingHighlight,
    editProjectId,
    setEditProjectId,
    editDraftData,
    setEditDraftData,
    reviewProject,
    setReviewProject,
    activeWorkspaceSlug,
    setActiveWorkspaceSlug,
    navigateView,
    openSearch,
    openCreateProject,
    closeCreateProject,
    openCreateWorkspace,
    closeCreateWorkspace,
    handleOpenSettings,
    handleCloseSettings,
  } = navigation;

  const ensureDefaultWorkspace = useAction(api.workspaces.ensureDefaultWorkspace);
  const createWorkspaceMutation = useAction(api.workspaces.create);
  const createProjectMutation = useMutation(api.projects.create);
  const updateProjectMutation = useMutation(api.projects.update);
  const archiveProjectMutation = useMutation(api.projects.archive);
  const unarchiveProjectMutation = useMutation(api.projects.unarchive);
  const removeProjectMutation = useMutation(api.projects.remove);
  const setProjectStatusMutation = useMutation(api.projects.setStatus);
  const updateReviewCommentsMutation = useMutation(api.projects.updateReviewComments);
  const replaceProjectTasksMutation = useMutation(api.tasks.replaceForProject);
  const replaceWorkspaceTasksMutation = useMutation(api.tasks.replaceForWorkspace);
  const generateUploadUrlMutation = useMutation(api.files.generateUploadUrl);
  const finalizeProjectUploadAction = useAction(api.files.finalizeProjectUpload);
  const finalizePendingDraftAttachmentUploadAction = useAction(api.files.finalizePendingDraftAttachmentUpload);
  const discardPendingUploadMutation = useMutation(api.files.discardPendingUpload);
  const discardPendingUploadsForSessionMutation = useMutation(api.files.discardPendingUploadsForSession);
  const removeProjectFileMutation = useMutation(api.files.remove);
  const generateAvatarUploadUrlMutation = useMutation(api.settings.generateAvatarUploadUrl);
  const finalizeAvatarUploadMutation = useMutation(api.settings.finalizeAvatarUpload);
  const removeAvatarMutation = useMutation(api.settings.removeAvatar);
  const saveNotificationPreferencesMutation = useMutation(api.settings.saveNotificationPreferences);
  const updateWorkspaceGeneralMutation = useMutation(api.settings.updateWorkspaceGeneral);
  const generateWorkspaceLogoUploadUrlMutation = useMutation(api.settings.generateWorkspaceLogoUploadUrl);
  const finalizeWorkspaceLogoUploadMutation = useMutation(api.settings.finalizeWorkspaceLogoUpload);
  const removeWorkspaceLogoMutation = useMutation(api.settings.removeWorkspaceLogo);
  const generateBrandAssetUploadUrlMutation = useMutation(api.settings.generateBrandAssetUploadUrl);
  const finalizeBrandAssetUploadMutation = useMutation(api.settings.finalizeBrandAssetUpload);
  const removeBrandAssetMutation = useMutation(api.settings.removeBrandAsset);
  const softDeleteWorkspaceMutation = useMutation(api.settings.softDeleteWorkspace);
  const updateAccountProfileAction = useAction(api.settings.updateAccountProfile);
  const inviteWorkspaceMemberAction = useAction(api.settings.inviteWorkspaceMember);
  const resendWorkspaceInvitationAction = useAction(api.settings.resendWorkspaceInvitation);
  const revokeWorkspaceInvitationAction = useAction(api.settings.revokeWorkspaceInvitation);
  const changeWorkspaceMemberRoleAction = useAction(api.settings.changeWorkspaceMemberRole);
  const removeWorkspaceMemberAction = useAction(api.settings.removeWorkspaceMember);
  const reconcileWorkspaceInvitationsAction = useAction(api.settings.reconcileWorkspaceInvitations);
  const reconcileWorkspaceOrganizationMembershipsAction = useAction(
    api.organizationSync.reconcileWorkspaceOrganizationMemberships,
  );
  const ensureOrganizationLinkAction = useAction(api.workspaces.ensureOrganizationLink);

  const omitUndefined = <T extends Record<string, unknown>>(value: T) =>
    Object.fromEntries(
      Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
    ) as T;

  const viewerFallback = useMemo(() => ({
    name:
      [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim()
      || user?.email
      || "Unknown user",
    email: user?.email ?? "",
    avatarUrl: user?.profilePictureUrl ?? null,
  }), [user?.email, user?.firstName, user?.lastName, user?.profilePictureUrl]);

  const {
    snapshot,
    resolvedWorkspaceSlug,
    accountSettings,
    notificationSettings,
    companySettings,
    workspaceMembers,
    viewerIdentity,
    workspaces,
    projects,
    workspaceTasks,
    activeWorkspace,
    visibleProjects,
    allWorkspaceFiles,
    projectFilesByProject,
    contentModel,
    handleToggleSidebar,
    clearPendingHighlight,
  } = useDashboardData({
    isAuthenticated,
    activeWorkspaceSlug,
    setActiveWorkspaceSlug,
    isSettingsOpen,
    isSearchOpen,
    currentView,
    viewerFallback,
    setIsSidebarOpen,
    setPendingHighlight,
    navigateView,
  });

  const defaultWorkspaceRequestedRef = useRef(false);
  const organizationLinkAttemptedWorkspacesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!snapshot) {
      return;
    }
    if (snapshot.workspaces.length > 0 || defaultWorkspaceRequestedRef.current) {
      return;
    }

    defaultWorkspaceRequestedRef.current = true;
    void ensureDefaultWorkspace({})
      .then((result) => {
        setActiveWorkspaceSlug(result.slug);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to create your default workspace");
      });
  }, [snapshot, ensureDefaultWorkspace, setActiveWorkspaceSlug]);

  useEffect(() => {
    const cancel = scheduleIdlePrefetch(() => loadSearchPopupModule());
    return cancel;
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        openSearch();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [openSearch]);

  const viewerName = viewerIdentity.name;
  const viewerAvatar = viewerIdentity.avatarUrl || imgAvatar;
  const canCreateWorkspace = viewerIdentity.role === "owner";

  const invalidRouteRef = useRef<string | null>(null);

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    const routeView = pathToView(location.pathname);
    if (!routeView) {
      invalidRouteRef.current = null;
      return;
    }

    if (routeView.startsWith("project:")) {
      const projectId = routeView.split(":")[1];
      const project = projects[projectId];

      if (!project) {
        if (invalidRouteRef.current !== location.pathname) {
          invalidRouteRef.current = location.pathname;
          toast.error("Project not found");
        }
        navigate("/tasks", { replace: true });
        return;
      }

      if (project.archived) {
        navigate(viewToPath(`archive-project:${projectId}`), { replace: true });
        return;
      }

      invalidRouteRef.current = null;
      return;
    }

    if (routeView.startsWith("archive-project:")) {
      const projectId = routeView.split(":")[1];
      const project = projects[projectId];

      if (!project) {
        if (invalidRouteRef.current !== location.pathname) {
          invalidRouteRef.current = location.pathname;
          toast.error("Archived project not found");
        }
        navigate("/archive", { replace: true });
        return;
      }

      if (!project.archived) {
        navigate(viewToPath(`project:${projectId}`), { replace: true });
        return;
      }

      invalidRouteRef.current = null;
    }
  }, [snapshot, location.pathname, projects, navigate]);

  const handleSwitchWorkspace = (workspaceSlug: string) => {
    setActiveWorkspaceSlug(workspaceSlug);
    navigateView("tasks");
  };

  const handleCreateWorkspace = useCallback(() => {
    if (!canCreateWorkspace) {
      toast.error("Only workspace owners can create workspaces");
      return;
    }
    openCreateWorkspace();
  }, [canCreateWorkspace, openCreateWorkspace]);

  const runWorkspaceSettingsReconciliation = useCallback(
    async (workspaceSlug: string) => {
      await Promise.allSettled([
        reconcileWorkspaceInvitationsAction({ workspaceSlug }),
        reconcileWorkspaceOrganizationMembershipsAction({ workspaceSlug }),
      ]);
    },
    [reconcileWorkspaceInvitationsAction, reconcileWorkspaceOrganizationMembershipsAction],
  );

  useEffect(() => {
    if (!resolvedWorkspaceSlug || !companySettings) {
      return;
    }
    if (companySettings.capability.hasOrganizationLink || companySettings.viewerRole !== "owner") {
      return;
    }

    const attempted = organizationLinkAttemptedWorkspacesRef.current;
    if (attempted.has(resolvedWorkspaceSlug)) {
      return;
    }
    attempted.add(resolvedWorkspaceSlug);

    void ensureOrganizationLinkAction({ workspaceSlug: resolvedWorkspaceSlug })
      .then(async (result) => {
        if (!result.alreadyLinked) {
          await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
          toast.success("Workspace linked to WorkOS organization");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to link workspace organization");
      });
  }, [
    resolvedWorkspaceSlug,
    companySettings,
    ensureOrganizationLinkAction,
    runWorkspaceSettingsReconciliation,
  ]);

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
    [generateAvatarUploadUrlMutation, finalizeAvatarUploadMutation],
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
    [generateWorkspaceLogoUploadUrlMutation, finalizeWorkspaceLogoUploadMutation],
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
      createWorkspaceMutation,
      uploadWorkspaceLogoForSlug,
      setActiveWorkspaceSlug,
      navigateView,
      closeCreateWorkspace,
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
    [resolvedWorkspaceSlug, updateWorkspaceGeneralMutation],
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

  const handleRemoveWorkspaceLogo = useCallback(async () => {
    if (!resolvedWorkspaceSlug) {
      throw new Error("No active workspace");
    }
    await removeWorkspaceLogoMutation({
      workspaceSlug: resolvedWorkspaceSlug,
    });
  }, [resolvedWorkspaceSlug, removeWorkspaceLogoMutation]);

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
    [resolvedWorkspaceSlug, inviteWorkspaceMemberAction, runWorkspaceSettingsReconciliation],
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
    [resolvedWorkspaceSlug, changeWorkspaceMemberRoleAction, runWorkspaceSettingsReconciliation],
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
    [resolvedWorkspaceSlug, removeWorkspaceMemberAction, runWorkspaceSettingsReconciliation],
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
    [resolvedWorkspaceSlug, generateBrandAssetUploadUrlMutation, finalizeBrandAssetUploadMutation],
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
    [resolvedWorkspaceSlug, removeBrandAssetMutation],
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
      navigate("/tasks");
    } catch (error) {
      setActiveWorkspaceSlug(resolvedWorkspaceSlug);
      console.error(error);
      throw error;
    }
  }, [resolvedWorkspaceSlug, softDeleteWorkspaceMutation, setActiveWorkspaceSlug, navigate]);

  const handleCreateProject = async (
    projectData: CreateProjectPayload,
  ): Promise<void> => {
    const normalizedStatus = parseProjectStatus(projectData.status);
    const existingId = projectData._editProjectId;

    if (existingId && projects[existingId]) {
      const existing = projects[existingId];
      try {
        await updateProjectMutation(omitUndefined({
          publicId: existingId,
          name: projectData.name ?? existing.name,
          description: projectData.description ?? existing.description,
          category: projectData.category ?? existing.category,
          scope: projectData.scope ?? existing.scope,
          deadlineEpochMs: projectData.deadlineEpochMs ?? existing.deadlineEpochMs ?? null,
          status: normalizedStatus,
          draftData: normalizedStatus === "Draft" ? projectData.draftData ?? null : null,
          attachmentPendingUploadIds: projectData.attachmentPendingUploadIds?.map(asPendingUploadId),
        }));
        if (normalizedStatus !== "Draft" && normalizedStatus !== "Review") {
          navigateView(`project:${existingId}`);
        }
        setEditProjectId(null);
        setEditDraftData(null);
        toast.success(normalizedStatus === "Draft" ? "Draft saved" : "Project updated");
        return;
      } catch (error) {
        console.error(error);
        toast.error("Failed to update project");
        throw error;
      }
    }

    if (!activeWorkspace?.id) {
      const error = new Error("Select a workspace before creating a project");
      toast.error(error.message);
      throw error;
    }

    const publicId = projectData._generatedId || buildGeneratedProjectPublicId(projectData.name);

    try {
      await createProjectMutation(omitUndefined({
        workspaceSlug: activeWorkspace.id,
        publicId,
        name: projectData.name || "Untitled Project",
        description: projectData.description || "",
        category: projectData.category || "General",
        scope: projectData.scope || undefined,
        deadlineEpochMs: projectData.deadlineEpochMs ?? null,
        status: normalizedStatus,
        attachmentPendingUploadIds: projectData.attachmentPendingUploadIds?.map(asPendingUploadId),
        draftData: normalizedStatus === "Draft" ? projectData.draftData ?? null : null,
      }));
      if (normalizedStatus !== "Draft" && normalizedStatus !== "Review") {
        navigateView(`project:${publicId}`);
      }
      toast.success(normalizedStatus === "Draft" ? "Draft saved" : "Project created");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create project");
      throw error;
    }
  };

  const categoryToService = (category: string): string => {
    const map: Record<string, string> = {
      webdesign: "Web Design",
      "web design": "Web Design",
      automation: "AI Automation",
      "ai automation": "AI Automation",
      marketing: "Marketing Campaigns",
      "marketing campaigns": "Marketing Campaigns",
      presentation: "Presentation",
      "ai consulting": "AI Consulting",
      "creative strategy & concept": "Creative Strategy & Concept",
    };
    return map[category.toLowerCase()] || category;
  };

  const handleEditProject = (project: ProjectData) => {
    const draftData: ProjectDraftData = project.draftData || {
      selectedService: categoryToService(project.category),
      projectName: project.name,
      selectedJob: project.scope || "",
      description: project.description,
      isAIEnabled: true,
      deadlineEpochMs: null,
      lastStep: 1,
    };

    setEditProjectId(project.id);
    setEditDraftData(draftData);
    openCreateProject();
  };

  const handleViewReviewProject = (project: ProjectData) => {
    setReviewProject(project);
    openCreateProject();
  };

  const handleUpdateComments = (
    projectId: string,
    comments: ReviewComment[],
  ) => {
    return updateReviewCommentsMutation({
      publicId: projectId,
      comments,
    });
  };

  const handleArchiveProject = (id: string) => {
    void archiveProjectMutation({ publicId: id })
      .then(() => {
        setHighlightedArchiveProjectId(id);
        navigateView("archive");
        toast.success("Project archived");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to archive project");
      });
  };

  const handleUnarchiveProject = (id: string) => {
    void unarchiveProjectMutation({ publicId: id })
      .then(() => {
        if (currentView === `archive-project:${id}`) {
          navigateView("archive");
        }
        toast.success("Project unarchived");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to unarchive project");
      });
  };

  const handleDeleteProject = (id: string) => {
    const project = projects[id];
    const isDraft = project?.status?.label === "Draft";

    void removeProjectMutation({ publicId: id })
      .then(() => {
        if (currentView === `project:${id}` || currentView === `archive-project:${id}`) {
          if (currentView.startsWith("archive-project:")) {
            navigateView("archive");
          } else {
            const otherProject = Object.values(visibleProjects).find((p) => p.id !== id && !p.archived);
            if (otherProject) {
              navigateView(`project:${otherProject.id}`);
            } else {
              navigate("/tasks");
            }
          }
        }
        toast.success(isDraft ? "Draft deleted" : "Project deleted");
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to delete project");
      });
  };

  const handleUpdateProjectStatus = (id: string, newStatus: string) => {
    const parsedStatus = parseProjectStatus(newStatus);

    void setProjectStatusMutation({
      publicId: id,
      status: parsedStatus,
    })
      .then(() => {
        if (parsedStatus === "Completed") {
          toast.success("Project marked as completed");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to update project status");
      });
  };

  const handleApproveReviewProject = useCallback(
    async (projectId: string) => {
      await setProjectStatusMutation({
        publicId: projectId,
        status: "Active",
      });
      toast.success("Project approved");
      navigateView(`project:${projectId}`);
    },
    [setProjectStatusMutation, navigateView],
  );

  const handleUpdateProject = useCallback(
    (id: string, data: Partial<ProjectData>) => {
      const tasks = data.tasks;

      if (tasks) {
        const cleanTasks: Task[] = tasks.map((task) => ({
          id: String(task.id),
          title: task.title,
          assignee: {
            name: task.assignee?.name || viewerIdentity.name,
            avatar: task.assignee?.avatar || viewerIdentity.avatarUrl || "",
          },
          dueDateEpochMs: task.dueDateEpochMs ?? null,
          completed: task.completed,
        }));

        void replaceProjectTasksMutation({
          projectPublicId: id,
          tasks: cleanTasks,
        }).catch((error) => {
          console.error(error);
          toast.error("Failed to update tasks");
        });
      }

      const patch: {
        publicId: string;
        name?: string;
        description?: string;
        category?: string;
        scope?: string;
        deadlineEpochMs?: number | null;
        reviewComments?: ProjectData["comments"];
      } = {
        publicId: id,
      };

      if (data.name !== undefined) patch.name = data.name;
      if (data.description !== undefined) patch.description = data.description;
      if (data.category !== undefined) patch.category = data.category;
      if (data.scope !== undefined) patch.scope = data.scope;
      if (data.deadlineEpochMs !== undefined) patch.deadlineEpochMs = data.deadlineEpochMs;
      if (data.comments !== undefined) patch.reviewComments = data.comments;

      if (Object.keys(patch).length > 1) {
        void updateProjectMutation(patch).catch((error) => {
          console.error(error);
          toast.error("Failed to update project");
        });
      }
    },
    [
      replaceProjectTasksMutation,
      updateProjectMutation,
      viewerIdentity.avatarUrl,
      viewerIdentity.name,
    ],
  );

  const handleReplaceWorkspaceTasks = useCallback(
    (tasks: Task[]) => {
      if (!activeWorkspace?.id) {
        toast.error("Select a workspace before updating tasks");
        return;
      }

      const cleanTasks = tasks.map((task) => ({
        id: String(task.id),
        title: task.title,
        assignee: {
          name: task.assignee?.name || viewerIdentity.name,
          avatar: task.assignee?.avatar || viewerIdentity.avatarUrl || "",
        },
        dueDateEpochMs: task.dueDateEpochMs ?? null,
        completed: task.completed,
        projectPublicId: task.projectId ?? null,
      }));

      void replaceWorkspaceTasksMutation({
        workspaceSlug: activeWorkspace.id,
        tasks: cleanTasks,
      }).catch((error) => {
        console.error(error);
        toast.error("Failed to update tasks");
      });
    },
    [activeWorkspace?.id, replaceWorkspaceTasksMutation, viewerIdentity.avatarUrl, viewerIdentity.name],
  );

  const resolveUploadWorkspaceSlug = useCallback(
    () => activeWorkspace?.id ?? resolvedWorkspaceSlug ?? null,
    [activeWorkspace?.id, resolvedWorkspaceSlug],
  );

  const handleCreateProjectFile = useCallback((projectPublicId: string, tab: ProjectFileTab, file: File) => {
    void (async () => {
      const workspaceSlug = resolveUploadWorkspaceSlug();
      if (!workspaceSlug) {
        throw new Error("No active workspace selected");
      }

      const checksumSha256 = await computeFileChecksumSha256(file);
      const { uploadUrl } = await generateUploadUrlMutation({ workspaceSlug });
      const storageId = await uploadFileToConvexStorage(uploadUrl, file);

      await finalizeProjectUploadAction({
        projectPublicId,
        tab,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        checksumSha256,
        storageId: asStorageId(storageId),
      });

      toast.success(`Successfully uploaded ${file.name}`);
    })().catch((error) => {
      console.error(error);
      toast.error("Failed to upload file");
    });
  }, [finalizeProjectUploadAction, generateUploadUrlMutation, resolveUploadWorkspaceSlug]);

  const handleUploadDraftAttachment = useCallback(
    async (file: File, draftSessionId: string): Promise<{
      pendingUploadId: string;
      name: string;
      type: string;
      mimeType: string | null;
      sizeBytes: number;
    }> => {
      const workspaceSlug = resolveUploadWorkspaceSlug();
      if (!workspaceSlug) {
        throw new Error("No active workspace selected");
      }

      const checksumSha256 = await computeFileChecksumSha256(file);
      const { uploadUrl } = await generateUploadUrlMutation({ workspaceSlug });
      const storageId = await uploadFileToConvexStorage(uploadUrl, file);

      const result = await finalizePendingDraftAttachmentUploadAction({
        workspaceSlug,
        draftSessionId,
        name: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        checksumSha256,
        storageId: asStorageId(storageId),
      });

      return {
        pendingUploadId: String(result.pendingUploadId),
        name: result.name,
        type: result.type,
        mimeType: result.mimeType ?? null,
        sizeBytes: result.sizeBytes,
      };
    },
    [
      resolveUploadWorkspaceSlug,
      generateUploadUrlMutation,
      finalizePendingDraftAttachmentUploadAction,
    ],
  );

  const handleRemoveDraftAttachment = useCallback(
    async (pendingUploadId: string) => {
      await discardPendingUploadMutation({
        pendingUploadId: asPendingUploadId(pendingUploadId),
      });
    },
    [discardPendingUploadMutation],
  );

  const handleDiscardDraftSessionUploads = useCallback(
    async (draftSessionId: string) => {
      const workspaceSlug = resolveUploadWorkspaceSlug();
      if (!workspaceSlug) {
        return;
      }
      try {
        await discardPendingUploadsForSessionMutation({
          workspaceSlug,
          draftSessionId,
        });
      } catch (error) {
        console.error("Failed to discard draft session uploads", {
          error,
          draftSessionId,
          workspaceSlug,
        });
        toast.error("Failed to discard draft uploads");
      }
    },
    [resolveUploadWorkspaceSlug, discardPendingUploadsForSessionMutation],
  );

  const handleRemoveProjectFile = useCallback((fileId: string) => {
    void removeProjectFileMutation({ fileId: asProjectFileId(fileId) })
      .then((result) => {
        if (result.removed) {
          toast.success("File removed");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to remove file");
      });
  }, [removeProjectFileMutation]);

  const handleDownloadProjectFile = useCallback(
    (fileId: string) => {
      void convex
        .query(api.files.getDownloadUrl, {
          fileId: asProjectFileId(fileId),
        })
        .then((result) => {
          const downloadUrl = typeof result?.url === "string" ? result.url.trim() : "";
          if (!downloadUrl || !/^https?:\/\//i.test(downloadUrl)) {
            console.error("Invalid download URL returned by api.files.getDownloadUrl", {
              fileId,
              result,
            });
            toast.error("Failed to download file");
            return;
          }
          window.open(downloadUrl, "_blank", "noopener,noreferrer");
        })
        .catch((error) => {
          console.error(error);
          toast.error("Failed to download file");
        });
    },
    [convex],
  );

  const handleNavigateToArchiveProject = useCallback(
    (projectId: string) => navigateView(`archive-project:${projectId}`),
    [navigateView],
  );

  const dashboardCommands = useDashboardCommands({
    handleCreateProject,
    handleEditProject,
    handleViewReviewProject,
    handleArchiveProject,
    handleUnarchiveProject,
    handleDeleteProject,
    handleUpdateProjectStatus,
    handleCreateProjectFile,
    handleRemoveProjectFile,
    handleDownloadProjectFile,
    handleUploadDraftAttachment,
    handleRemoveDraftAttachment,
    handleDiscardDraftSessionUploads,
    handleOpenSettings,
    handleCloseSettings,
    handleSaveAccountSettings,
    handleUploadAccountAvatar,
    handleRemoveAccountAvatar,
    handleSaveSettingsNotifications,
    handleSwitchWorkspace,
    handleCreateWorkspace,
  });

  const mainContentFileActions = useMemo<MainContentFileActions>(
    () => ({
      create: dashboardCommands.file.createProjectFile,
      remove: dashboardCommands.file.removeProjectFile,
      download: dashboardCommands.file.downloadProjectFile,
    }),
    [dashboardCommands.file],
  );

  const createMainContentProjectActions = useCallback(
    (projectId: string): MainContentProjectActions => ({
      archive: dashboardCommands.project.archiveProject,
      unarchive: dashboardCommands.project.unarchiveProject,
      remove: dashboardCommands.project.deleteProject,
      updateStatus: dashboardCommands.project.updateProjectStatus,
      updateProject: (data) => handleUpdateProject(projectId, data),
    }),
    [dashboardCommands.project, handleUpdateProject],
  );

  const baseMainContentNavigationActions = useMemo<MainContentNavigationActions>(
    () => ({ navigate: navigateView }),
    [navigateView],
  );

  const renderContent = () => {
    if (contentModel.kind === "tasks") {
      return (
        <Tasks
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          projects={visibleProjects}
          workspaceTasks={workspaceTasks}
          onUpdateWorkspaceTasks={handleReplaceWorkspaceTasks}
          workspaceMembers={workspaceMembers}
          viewerIdentity={viewerIdentity}
        />
      );
    }

    if (contentModel.kind === "archive") {
      return (
        <ArchivePage
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          projects={visibleProjects}
          onNavigateToProject={handleNavigateToArchiveProject}
          onUnarchiveProject={handleUnarchiveProject}
          onDeleteProject={handleDeleteProject}
          highlightedProjectId={highlightedArchiveProjectId}
          setHighlightedProjectId={setHighlightedArchiveProjectId}
        />
      );
    }

    if (contentModel.kind === "main") {
      const project = contentModel.project;
      const navigationActions: MainContentNavigationActions = contentModel.backTo
        ? {
            ...baseMainContentNavigationActions,
            backTo: contentModel.backTo,
            back: contentModel.back,
          }
        : baseMainContentNavigationActions;

      return (
        <MainContent
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={isSidebarOpen}
          project={project}
          projectFiles={projectFilesByProject[project.id] ?? []}
          workspaceMembers={workspaceMembers}
          viewerIdentity={viewerIdentity}
          fileActions={mainContentFileActions}
          projectActions={createMainContentProjectActions(project.id)}
          navigationActions={navigationActions}
          allProjects={visibleProjects}
          pendingHighlight={pendingHighlight}
          onClearPendingHighlight={clearPendingHighlight}
        />
      );
    }

    return (
      <div className="flex-1 h-full bg-bg-base flex flex-col items-center justify-center text-white/20">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
            <img src={imgLogo} alt="" aria-hidden="true" className="w-8 h-8 opacity-40 grayscale" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium">No projects in this workspace</p>
            <button
              onClick={openCreateProject}
              className="mt-3 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/60 hover:text-white transition-colors"
            >
              Create new project
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (!snapshot) {
    return (
      <div className="min-h-screen w-full bg-bg-base flex items-center justify-center text-white/60 font-['Roboto',sans-serif]">
        Loading workspace...
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen w-full bg-bg-base overflow-hidden font-['Roboto',sans-serif] antialiased text-[#E8E8E8]">
        {isSearchOpen && (
          <Suspense fallback={PopupLoadingFallback}>
            <LazySearchPopup
              isOpen={isSearchOpen}
              onClose={() => setIsSearchOpen(false)}
              projects={projects}
              files={allWorkspaceFiles}
              onNavigate={navigateView}
              onOpenCreateProject={openCreateProject}
              onOpenSettings={(tab) => dashboardCommands.settings.openSettings(parseSettingsTab(tab))}
              onHighlightNavigate={(projectId, highlight) => {
                setPendingHighlight({ projectId, ...highlight });
              }}
            />
          </Suspense>
        )}

        {isCreateProjectOpen && (
          <Suspense fallback={PopupLoadingFallback}>
            <LazyCreateProjectPopup
              isOpen={isCreateProjectOpen}
              onClose={closeCreateProject}
              onCreate={dashboardCommands.project.createOrUpdateProject}
              user={{
                userId: viewerIdentity.userId ?? undefined,
                name: viewerName,
                avatar: viewerAvatar,
                role: viewerIdentity.role ?? undefined,
              }}
              editProjectId={editProjectId}
              initialDraftData={editDraftData}
              onDeleteDraft={dashboardCommands.project.deleteProject}
              reviewProject={reviewProject}
              onUpdateComments={handleUpdateComments}
              onApproveReviewProject={handleApproveReviewProject}
              onUploadAttachment={dashboardCommands.file.uploadDraftAttachment}
              onRemovePendingAttachment={dashboardCommands.file.removeDraftAttachment}
              onDiscardDraftUploads={dashboardCommands.file.discardDraftSessionUploads}
            />
          </Suspense>
        )}

        {isCreateWorkspaceOpen && (
          <Suspense fallback={PopupLoadingFallback}>
            <LazyCreateWorkspacePopup
              isOpen={isCreateWorkspaceOpen}
              onClose={closeCreateWorkspace}
              onCreate={handleCreateWorkspaceSubmit}
            />
          </Suspense>
        )}

        {isSettingsOpen && (
          <Suspense fallback={PopupLoadingFallback}>
            <LazySettingsPopup
              isOpen={isSettingsOpen}
              onClose={dashboardCommands.settings.closeSettings}
              initialTab={settingsTab}
              activeWorkspace={activeWorkspace}
              account={
                accountSettings ?? {
                  firstName: user?.firstName ?? "",
                  lastName: user?.lastName ?? "",
                  email: user?.email ?? "",
                  avatarUrl: user?.profilePictureUrl ?? null,
                }
              }
              notifications={
                notificationSettings
                  ? {
                      channels: notificationSettings.channels,
                      events: notificationSettings.events,
                    }
                  : {
                      channels: {
                        email: true,
                        desktop: true,
                      },
                      events: {
                        productUpdates: true,
                        teamActivity: true,
                      },
                    }
              }
              company={
                companySettings
                  ? {
                      ...companySettings,
                      members: companySettings.members.filter(
                        (
                          member,
                        ): member is NonNullable<(typeof companySettings.members)[number]> =>
                          member !== null,
                      ),
                      pendingInvitations: companySettings.pendingInvitations.filter(
                        (
                          invitation,
                        ): invitation is NonNullable<(typeof companySettings.pendingInvitations)[number]> =>
                          invitation !== null,
                      ),
                      brandAssets: companySettings.brandAssets.filter(
                        (
                          asset,
                        ): asset is NonNullable<(typeof companySettings.brandAssets)[number]> =>
                          asset !== null,
                      ),
                    }
                  : null
              }
              loadingCompany={isSettingsOpen && !!resolvedWorkspaceSlug && companySettings === undefined}
              onSaveAccount={dashboardCommands.settings.saveAccount}
              onUploadAvatar={dashboardCommands.settings.uploadAccountAvatar}
              onRemoveAvatar={dashboardCommands.settings.removeAccountAvatar}
              onSaveNotifications={dashboardCommands.settings.saveNotifications}
              onUpdateWorkspaceGeneral={handleUpdateWorkspaceGeneral}
              onUploadWorkspaceLogo={handleUploadWorkspaceLogo}
              onRemoveWorkspaceLogo={handleRemoveWorkspaceLogo}
              onInviteMember={handleInviteWorkspaceMember}
              onChangeMemberRole={handleChangeWorkspaceMemberRole}
              onRemoveMember={handleRemoveWorkspaceMember}
              onResendInvitation={handleResendWorkspaceInvitation}
              onRevokeInvitation={handleRevokeWorkspaceInvitation}
              onUploadBrandAsset={handleUploadWorkspaceBrandAsset}
              onRemoveBrandAsset={handleRemoveWorkspaceBrandAsset}
              onSoftDeleteWorkspace={handleSoftDeleteWorkspace}
            />
          </Suspense>
        )}

        <Toaster
          position="bottom-right"
          theme="dark"
          gap={8}
          duration={3000}
          offset={20}
          toastOptions={{
            style: {
              background: "#1A1A1C",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "14px",
              color: "#E8E8E8",
              fontFamily: "'Roboto', sans-serif",
              fontSize: "13px",
              padding: "14px 16px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)",
              backdropFilter: "blur(12px)",
              gap: "12px",
            },
            classNames: {
              toast: "custom-toast",
              title: "custom-toast-title",
              icon: "custom-toast-icon",
              success: "custom-toast-success",
              error: "custom-toast-error",
              info: "custom-toast-info",
            },
          }}
        />

        <AnimatePresence mode="wait" initial={false}>
          {isSidebarOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="h-full shrink-0 overflow-hidden"
            >
              <div className="w-[260px] h-full">
                <Sidebar
                  onNavigate={navigateView}
                  onSearch={openSearch}
                  onSearchIntent={() => {
                    void loadSearchPopupModule();
                  }}
                  currentView={currentView}
                  onOpenCreateProject={openCreateProject}
                  onOpenCreateProjectIntent={() => {
                    void loadCreateProjectPopupModule();
                  }}
                  projects={visibleProjects}
                  viewerIdentity={viewerIdentity}
                  activeWorkspace={activeWorkspace}
                  workspaces={workspaces}
                  onSwitchWorkspace={dashboardCommands.workspace.switchWorkspace}
                  onCreateWorkspace={dashboardCommands.workspace.createWorkspace}
                  canCreateWorkspace={canCreateWorkspace}
                  onOpenSettings={dashboardCommands.settings.openSettings}
                  onOpenSettingsIntent={() => {
                    void loadSettingsPopupModule();
                  }}
                  onArchiveProject={dashboardCommands.project.archiveProject}
                  onUnarchiveProject={dashboardCommands.project.unarchiveProject}
                  onUpdateProjectStatus={dashboardCommands.project.updateProjectStatus}
                  onEditProject={dashboardCommands.project.editProject}
                  onViewReviewProject={dashboardCommands.project.viewReviewProject}
                  onLogout={() => {
                    void signOut();
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {renderContent()}
      </div>
    </DndProvider>
  );
}
