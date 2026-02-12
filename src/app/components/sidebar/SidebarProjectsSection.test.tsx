/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { ProjectData } from "../../types";
import { SidebarProjectsSection } from "./SidebarProjectsSection";

vi.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, () => {}],
}));

const project = (overrides: Partial<ProjectData>): ProjectData => ({
  id: "project-id",
  name: "Project",
  description: "Description",
  creator: { name: "Owner", avatar: "" },
  status: {
    label: "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "Web",
  archived: false,
  tasks: [],
  ...overrides,
});

describe("SidebarProjectsSection", () => {
  test("routes active project clicks and shows approved tags for approved active projects", () => {
    const onNavigate = vi.fn();

    render(
      <SidebarProjectsSection
        projects={{
          a: project({ id: "active-1", name: "Active Approved" }),
          b: project({ id: "active-2", name: "Active Not Approved" }),
        }}
        approvedSidebarProjectIds={["active-1"]}
        currentView="tasks"
        onNavigate={onNavigate}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={vi.fn()}
        onOpenDraftPendingProjectsPopup={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Active Approved"));

    expect(onNavigate).toHaveBeenCalledWith("project:active-1");
    expect(screen.getByText("Approved")).toBeInTheDocument();
  });

  test("opens completed projects popup from completed section", () => {
    const onOpenCompletedProjectsPopup = vi.fn();

    render(
      <SidebarProjectsSection
        projects={{
          completed: project({
            id: "completed-1",
            name: "Completed Project",
            status: {
              label: "Completed",
              color: "#fff",
              bgColor: "#000",
              dotColor: "#fff",
            },
            completedAt: Date.UTC(2026, 1, 10),
          }),
        }}
        approvedSidebarProjectIds={[]}
        currentView="tasks"
        onNavigate={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={onOpenCompletedProjectsPopup}
        onOpenDraftPendingProjectsPopup={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Completed"));

    expect(onOpenCompletedProjectsPopup).toHaveBeenCalledTimes(1);
  });

  test("opens draft and pending projects popup when draft/review section is clicked", () => {
    const onOpenDraftPendingProjectsPopup = vi.fn();

    render(
      <SidebarProjectsSection
        projects={{
          draft: project({
            id: "draft-1",
            name: "Draft Project",
            status: {
              label: "Draft",
              color: "#fff",
              bgColor: "#000",
              dotColor: "#fff",
            },
          }),
          review: project({
            id: "review-1",
            name: "Review Project",
            status: {
              label: "Review",
              color: "#fff",
              bgColor: "#000",
              dotColor: "#fff",
            },
          }),
        }}
        approvedSidebarProjectIds={["draft-1", "review-1"]}
        currentView="tasks"
        onNavigate={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={vi.fn()}
        onOpenDraftPendingProjectsPopup={onOpenDraftPendingProjectsPopup}
      />,
    );

    fireEvent.click(screen.getByText("Drafts & pending projects"));

    expect(onOpenDraftPendingProjectsPopup).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Approved")).toBeNull();
  });
});
