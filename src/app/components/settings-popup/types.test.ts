import { describe, expect, test } from "vitest";
import { bytesToHumanReadable, getAssetPreviewSrc } from "./types";

describe("settings popup helper utilities", () => {
  test("formats bytes as human-readable values", () => {
    expect(bytesToHumanReadable(0)).toBe("-");
    expect(bytesToHumanReadable(Number.NaN)).toBe("-");
    expect(bytesToHumanReadable(1024)).toBe("1.0 KB");
    expect(bytesToHumanReadable(10 * 1024)).toBe("10 KB");
    expect(bytesToHumanReadable(1.5 * 1024 * 1024)).toBe("1.5 MB");
  });

  test("chooses preview source from download URL or type fallback", () => {
    const imageAsset = {
      id: "asset-1",
      name: "Logo",
      type: "PNG",
      displayDateEpochMs: Date.now(),
      sizeBytes: 1234,
      mimeType: "image/png",
      downloadUrl: "https://cdn.example.com/logo.png",
    };

    expect(getAssetPreviewSrc(imageAsset)).toBe(imageAsset.downloadUrl);

    const fileAsset = {
      ...imageAsset,
      type: "PDF",
      mimeType: "application/pdf",
      downloadUrl: "https://cdn.example.com/file.pdf",
    };
    const filePreviewSrc = getAssetPreviewSrc(fileAsset);
    expect(filePreviewSrc).toBeTypeOf("string");
    expect(filePreviewSrc).not.toBe(fileAsset.downloadUrl);

    const unknownAsset = {
      ...imageAsset,
      type: "UNKNOWN",
      mimeType: "application/octet-stream",
      downloadUrl: null,
    };
    const unknownPreviewSrc = getAssetPreviewSrc(unknownAsset);
    expect(unknownPreviewSrc).toBeTypeOf("string");
    expect(unknownPreviewSrc.length).toBeGreaterThan(0);
  });
});
