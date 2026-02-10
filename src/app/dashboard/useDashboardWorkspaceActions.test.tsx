/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardWorkspaceActions } from "./useDashboardWorkspaceActions";

const { prepareUploadMock, toastMock, reportUiErrorMock } = vi.hoisted(() => ({
  prepareUploadMock: vi.fn(),
  toastMock: {
    success: vi.fn(),
    error: vi.fn(),
  },
  reportUiErrorMock: vi.fn(),
}));

vi.mock("./lib/uploadPipeline", () => ({
  prepareUpload: (...args: unknown[]) => prepareUploadMock(...args),
}));

vi.mock("sonner", () => ({
  toast: toastMock,
}));

vi.mock("../lib/errors", () => ({
  reportUiError: (...args: unknown[]) => reportUiErrorMock(...args),
}));

const createBaseArgs = () => ({
  canCreateWorkspace: true,
  resolvedWorkspaceSlug: "workspace-1",
  setActiveWorkspaceSlug: vi.fn(),
  navigateToPath: vi.fn(),
  navigateView: vi.fn(),
  closeCreateWorkspace: vi.fn(),
  createWorkspaceMutation: vi.fn().mockResolvedValue({ slug: "workspace-new" }),
  reconcileWorkspaceInvitationsAction: vi.fn().mockResolvedValue({}),
  reconcileWorkspaceOrganizationMembershipsAction: vi.fn().mockResolvedValue({}),
  updateAccountProfileAction: vi.fn().mockResolvedValue({}),
  generateAvatarUploadUrlMutation: vi.fn().mockResolvedValue({ uploadUrl: "https://upload.test/avatar" }),
  finalizeAvatarUploadMutation: vi.fn().mockResolvedValue({}),
  removeAvatarMutation: vi.fn().mockResolvedValue({}),
  saveNotificationPreferencesMutation: vi.fn().mockResolvedValue({}),
  updateWorkspaceGeneralMutation: vi.fn().mockResolvedValue({}),
  generateWorkspaceLogoUploadUrlMutation: vi.fn().mockResolvedValue({ uploadUrl: "https://upload.test/logo" }),
  finalizeWorkspaceLogoUploadMutation: vi.fn().mockResolvedValue({}),
  inviteWorkspaceMemberAction: vi.fn().mockResolvedValue({}),
  resendWorkspaceInvitationAction: vi.fn().mockResolvedValue({}),
  revokeWorkspaceInvitationAction: vi.fn().mockResolvedValue({}),
  changeWorkspaceMemberRoleAction: vi.fn().mockResolvedValue({}),
  removeWorkspaceMemberAction: vi.fn().mockResolvedValue({}),
  generateBrandAssetUploadUrlMutation: vi.fn().mockResolvedValue({ uploadUrl: "https://upload.test/brand" }),
  finalizeBrandAssetUploadMutation: vi.fn().mockResolvedValue({}),
  removeBrandAssetMutation: vi.fn().mockResolvedValue({}),
  softDeleteWorkspaceMutation: vi.fn().mockResolvedValue({}),
  computeFileChecksumSha256: vi.fn().mockResolvedValue("checksum-1"),
  uploadFileToConvexStorage: vi.fn().mockResolvedValue("storage-1"),
  asStorageId: vi.fn((value: string) => value as any),
  asUserId: vi.fn((value: string) => value as any),
  asBrandAssetId: vi.fn((value: string) => value as any),
  omitUndefined: ((value: Record<string, unknown>) => value) as <T extends Record<string, unknown>>(value: T) => T,
});

