import { afterEach, describe, expect, test, vi } from "vitest";
import {
  asBrandAssetId,
  asPendingUploadId,
  asProjectFileId,
  asStorageId,
  asUserId,
  computeFileChecksumSha256,
  omitUndefined,
  uploadFileToConvexStorage,
} from "./uploadHelpers";

describe("uploadHelpers", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("computes stable SHA-256 checksums", async () => {
    const checksum = await computeFileChecksumSha256(new File(["abc"], "file.txt", { type: "text/plain" }));
    expect(checksum).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  test("uploads file to convex storage and returns storage id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ storageId: "storage-1" }),
    });

    vi.stubGlobal("fetch", fetchMock);

    const file = new File(["image"], "logo.png", { type: "image/png" });
    const storageId = await uploadFileToConvexStorage("https://upload.example", file);

    expect(storageId).toBe("storage-1");
    expect(fetchMock).toHaveBeenCalledWith("https://upload.example", {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: file,
    });
  });

  test("throws when upload fails or response is missing storage id", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        }),
    );

    await expect(
      uploadFileToConvexStorage("https://upload.example", new File(["x"], "x.bin")),
    ).rejects.toThrow("Upload failed with status 500");

    await expect(
      uploadFileToConvexStorage("https://upload.example", new File(["x"], "x.bin")),
    ).rejects.toThrow("Upload response missing storageId");
  });

  test("provides typed id passthrough helpers and omits undefined values", () => {
    expect(asStorageId("storage-id")).toBe("storage-id");
    expect(asUserId("user-id")).toBe("user-id");
    expect(asBrandAssetId("brand-id")).toBe("brand-id");
    expect(asPendingUploadId("pending-id")).toBe("pending-id");
    expect(asProjectFileId("file-id")).toBe("file-id");

    expect(omitUndefined({ a: 1, b: undefined, c: null })).toEqual({ a: 1, c: null });
  });
});
