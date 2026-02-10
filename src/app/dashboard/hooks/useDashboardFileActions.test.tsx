/** @vitest-environment jsdom */

import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { useDashboardFileActions } from "./useDashboardFileActions";

const { prepareUploadMock, toastMock } = vi.hoisted(() => ({
  prepareUploadMock: vi.fn(),
  toastMock: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("../lib/uploadPipeline", () => ({
  prepareUpload: (...args: unknown[]) => prepareUploadMock(...args),
}));

vi.mock("sonner", () => ({
  toast: toastMock,
}));

const createBaseArgs = () => ({
  activeWorkspaceId: "workspace-1",
  resolvedWorkspaceSlug: "workspace-1",
  convexQuery: vi.fn(),
  generateUploadUrlMutation: vi.fn().mockResolvedValue({ uploadUrl: "https://upload.test" }),
  finalizeProjectUploadAction: vi.fn().mockResolvedValue({}),
  finalizePendingDraftAttachmentUploadAction: vi.fn().mockResolvedValue({
    pendingUploadId: "pending-1",
    name: "draft.png",
    type: "PNG",
    mimeType: "image/png",
    sizeBytes: 123,
  }),
  discardPendingUploadMutation: vi.fn().mockResolvedValue({}),
  discardPendingUploadsForSessionMutation: vi.fn().mockResolvedValue({}),
  removeProjectFileMutation: vi.fn().mockResolvedValue({ removed: true }),
  computeFileChecksumSha256: vi.fn().mockResolvedValue("checksum"),
  uploadFileToConvexStorage: vi.fn().mockResolvedValue("storage-1"),
  asStorageId: vi.fn((value: string) => value as any),
  asPendingUploadId: vi.fn((value: string) => value as any),
  asProjectFileId: vi.fn((value: string) => value as any),
});

describe("useDashboardFileActions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("uploads files and handles draft attachment workflows", async () => {
    prepareUploadMock.mockResolvedValue({
      checksumSha256: "checksum",
      uploadUrl: "https://upload.test",
    });

    const args = createBaseArgs();
    const { result } = renderHook(() => useDashboardFileActions(args));
    const file = new File(["hello"], "asset.png", { type: "image/png" });

    act(() => {
      result.current.handleCreateProjectFile("project-1", "Assets", file);
    });

    await waitFor(() => {
      expect(args.finalizeProjectUploadAction).toHaveBeenCalledWith({
        projectPublicId: "project-1",
        tab: "Assets",
        name: "asset.png",
        mimeType: "image/png",
        sizeBytes: file.size,
        checksumSha256: "checksum",
        storageId: "storage-1",
      });
    });

    expect(toastMock.success).toHaveBeenCalledWith("Successfully uploaded asset.png");

    const draftResult = await result.current.handleUploadDraftAttachment(file, "draft-session-1");
    expect(draftResult).toEqual({
      pendingUploadId: "pending-1",
      name: "draft.png",
      type: "PNG",
      mimeType: "image/png",
      sizeBytes: 123,
    });

    await result.current.handleRemoveDraftAttachment("pending-1");
    expect(args.discardPendingUploadMutation).toHaveBeenCalledWith({
      pendingUploadId: "pending-1",
    });

    await result.current.handleDiscardDraftSessionUploads("draft-session-1");
    expect(args.discardPendingUploadsForSessionMutation).toHaveBeenCalledWith({
      workspaceSlug: "workspace-1",
      draftSessionId: "draft-session-1",
    });
  });

  test("handles remove and download edge cases", async () => {
    prepareUploadMock.mockResolvedValue({
      checksumSha256: "checksum",
      uploadUrl: "https://upload.test",
    });

    const args = createBaseArgs();
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    args.convexQuery = vi.fn()
      .mockResolvedValueOnce({ url: "invalid-url" })
      .mockResolvedValueOnce({ url: "https://download.test/file.png" });

    const { result } = renderHook(() => useDashboardFileActions(args));

    act(() => {
      result.current.handleRemoveProjectFile("file-1");
    });
    await waitFor(() => {
      expect(args.removeProjectFileMutation).toHaveBeenCalledWith({ fileId: "file-1" });
    });

    act(() => {
      result.current.handleDownloadProjectFile("file-1");
    });
    await waitFor(() => {
      expect(toastMock.error).toHaveBeenCalledWith("Failed to download file");
    });

    act(() => {
      result.current.handleDownloadProjectFile("file-2");
    });
    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith("https://download.test/file.png", "_blank", "noopener,noreferrer");
    });

    openSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