describe("useDashboardWorkspaceActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prepareUploadMock.mockResolvedValue({
      checksumSha256: "checksum-1",
      uploadUrl: "https://upload.test/upload",
    });
  });

  test("creates workspace, uploads optional logo, and navigates to tasks", async () => {
    const args = createBaseArgs();
    const { result } = renderHook(() => useDashboardWorkspaceActions(args));
    const logoFile = new File(["logo"], "logo.png", { type: "image/png" });

    await result.current.handleCreateWorkspaceSubmit({
      name: "My Workspace",
      logoFile,
    });

    expect(args.createWorkspaceMutation).toHaveBeenCalledWith({ name: "My Workspace" });
    expect(args.finalizeWorkspaceLogoUploadMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-new",
      storageId: "storage-1",
      mimeType: "image/png",
      sizeBytes: logoFile.size,
      checksumSha256: "checksum-1",
    });
    expect(args.setActiveWorkspaceSlug).toHaveBeenCalledWith("workspace-new");
    expect(args.navigateView).toHaveBeenCalledWith("tasks");
    expect(args.closeCreateWorkspace).toHaveBeenCalled();
    expect(toastMock.success).toHaveBeenCalledWith("Workspace created");
  });

  test("handles create workspace guard and mutation failures", async () => {
    const forbiddenArgs = createBaseArgs();
    forbiddenArgs.canCreateWorkspace = false;
    const forbiddenHook = renderHook(() => useDashboardWorkspaceActions(forbiddenArgs));

    await expect(
      forbiddenHook.result.current.handleCreateWorkspaceSubmit({ name: "Blocked" }),
    ).rejects.toThrow("Only workspace owners can create workspaces");

    const failingArgs = createBaseArgs();
    failingArgs.createWorkspaceMutation.mockRejectedValueOnce(new Error("create failed"));
    const failingHook = renderHook(() => useDashboardWorkspaceActions(failingArgs));

    await expect(
      failingHook.result.current.handleCreateWorkspaceSubmit({ name: "Will Fail" }),
    ).rejects.toThrow("create failed");

    expect(reportUiErrorMock).toHaveBeenCalledWith(
      "workspace.create",
      expect.any(Error),
      { showToast: false },
    );
    expect(toastMock.error).toHaveBeenCalledWith("Failed to create workspace");
  });

  test("continues when logo upload fails after workspace creation", async () => {
    const args = createBaseArgs();
    args.finalizeWorkspaceLogoUploadMutation.mockRejectedValueOnce(new Error("logo failed"));
    const { result } = renderHook(() => useDashboardWorkspaceActions(args));
    const logoFile = new File(["logo"], "logo.png", { type: "image/png" });

    await result.current.handleCreateWorkspaceSubmit({
      name: "Workspace With Logo Error",
      logoFile,
    });

    expect(reportUiErrorMock).toHaveBeenCalledWith(
      "workspace.create.logoUpload",
      expect.any(Error),
      {
        showToast: false,
        details: { workspaceSlug: "workspace-new" },
      },
    );
    expect(toastMock.error).toHaveBeenCalledWith("Workspace created, but logo upload failed");
    expect(toastMock.success).toHaveBeenCalledWith("Workspace created");
  });

  test("executes settings/profile/member/invitation and upload handlers", async () => {
    const args = createBaseArgs();
    const { result } = renderHook(() => useDashboardWorkspaceActions(args));
    const file = new File(["content"], "asset.png", { type: "image/png" });

    await result.current.handleSaveAccountSettings({
      firstName: "Nick",
      lastName: "User",
      email: "nick@example.com",
    });
    await result.current.handleUploadAccountAvatar(file);
    await result.current.handleRemoveAccountAvatar();
    await result.current.handleSaveSettingsNotifications({
      events: {
        eventNotifications: false,
        teamActivities: true,
        productUpdates: false,
      },
    });
    await result.current.handleUpdateWorkspaceGeneral({
      name: "Updated Workspace",
      logoText: "NW",
    });
    await result.current.handleUploadWorkspaceLogo(file);
    await result.current.handleInviteWorkspaceMember({
      email: "member@example.com",
      role: "member",
    });
    await result.current.handleChangeWorkspaceMemberRole({
      userId: "user-2",
      role: "admin",
    });
    await result.current.handleRemoveWorkspaceMember({
      userId: "user-3",
    });
    await result.current.handleResendWorkspaceInvitation({
      invitationId: "invite-1",
    });
    await result.current.handleRevokeWorkspaceInvitation({
      invitationId: "invite-2",
    });
    await result.current.handleUploadWorkspaceBrandAsset(file);
    await result.current.handleRemoveWorkspaceBrandAsset({ brandAssetId: "brand-1" });

    expect(args.updateAccountProfileAction).toHaveBeenCalledWith({
      firstName: "Nick",
      lastName: "User",
      email: "nick@example.com",
    });
    expect(args.finalizeAvatarUploadMutation).toHaveBeenCalled();
    expect(args.removeAvatarMutation).toHaveBeenCalledWith({});
    expect(args.saveNotificationPreferencesMutation).toHaveBeenCalled();
    expect(args.updateWorkspaceGeneralMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      name: "Updated Workspace",
      logoText: "NW",
      logo: undefined,
      logoColor: undefined,
    });
    expect(args.inviteWorkspaceMemberAction).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      email: "member@example.com",
      role: "member",
    });
    expect(args.changeWorkspaceMemberRoleAction).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      targetUserId: "user-2",
      role: "admin",
    });
    expect(args.removeWorkspaceMemberAction).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      targetUserId: "user-3",
    });
    expect(args.resendWorkspaceInvitationAction).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      invitationId: "invite-1",
    });
    expect(args.revokeWorkspaceInvitationAction).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      invitationId: "invite-2",
    });
    expect(args.finalizeBrandAssetUploadMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      storageId: "storage-1",
      name: "asset.png",
      mimeType: "image/png",
      sizeBytes: file.size,
      checksumSha256: "checksum-1",
    });
    expect(args.removeBrandAssetMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      brandAssetId: "brand-1",
    });
  });

  test("reports reconciliation failures and handles soft-delete rollback", async () => {
    const args = createBaseArgs();
    args.reconcileWorkspaceInvitationsAction.mockRejectedValueOnce(new Error("reconcile invites failed"));
    args.softDeleteWorkspaceMutation.mockRejectedValueOnce(new Error("delete failed"));
    const { result } = renderHook(() => useDashboardWorkspaceActions(args));

    await act(async () => {
      await result.current.runWorkspaceSettingsReconciliation("workspace-1");
    });

    expect(reportUiErrorMock).toHaveBeenCalledWith(
      "workspace.settings.reconciliation",
      expect.any(Error),
      expect.objectContaining({
        showToast: false,
        details: expect.objectContaining({
          action: "reconcileWorkspaceInvitationsAction",
          workspaceSlug: "workspace-1",
        }),
      }),
    );

    await expect(result.current.handleSoftDeleteWorkspace()).rejects.toThrow("delete failed");
    expect(args.setActiveWorkspaceSlug).toHaveBeenNthCalledWith(1, null);
    expect(args.setActiveWorkspaceSlug).toHaveBeenNthCalledWith(2, "workspace-1");
    expect(reportUiErrorMock).toHaveBeenCalledWith(
      "workspace.softDelete",
      expect.any(Error),
      {
        showToast: false,
        details: { workspaceSlug: "workspace-1" },
      },
    );
  });
});
