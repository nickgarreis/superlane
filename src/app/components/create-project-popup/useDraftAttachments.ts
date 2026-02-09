import { useCallback, useMemo, useRef, useState } from "react";
import { useDropzone } from "react-dropzone";
import { createClientId } from "../../lib/id";
import type { PendingDraftAttachmentUpload } from "../../types";

type UploadedAttachment = {
  pendingUploadId: string;
  name: string;
  type: string;
  mimeType: string | null;
  sizeBytes: number;
};

type UseDraftAttachmentsArgs = {
  draftSessionId: string;
  onUploadAttachment?: (file: File, draftSessionId: string) => Promise<UploadedAttachment>;
  onRemovePendingAttachment?: (pendingUploadId: string) => Promise<void>;
};

const inferAttachmentType = (file: File) =>
  file.name.split(".").pop()?.toUpperCase() || "FILE";

const createClientAttachmentId = (index: number) =>
  `${createClientId("attachment", 18)}-${index}`;

export function useDraftAttachments({
  draftSessionId,
  onUploadAttachment,
  onRemovePendingAttachment,
}: UseDraftAttachmentsArgs) {
  const [attachments, setAttachments] = useState<PendingDraftAttachmentUpload[]>([]);
  const discardRequestedRef = useRef(false);

  const uploadAttachmentEntry = useCallback(
    async (file: File, clientId: string) => {
      if (!onUploadAttachment) {
        setAttachments((prev) =>
          prev.map((entry) =>
            entry.clientId === clientId
              ? { ...entry, status: "error", error: "Upload handler is unavailable" }
              : entry,
          ),
        );
        return;
      }

      try {
        const uploaded = await onUploadAttachment(file, draftSessionId);
        if (discardRequestedRef.current && onRemovePendingAttachment) {
          await onRemovePendingAttachment(uploaded.pendingUploadId);
          setAttachments((prev) => prev.filter((entry) => entry.clientId !== clientId));
          return;
        }

        setAttachments((prev) =>
          prev.map((entry) =>
            entry.clientId === clientId
              ? {
                  ...entry,
                  status: "uploaded",
                  pendingUploadId: uploaded.pendingUploadId,
                  name: uploaded.name,
                  type: uploaded.type,
                  error: undefined,
                }
              : entry,
          ),
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        setAttachments((prev) =>
          prev.map((entry) =>
            entry.clientId === clientId
              ? { ...entry, status: "error", error: message }
              : entry,
          ),
        );
      }
    },
    [draftSessionId, onRemovePendingAttachment, onUploadAttachment],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newEntries: PendingDraftAttachmentUpload[] = acceptedFiles.map((file, index) => ({
        clientId: createClientAttachmentId(index),
        file,
        name: file.name,
        type: inferAttachmentType(file),
        status: "uploading",
      }));

      setAttachments((prev) => [...prev, ...newEntries]);
      newEntries.forEach((entry) => {
        void uploadAttachmentEntry(entry.file, entry.clientId);
      });
    },
    [uploadAttachmentEntry],
  );

  const handleRemoveAttachment = useCallback(
    (clientId: string) => {
      const target = attachments.find((entry) => entry.clientId === clientId);
      setAttachments((prev) => prev.filter((entry) => entry.clientId !== clientId));
      if (target?.pendingUploadId && onRemovePendingAttachment) {
        void onRemovePendingAttachment(target.pendingUploadId).catch(() => {
          // UI removes the row immediately; stale uploads are cleaned by backend retention.
        });
      }
    },
    [attachments, onRemovePendingAttachment],
  );

  const handleRetryAttachment = useCallback(
    (clientId: string) => {
      const target = attachments.find((entry) => entry.clientId === clientId);
      if (!target) {
        return;
      }
      setAttachments((prev) =>
        prev.map((entry) =>
          entry.clientId === clientId
            ? { ...entry, status: "uploading", error: undefined, pendingUploadId: undefined }
            : entry,
        ),
      );
      void uploadAttachmentEntry(target.file, target.clientId);
    },
    [attachments, uploadAttachmentEntry],
  );

  const markDiscardRequested = useCallback(() => {
    discardRequestedRef.current = true;
  }, []);

  const resetAttachments = useCallback(() => {
    discardRequestedRef.current = false;
    setAttachments([]);
  }, []);

  const isUploading = useMemo(
    () => attachments.some((file) => file.status === "uploading"),
    [attachments],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return {
    attachments,
    isUploading,
    getRootProps,
    getInputProps,
    isDragActive,
    handleRemoveAttachment,
    handleRetryAttachment,
    markDiscardRequested,
    resetAttachments,
  };
}
