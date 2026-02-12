/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test, vi } from "vitest";
import { DraftPendingProjectsPopup } from "./DraftPendingProjectsPopup";
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
  tasks: args.tasks ?? [],
});

const buildProps = () => ({
  isOpen: true,
  onClose: vi.fn(),
  projects: {} as Record<string, ProjectData>,
  draftPendingProjectDetailId: null as string | null,
  draftPendingProjectDetailKind: null as "draft" | "pending" | null,
  onOpenProjectDetail: vi.fn(),
  onBackToDraftPendingProjects: vi.fn(),
  renderDetail: vi.fn(() => <div>Detail panel</div>),
});

describe("DraftPendingProjectsPopup", () => {
  test("does not render when closed", () => {
    const props = buildProps();

    render(
      <DraftPendingProjectsPopup
        {...props}
        isOpen={false}
      />,
    );

    expect(
      screen.queryByText("Drafts & Pending Projects"),
    ).not.toBeInTheDocument();
  });

  test("lists only non-archived draft/review projects and opens status-aware detail", () => {
    const props = buildProps();
    props.projects = {
      draft: buildProject({
        id: "draft",
        name: "Draft Scope",
        category: "Web",
        status: {
          label: "Draft",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
      }),
      review: buildProject({
        id: "review",
        name: "Review Scope",
        category: "Brand",
        status: {
          label: "Review",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
      }),
      active: buildProject({
        id: "active",
        name: "Active Scope",
        category: "App",
      }),
      archivedDraft: buildProject({
        id: "archived-draft",
        name: "Archived Draft",
        category: "Web",
        archived: true,
        status: {
          label: "Draft",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
      }),
    };

    render(<DraftPendingProjectsPopup {...props} />);

    expect(screen.getByText("2 projects waiting")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
    expect(screen.getByText("Draft Scope")).toBeInTheDocument();
    expect(screen.getByText("Review Scope")).toBeInTheDocument();
    expect(screen.queryByText("Active Scope")).not.toBeInTheDocument();
    expect(screen.queryByText("Archived Draft")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("Draft Scope"));
    expect(props.onOpenProjectDetail).toHaveBeenCalledWith("draft", "Draft");

    fireEvent.click(screen.getByText("Review Scope"));
    expect(props.onOpenProjectDetail).toHaveBeenCalledWith("review", "Review");

    fireEvent.change(screen.getByPlaceholderText("Search drafts and pending projects"), {
      target: { value: "missing" },
    });
    expect(
      screen.getByText("No matching draft or pending projects"),
    ).toBeInTheDocument();
  });

  test("renders detail mode and returns to list when selected project is no longer valid", async () => {
    const props = buildProps();
    props.projects = {
      draft: buildProject({
        id: "draft",
        name: "Draft Scope",
        category: "Web",
        status: {
          label: "Draft",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
      }),
    };
    props.draftPendingProjectDetailId = "draft";

    const { rerender } = render(<DraftPendingProjectsPopup {...props} />);

    expect(props.renderDetail).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Detail panel")).toBeInTheDocument();

    rerender(
      <DraftPendingProjectsPopup
        {...props}
        projects={{
          draft: buildProject({
            id: "draft",
            name: "Draft Scope",
            category: "Web",
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
      expect(props.onBackToDraftPendingProjects).toHaveBeenCalledTimes(1);
    });
  });

  test("canonicalizes detail route when kind mismatches project status", async () => {
    const props = buildProps();
    props.projects = {
      review: buildProject({
        id: "review",
        name: "Review Scope",
        category: "Brand",
        status: {
          label: "Review",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
      }),
    };
    props.draftPendingProjectDetailId = "review";
    props.draftPendingProjectDetailKind = "draft";

    render(<DraftPendingProjectsPopup {...props} />);

    await waitFor(() => {
      expect(props.onOpenProjectDetail).toHaveBeenCalledWith("review", "Review", {
        replace: true,
      });
    });
  });

  test("supports keyboard sorting on column headers", async () => {
    const props = buildProps();
    props.projects = {
      zulu: buildProject({
        id: "zulu",
        name: "Zulu Project",
        category: "Web",
        status: {
          label: "Draft",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
      }),
      alpha: buildProject({
        id: "alpha",
        name: "Alpha Project",
        category: "Brand",
        status: {
          label: "Draft",
          color: "#fff",
          bgColor: "#000",
          dotColor: "#fff",
        },
      }),
    };

    render(<DraftPendingProjectsPopup {...props} />);

    const user = userEvent.setup();
    const projectSortButton = screen.getByRole("button", { name: "Project" });
    projectSortButton.focus();
    await user.keyboard("{Enter}");
    expect(projectSortButton.querySelector(".lucide-arrow-up")).not.toBeNull();
  });
});
