import { ConvexError } from "convex/values";

export const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
export const MAX_FILES_PER_PROJECT = 25;
export const FILE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;
export const STALE_PENDING_UPLOAD_MS = 24 * 60 * 60 * 1000;

const ALLOWED_EXTENSIONS_TO_MIME: Record<string, readonly string[]> = {
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  gif: ["image/gif"],
  webp: ["image/webp"],
  svg: ["image/svg+xml"],
  pdf: ["application/pdf"],
  txt: ["text/plain"],
  csv: ["text/csv", "application/csv"],
  doc: ["application/msword"],
  docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  xls: ["application/vnd.ms-excel"],
  xlsx: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  ppt: ["application/vnd.ms-powerpoint"],
  pptx: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
  zip: ["application/zip", "application/x-zip-compressed"],
  rar: ["application/vnd.rar", "application/x-rar-compressed"],
  fig: ["application/x-fig"],
};

const FIGMA_FILE_HEADER = "fig-kiwi";

const CHECKSUM_HEX_RE = /^[a-f0-9]{64}$/i;

export const getFileExtension = (name: string): string => {
  const normalizedName = name.trim();
  const lastDotIndex = normalizedName.lastIndexOf(".");
  if (lastDotIndex <= 0 || lastDotIndex === normalizedName.length - 1) {
    return "";
  }
  return normalizedName.slice(lastDotIndex + 1).toLowerCase();
};

export const inferFileTypeFromName = (name: string): string => {
  const extension = getFileExtension(name);
  return extension.length > 0 ? extension.toUpperCase() : "FILE";
};

const splitName = (name: string): { base: string; extensionWithDot: string } => {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return { base: "file", extensionWithDot: "" };
  }
  const lastDotIndex = trimmed.lastIndexOf(".");
  if (lastDotIndex <= 0 || lastDotIndex === trimmed.length - 1) {
    return { base: trimmed, extensionWithDot: "" };
  }
  return {
    base: trimmed.slice(0, lastDotIndex),
    extensionWithDot: trimmed.slice(lastDotIndex),
  };
};

export const ensureUniqueFileName = (
  requestedName: string,
  existingNames: Iterable<string>,
): string => {
  const normalizedExisting = new Set(
    Array.from(existingNames).map((entry) => entry.trim().toLowerCase()),
  );

  const requestedTrimmed = requestedName.trim();
  if (requestedTrimmed.length === 0) {
    return "file";
  }

  if (!normalizedExisting.has(requestedTrimmed.toLowerCase())) {
    return requestedTrimmed;
  }

  const { base, extensionWithDot } = splitName(requestedTrimmed);
  let index = 2;
  while (true) {
    const candidate = `${base} (${index})${extensionWithDot}`;
    if (!normalizedExisting.has(candidate.toLowerCase())) {
      return candidate;
    }
    index += 1;
  }
};

export const assertValidChecksumSha256 = (checksumSha256: string) => {
  if (!CHECKSUM_HEX_RE.test(checksumSha256)) {
    throw new ConvexError("Invalid checksum");
  }
};

export const assertValidSize = (sizeBytes: number) => {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw new ConvexError("Invalid file size");
  }
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new ConvexError("File exceeds max size of 100MB");
  }
};

export const assertAllowedMimeAndExtension = (name: string, mimeType: string) => {
  const extension = getFileExtension(name);
  const normalizedMime = mimeType.trim().toLowerCase();

  if (extension.length === 0 || normalizedMime.length === 0) {
    throw new ConvexError("Unsupported file type");
  }

  const allowedMimeTypes = ALLOWED_EXTENSIONS_TO_MIME[extension];
  if (!allowedMimeTypes || !allowedMimeTypes.includes(normalizedMime)) {
    throw new ConvexError("Unsupported file type");
  }
};

export const assertAllowedFileSignature = (name: string, filePrefixBytes: Uint8Array) => {
  const extension = getFileExtension(name);
  if (extension !== "fig") {
    return;
  }

  if (filePrefixBytes.length < FIGMA_FILE_HEADER.length) {
    throw new ConvexError("Invalid Figma file content");
  }

  const header = new TextDecoder().decode(filePrefixBytes.slice(0, FIGMA_FILE_HEADER.length));
  if (header !== FIGMA_FILE_HEADER) {
    throw new ConvexError("Invalid Figma file content");
  }
};
