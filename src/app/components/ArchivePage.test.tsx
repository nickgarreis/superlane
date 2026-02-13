/** @vitest-environment jsdom */

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { ArchivePage } from "./ArchivePage";
import type { ProjectData } from "../types";

vi.mock("../../imports/HorizontalBorder", () => ({
  default: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <button type="button" onClick={onToggleSidebar}>
      Toggle
    </button>
  ),
}));

const buildProject = (
  args: Partial<ProjectData> & Pick<ProjectData, "id" | "name" | "category">,
): ProjectData => ({
  id: args.id,
  name: args.name,
  category: args.category,
  description: args.description ?? "",
  creator: args.creator ?? { name: "Owner", avatar: "" },
  status: args.status ?? {
    label: "Active",
    color: "#58AFFF",
    bgColor: "rgba(88,175,255,0.12)",
    dotColor: "#58AFFF",
  },
  archived: args.archived ?? false,
  archivedAt: args.archivedAt,
  tasks: args.tasks ?? [],
  completedAt: args.completedAt ?? null,
});

describe("ArchivePage", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("filters archived projects and handles row actions", () => {
    const onNavigateToProject = vi.fn();
    const onUnarchiveProject = vi.fn();
    const onDeleteProject = vi.fn();
    const setHighlightedProjectId = vi.fn();
    vi.spyOn(window, "confirm").mockReturnValue(true);

    const archivedProject = buildProject({
      id: "archived-1",
      name: "Archived Brand Refresh",
      category: "Brand",
      archived: true,
      archivedAt: Date.now() - 86400000,
    });

    render(
      <ArchivePage
        onToggleSidebar={vi.fn()}
        projects={{
          "archived-1": archivedProject,
          "active-1": buildProject({
            id: "active-1",
            name: "Active Web",
            category: "Web",
          }),
        }}
        viewerRole="owner"
        onNavigateToProject={onNavigateToProject}
        onUnarchiveProject={onUnarchiveProject}
        onDeleteProject={onDeleteProject}
        highlightedProjectId="archived-1"
        setHighlightedProjectId={setHighlightedProjectId}
      />,
    );

    fireEvent.click(screen.getByText("Archived Brand Refresh"));
    expect(onNavigateToProject).toHaveBeenCalledWith("archived-1");

    fireEvent.click(screen.getByTitle("Unarchive"));
    expect(onUnarchiveProject).toHaveBeenCalledWith("archived-1");

    fireEvent.click(screen.getByTitle("Delete permanently"));
    expect(onDeleteProject).toHaveBeenCalledWith("archived-1");

    fireEvent.change(screen.getByPlaceholderText("Search archived projects"), {
      target: { value: "missing" },
    });

    expect(
      screen.getByText("No matching archived projects"),
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1801);
    });

    expect(setHighlightedProjectId).toHaveBeenCalledWith(null);
  });
});
