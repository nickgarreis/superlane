import { describe, expect, test, vi } from "vitest";
import { createFileCommands } from "./createFileCommands";

describe("createFileCommands", () => {
  test("maps handlers to file command interface", async () => {
    const handleCreateProjectFile = vi.fn();
    const handleRemoveProjectFile = vi.fn();
    const handleDownloadProjectFile = vi.fn();
    const handleUploadDraftAttachment = vi.fn(async () => ({
      pendingUploadId: "pending-1",
      name: "brief.pdf",
      type: "PDF",
      mimeType: "application/pdf",
      sizeBytes: 10,
    }));
    const handleRemoveDraftAttachment = vi.fn(async () => {});
    const handleDiscardDraftSessionUploads = vi.fn(async () => {});

    const commands = createFileCommands({
      handleCreateProjectFile,
      handleRemoveProjectFile,
      handleDownloadProjectFile,
      handleUploadDraftAttachment,
      handleRemoveDraftAttachment,
      handleDiscardDraftSessionUploads,
    });

    commands.createProjectFile("project-1", "Assets", {} as File);
    commands.removeProjectFile("file-1");
    commands.downloadProjectFile("file-2");
    const uploaded = await commands.uploadDraftAttachment(
      {} as File,
      "draft-1",
    );
    await commands.removeDraftAttachment("pending-1");
    await commands.discardDraftSessionUploads("draft-1");

    expect(handleCreateProjectFile).toHaveBeenCalledWith(
      "project-1",
      "Assets",
      expect.anything(),
    );
    expect(handleRemoveProjectFile).toHaveBeenCalledWith("file-1");
    expect(handleDownloadProjectFile).toHaveBeenCalledWith("file-2");
    expect(handleUploadDraftAttachment).toHaveBeenCalledWith(
      expect.anything(),
      "draft-1",
    );
    expect(handleRemoveDraftAttachment).toHaveBeenCalledWith("pending-1");
    expect(handleDiscardDraftSessionUploads).toHaveBeenCalledWith("draft-1");
    expect(uploaded).toEqual({
      pendingUploadId: "pending-1",
      name: "brief.pdf",
      type: "PDF",
      mimeType: "application/pdf",
      sizeBytes: 10,
    });
  });
});
