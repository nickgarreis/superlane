/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CompletedProjectsPopup } from "./CompletedProjectsPopup";
import type { ProjectData } from "../types";

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
  completedAt: args.completedAt ?? null,
  tasks: args.tasks ?? [],
});

describe("CompletedProjectsPopup", () => {
  test("does not render when closed", () => {
    render(
      <CompletedProjectsPopup
        isOpen={false}
        onClose={vi.fn()}
        projects={{}}
        viewerRole="owner"
        onNavigateToProject={vi.fn()}
        onUncompleteProject={vi.fn()}
      />,
    );

    expect(screen.queryByText("Completed Projects")).not.toBeInTheDocument();
  });

  test("filters/sorts projects and blocks lifecycle action when denied", () => {
    const onClose = vi.fn();
    const onNavigateToProject = vi.fn();
    const onUncompleteProject = vi.fn();

    render(
      <CompletedProjectsPopup
        isOpen
        onClose={onClose}
        projects={{
          "project-1": buildProject({
            id: "project-1",
            name: "Brand Refresh",
            category: "Brand",
            status: {
              label: "Completed",
              color: "#fff",
              bgColor: "#000",
              dotColor: "#fff",
            },
            completedAt: Date.now(),
          }),
          "project-2": buildProject({
            id: "project-2",
            name: "Active Landing",
            category: "Web",
          }),
        }}
        viewerRole="member"
        onNavigateToProject={onNavigateToProject}
        onUncompleteProject={onUncompleteProject}
      />,
    );

    fireEvent.click(screen.getByText("Brand Refresh"));
    expect(onNavigateToProject).toHaveBeenCalledWith("project-1");
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTitle("Revert to Active"));
    expect(onUncompleteProject).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText("Project"));
    fireEvent.click(screen.getByText("Project"));

    fireEvent.change(screen.getByPlaceholderText("Search completed projects"), {
      target: { value: "missing" },
    });
    expect(
      screen.getByText("No matching completed projects"),
    ).toBeInTheDocument();
  });

  test("allows reverting lifecycle when viewer can manage completed projects", () => {
    const onUncompleteProject = vi.fn();

    render(
      <CompletedProjectsPopup
        isOpen
        onClose={vi.fn()}
        projects={{
          "project-1": buildProject({
            id: "project-1",
            name: "Brand Refresh",
            category: "Brand",
            status: {
              label: "Completed",
              color: "#fff",
              bgColor: "#000",
              dotColor: "#fff",
            },
            completedAt: Date.now(),
          }),
        }}
        viewerRole="owner"
        onNavigateToProject={vi.fn()}
        onUncompleteProject={onUncompleteProject}
      />,
    );

    fireEvent.click(screen.getByTitle("Revert to Active"));
    expect(onUncompleteProject).toHaveBeenCalledWith("project-1");
  });
});
