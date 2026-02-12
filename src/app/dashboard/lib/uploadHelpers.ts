import type { Id } from "../../../../convex/_generated/dataModel";
const bytesToHex = (bytes: Uint8Array) =>
  Array.from(bytes)
    .map((entry) => entry.toString(16).padStart(2, "0"))
    .join("");
export const computeFileChecksumSha256 = async (file: File) => {
  const buffer = await file.arrayBuffer();
  const digest = await crypto.subtle.digest("SHA-256", buffer);
  return bytesToHex(new Uint8Array(digest));
};
export const uploadFileToConvexStorage = async (
  uploadUrl: string,
  file: File,
) => {
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type || "application/octet-stream" },
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
export const asStorageId = (value: string) => value as Id<"_storage">;
export const asUserId = (value: string) => value as Id<"users">;
export const asBrandAssetId = (value: string) =>
  value as Id<"workspaceBrandAssets">;
export const asPendingUploadId = (value: string) =>
  value as Id<"pendingFileUploads">;
export const asProjectFileId = (value: string) => value as Id<"projectFiles">;
export const asActivityEventId = (value: string) =>
  value as Id<"workspaceActivityEvents">;
export const omitUndefined = <T extends Record<string, unknown>>(value: T) =>
  Object.fromEntries(
    Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
  ) as T;
