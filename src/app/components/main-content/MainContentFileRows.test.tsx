/** @vitest-environment jsdom */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { ProjectFileData } from "../../types";
import { MainContentFileRows } from "./MainContentFileRows";

const { scrollToIndexMock } = vi.hoisted(() => ({
  scrollToIndexMock: vi.fn(),
}));

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: () => ({
    getTotalSize: () => 0,
    getVirtualItems: () => [],
    measureElement: vi.fn(),
    scrollToIndex: scrollToIndexMock,
  }),
}));

const createFile = (index: number): ProjectFileData => ({
  id: `file-${index}`,
  projectPublicId: "project-1",
  tab: "Assets",
  name: `Asset ${index}.png`,
  type: "PNG",
  displayDateEpochMs: 1700000000000,
});

describe("MainContentFileRows", () => {
  beforeEach(() => {
    scrollToIndexMock.mockReset();
  });

  test("scrolls virtualized file list to highlighted file index", async () => {
    const files = Array.from({ length: 81 }, (_, index) => createFile(index));

    render(
      <div style={{ overflowY: "auto", maxHeight: 600 }}>
        <MainContentFileRows
          filteredFiles={files}
          fileRowRefs={{ current: {} }}
          fileActions={{
            create: vi.fn(),
            remove: vi.fn(),
            download: vi.fn(),
          }}
          canMutateProjectFiles
          fileMutationDisabledMessage="Disabled"
          onRemoveFile={vi.fn()}
          highlightedFileId="file-40"
        />
      </div>,
    );

    await waitFor(() => {
      expect(scrollToIndexMock).toHaveBeenCalledWith(40, {
        align: "center",
      });
    });
  });
});
