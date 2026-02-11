/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const buildProps = () => ({
  isOpen: true,
  onClose: vi.fn(),
  projects: {},
  viewerRole: "owner" as const,
  completedProjectDetailId: null as string | null,
  onOpenProjectDetail: vi.fn(),
  onBackToCompletedProjects: vi.fn(),
  onUncompleteProject: vi.fn(),
  renderDetail: vi.fn(() => <div>Detail</div>),
});

describe("CompletedProjectsPopup", () => {
  test("does not render when closed", () => {
    const props = buildProps();

    render(
      <CompletedProjectsPopup
        {...props}
        isOpen={false}
      />,
    );

    expect(screen.queryByText("Completed Projects")).not.toBeInTheDocument();
  });

  test("filters/sorts projects and blocks lifecycle action when denied", () => {
    const props = buildProps();
    props.viewerRole = "member";
    props.projects = {
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
    };

    render(<CompletedProjectsPopup {...props} />);

    fireEvent.click(screen.getByText("Brand Refresh"));
    expect(props.onOpenProjectDetail).toHaveBeenCalledWith("project-1");
    expect(props.onClose).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTitle("Revert to Active"));
    expect(props.onUncompleteProject).not.toHaveBeenCalled();

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
    const props = buildProps();
    props.projects = {
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
    };

    render(<CompletedProjectsPopup {...props} />);

    fireEvent.click(screen.getByTitle("Revert to Active"));
    expect(props.onUncompleteProject).toHaveBeenCalledWith("project-1");
  });

  test("renders detail mode and returns to list when selected project is no longer valid", async () => {
    const props = buildProps();
    props.projects = {
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
    };
    props.completedProjectDetailId = "project-1";
    props.renderDetail = vi.fn(() => <div>Detail panel</div>);

    const { rerender } = render(<CompletedProjectsPopup {...props} />);

    expect(props.renderDetail).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Detail panel")).toBeInTheDocument();

    rerender(
      <CompletedProjectsPopup
        {...props}
        projects={{
          "project-1": buildProject({
            id: "project-1",
            name: "Brand Refresh",
            category: "Brand",
            status: {
              label: "Active",
              color: "#fff",
              bgColor: "#000",
              dotColor: "#fff",
            },
          }),
        }}
      />,
    );

    await waitFor(() => {
      expect(props.onBackToCompletedProjects).toHaveBeenCalledTimes(1);
    });
  });
});
