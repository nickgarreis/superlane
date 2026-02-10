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
  test("routes active, draft, and review project clicks to correct handlers", () => {
    const onNavigate = vi.fn();
    const onEditProject = vi.fn();
    const onViewReviewProject = vi.fn();

    render(
      <SidebarProjectsSection
        projects={{
          a: project({ id: "active-1", name: "Active Project" }),
          b: project({ id: "draft-1", name: "Draft Project", status: { label: "Draft", color: "#fff", bgColor: "#000", dotColor: "#fff" } }),
          c: project({ id: "review-1", name: "Review Project", status: { label: "Review", color: "#fff", bgColor: "#000", dotColor: "#fff" } }),
        }}
        currentView="tasks"
        onNavigate={onNavigate}
        onEditProject={onEditProject}
        onViewReviewProject={onViewReviewProject}
        onOpenCompletedProjectsPopup={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Active Project"));
    fireEvent.click(screen.getByText("Draft Project"));
    fireEvent.click(screen.getByText("Review Project"));

    expect(onNavigate).toHaveBeenCalledWith("project:active-1");
    expect(onEditProject).toHaveBeenCalledWith(expect.objectContaining({ id: "draft-1" }));
    expect(onViewReviewProject).toHaveBeenCalledWith(expect.objectContaining({ id: "review-1" }));
  });

  test("opens completed projects popup from completed section", () => {
    const onOpenCompletedProjectsPopup = vi.fn();

    render(
      <SidebarProjectsSection
        projects={{
          completed: project({
            id: "completed-1",
            name: "Completed Project",
            status: { label: "Completed", color: "#fff", bgColor: "#000", dotColor: "#fff" },
            completedAt: Date.UTC(2026, 1, 10),
          }),
        }}
        currentView="tasks"
        onNavigate={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={onOpenCompletedProjectsPopup}
      />,
    );

    fireEvent.click(screen.getByText("Completed"));

    expect(onOpenCompletedProjectsPopup).toHaveBeenCalledTimes(1);
  });
});
