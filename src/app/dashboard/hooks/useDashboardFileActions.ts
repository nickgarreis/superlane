import { useCallback } from "react";
import { toast } from "sonner";
import type { Id } from "../../../../convex/_generated/dataModel";
import { api } from "../../../../convex/_generated/api";
import type { ProjectFileTab } from "../../types";
import { prepareUpload } from "../lib/uploadPipeline";
import type {
  DashboardActionHandler,
  DashboardFileActions,
  DashboardMutationHandler,
  DashboardQueryInvoker,
} from "../types";

type UseDashboardFileActionsArgs = {
  activeWorkspaceId: string | null | undefined;
  resolvedWorkspaceSlug: string | null;
  convexQuery: DashboardQueryInvoker;
  generateUploadUrlMutation: DashboardMutationHandler<typeof api.files.generateUploadUrl>;
  finalizeProjectUploadAction: DashboardActionHandler<typeof api.files.finalizeProjectUpload>;
  finalizePendingDraftAttachmentUploadAction: DashboardActionHandler<typeof api.files.finalizePendingDraftAttachmentUpload>;
  discardPendingUploadMutation: DashboardMutationHandler<typeof api.files.discardPendingUpload>;
  discardPendingUploadsForSessionMutation: DashboardMutationHandler<typeof api.files.discardPendingUploadsForSession>;
  removeProjectFileMutation: DashboardMutationHandler<typeof api.files.remove>;
  computeFileChecksumSha256: (file: File) => Promise<string>;
  uploadFileToConvexStorage: (uploadUrl: string, file: File) => Promise<string>;
  asStorageId: (value: string) => Id<"_storage">;
  asPendingUploadId: (value: string) => Id<"pendingFileUploads">;
  asProjectFileId: (value: string) => Id<"projectFiles">;
};

export const useDashboardFileActions = ({
  activeWorkspaceId,
  resolvedWorkspaceSlug,
  convexQuery,
  generateUploadUrlMutation,
  finalizeProjectUploadAction,
  finalizePendingDraftAttachmentUploadAction,
  discardPendingUploadMutation,
  discardPendingUploadsForSessionMutation,
  removeProjectFileMutation,
  computeFileChecksumSha256,
  uploadFileToConvexStorage,
  asStorageId,
  asPendingUploadId,
  asProjectFileId,
}: UseDashboardFileActionsArgs): DashboardFileActions => {
  const resolveUploadWorkspaceSlug = useCallback(
    () => activeWorkspaceId ?? resolvedWorkspaceSlug ?? null,
    [activeWorkspaceId, resolvedWorkspaceSlug],
  );

  const handleCreateProjectFile = useCallback((projectPublicId: string, tab: ProjectFileTab, file: File) => {
    void (async () => {
      const workspaceSlug = resolveUploadWorkspaceSlug();
      if (!workspaceSlug) {
        throw new Error("No active workspace selected");
      }

      const { checksumSha256, uploadUrl } = await prepareUpload(
        file,
        workspaceSlug,
        (slug) => generateUploadUrlMutation({ workspaceSlug: slug }),
        computeFileChecksumSha256,
      );
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
  }, [
    asStorageId,
    computeFileChecksumSha256,
    finalizeProjectUploadAction,
    generateUploadUrlMutation,
    resolveUploadWorkspaceSlug,
    uploadFileToConvexStorage,
  ]);

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

      const { checksumSha256, uploadUrl } = await prepareUpload(
        file,
        workspaceSlug,
        (slug) => generateUploadUrlMutation({ workspaceSlug: slug }),
        computeFileChecksumSha256,
      );
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
      asStorageId,
      computeFileChecksumSha256,
      finalizePendingDraftAttachmentUploadAction,
      generateUploadUrlMutation,
      resolveUploadWorkspaceSlug,
      uploadFileToConvexStorage,
    ],
  );

  const handleRemoveDraftAttachment = useCallback(
    async (pendingUploadId: string) => {
      await discardPendingUploadMutation({
        pendingUploadId: asPendingUploadId(pendingUploadId),
      });
    },
    [asPendingUploadId, discardPendingUploadMutation],
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
    [discardPendingUploadsForSessionMutation, resolveUploadWorkspaceSlug],
  );

  const handleRemoveProjectFile = useCallback((fileId: string) => {
    void removeProjectFileMutation({ fileId: asProjectFileId(fileId) })
      .then((result) => {
        if (result.removed) {
          toast.success("File removed");
        } else {
          toast.info("File not found or already removed");
        }
      })
      .catch((error) => {
        console.error(error);
        toast.error("Failed to remove file");
      });
  }, [asProjectFileId, removeProjectFileMutation]);

  const handleDownloadProjectFile = useCallback(
    (fileId: string) => {
      void convexQuery(api.files.getDownloadUrl, {
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
    [asProjectFileId, convexQuery],
  );

  return {
    handleCreateProjectFile,
    handleUploadDraftAttachment,
    handleRemoveDraftAttachment,
    handleDiscardDraftSessionUploads,
    handleRemoveProjectFile,
    handleDownloadProjectFile,
  };
};
