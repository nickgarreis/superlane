type GetUploadUrl = (workspaceSlug: string) => Promise<{ uploadUrl: string }>;
type GetChecksum = (file: File) => Promise<string>;

export const prepareUpload = async (
  file: File,
  workspaceSlug: string,
  getUploadUrl: GetUploadUrl,
  getChecksum: GetChecksum,
) => {
  const [checksumSha256, { uploadUrl }] = await Promise.all([
    getChecksum(file),
    getUploadUrl(workspaceSlug),
  ]);

  return {
    checksumSha256,
    uploadUrl,
  };
};
