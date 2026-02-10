import type { FileCommands, ProjectFileTab } from "../types";

type CreateFileCommandsArgs = {
  handleCreateProjectFile: (projectPublicId: string, tab: ProjectFileTab, file: File) => void;
  handleRemoveProjectFile: (fileId: string) => void;
  handleDownloadProjectFile: (fileId: string) => void;
  handleUploadDraftAttachment: (
    file: File,
    draftSessionId: string,
  ) => Promise<{
    pendingUploadId: string;
    name: string;
    type: string;
    mimeType: string | null;
    sizeBytes: number;
  }>;
  handleRemoveDraftAttachment: (pendingUploadId: string) => Promise<void>;
  handleDiscardDraftSessionUploads: (draftSessionId: string) => Promise<void>;
};

export const createFileCommands = ({
  handleCreateProjectFile,
  handleRemoveProjectFile,
  handleDownloadProjectFile,
  handleUploadDraftAttachment,
  handleRemoveDraftAttachment,
  handleDiscardDraftSessionUploads,
}: CreateFileCommandsArgs): FileCommands => ({
  createProjectFile: handleCreateProjectFile,
  removeProjectFile: handleRemoveProjectFile,
  downloadProjectFile: handleDownloadProjectFile,
  uploadDraftAttachment: handleUploadDraftAttachment,
  removeDraftAttachment: handleRemoveDraftAttachment,
  discardDraftSessionUploads: handleDiscardDraftSessionUploads,
});
