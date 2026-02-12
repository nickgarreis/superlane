import { describe, expect, test } from "vitest";
import { mapWorkspaceFilesToUi, type SnapshotWorkspaceFile } from "./mappers";

describe("mapWorkspaceFilesToUi", () => {
  test("preserves undefined downloadable instead of coercing to false", () => {
    const files: SnapshotWorkspaceFile[] = [
      {
        id: "file-1",
        projectPublicId: "project-1",
        tab: "Assets",
        name: "brief.pdf",
        type: "PDF",
        displayDateEpochMs: 1700000000000,
      },
    ];

    const mapped = mapWorkspaceFilesToUi(files);
    expect(mapped[0]?.downloadable).toBeUndefined();
  });

  test("preserves explicit downloadable=false", () => {
    const files: SnapshotWorkspaceFile[] = [
      {
        id: "file-2",
        projectPublicId: "project-1",
        tab: "Assets",
        name: "legacy.pdf",
        type: "PDF",
        displayDateEpochMs: 1700000000000,
        downloadable: false,
      },
    ];

    const mapped = mapWorkspaceFilesToUi(files);
    expect(mapped[0]?.downloadable).toBe(false);
  });
});
