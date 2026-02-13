/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { FileSection } from "./FileSection";
import type { ProjectFileTab } from "../../types";

type FileSectionProps = React.ComponentProps<typeof FileSection>;

const buildProps = (
  overrides: Partial<FileSectionProps> = {},
): FileSectionProps => ({
  activeTab: "Assets",
  setActiveTab: vi.fn(),
  handleUploadClick: vi.fn(),
  fileInputRef: React.createRef<HTMLInputElement>(),
  handleFileChange: vi.fn(),
  canMutateProjectFiles: true,
  fileMutationDisabledMessage: "Files can only be modified for active projects",
  searchQuery: "",
  setSearchQuery: vi.fn(),
  sortBy: "relevance",
  setSortBy: vi.fn(),
  isSortOpen: false,
  setIsSortOpen: vi.fn(),
  shouldOptimizeFileRows: false,
  renderedFileRows: <div data-testid="rendered-rows">rows</div>,
  filteredFilesLength: 1,
  ...overrides,
});

describe("FileSection", () => {
  test("switches tabs, updates search, and triggers upload when enabled", () => {
    const setActiveTab = vi.fn();
    const setSearchQuery = vi.fn();
    const handleUploadClick = vi.fn();

    render(
      <FileSection
        {...buildProps({
          setActiveTab,
          setSearchQuery,
          handleUploadClick,
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Contract" }));
    expect(setActiveTab).toHaveBeenCalledWith("Contract" as ProjectFileTab);

    fireEvent.change(screen.getByPlaceholderText("Search content"), {
      target: { value: "brand" },
    });
    expect(setSearchQuery).toHaveBeenCalledWith("brand");

    fireEvent.click(screen.getByRole("button", { name: "Add asset" }));
    expect(handleUploadClick).toHaveBeenCalledTimes(1);
  });

  test("blocks upload action when file mutations are disabled", async () => {
    const handleUploadClick = vi.fn();
    const user = userEvent.setup();

    render(
      <FileSection
        {...buildProps({
          canMutateProjectFiles: false,
          handleUploadClick,
        })}
      />,
    );

    const addButton = screen.getByRole("button", { name: "Add asset" });
    expect(addButton).toBeDisabled();

    await user.hover(addButton);
    expect(handleUploadClick).not.toHaveBeenCalled();
    expect(screen.getByRole("tooltip")).toHaveTextContent(
      "Files can only be modified for active projects",
    );
    await user.unhover(addButton);
  });

  test("handles sort dropdown actions and empty-state copy", () => {
    const setSortBy = vi.fn();
    const setIsSortOpen = vi.fn();

    render(
      <FileSection
        {...buildProps({
          isSortOpen: true,
          setSortBy,
          setIsSortOpen,
          filteredFilesLength: 0,
          searchQuery: "missing",
        })}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Name (A-Z)" }));
    expect(setSortBy).toHaveBeenCalledWith("name");
    expect(setIsSortOpen).toHaveBeenCalledWith(false);

    expect(
      screen.getByText('No files found matching "missing"'),
    ).toBeInTheDocument();
  });

  test("keeps tabs and upload action in the same row on mobile", () => {
    render(
      <FileSection
        {...buildProps({
          isMobile: true,
        })}
      />,
    );

    const tabsActionsRow = screen.getByTestId("file-section-tabs-actions-row");
    const tabsStrip = screen.getByTestId("file-section-tabs-strip");

    expect(tabsActionsRow).toHaveClass("flex", "items-center", "justify-between");
    expect(tabsActionsRow).not.toHaveClass("flex-col");
    expect(tabsStrip).toHaveClass("flex-1", "min-w-0", "overflow-x-auto");
    expect(screen.getByRole("button", { name: "Add asset" })).toHaveClass(
      "shrink-0",
    );
  });
});
