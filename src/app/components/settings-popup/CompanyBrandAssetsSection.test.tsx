/** @vitest-environment jsdom */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { CompanyBrandAssetsSection } from "./CompanyBrandAssetsSection";

const { safeScrollIntoViewMock } = vi.hoisted(() => ({
  safeScrollIntoViewMock: vi.fn(),
}));

vi.mock("../../lib/dom", () => ({
  safeScrollIntoView: (...args: unknown[]) => safeScrollIntoViewMock(...args),
}));

const buildProps = () => ({
  brandAssets: [
    {
      id: "asset-1",
      name: "BrandGuide.pdf",
      type: "PDF",
      displayDateEpochMs: Date.now(),
      sizeBytes: 1024,
      mimeType: "application/pdf",
      downloadUrl: null,
    },
    {
      id: "asset-2",
      name: "Logo.png",
      type: "PNG",
      displayDateEpochMs: Date.now(),
      sizeBytes: 2048,
      mimeType: "image/png",
      downloadUrl: "https://example.com/logo.png",
    },
  ],
  canManageBrandAssets: true,
  viewerRole: "owner" as const,
  onUploadBrandAsset: vi.fn().mockResolvedValue(undefined),
  onRemoveBrandAsset: vi.fn().mockResolvedValue(undefined),
  onGetBrandAssetDownloadUrl: vi.fn().mockResolvedValue(null),
});

describe("CompanyBrandAssetsSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("focuses brand asset rows by file name", async () => {
    render(
      <CompanyBrandAssetsSection
        {...buildProps()}
        focusTarget={{ kind: "brandAsset", assetName: "brandguide.pdf" }}
      />,
    );

    await waitFor(() => {
      expect(safeScrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    const focusedRow = safeScrollIntoViewMock.mock.calls[0]?.[0] as HTMLElement;
    expect(focusedRow.textContent).toContain("BrandGuide.pdf");
    expect(focusedRow.classList.contains("settings-row-flash")).toBe(true);
  });
});
