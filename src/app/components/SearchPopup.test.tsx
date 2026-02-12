/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SearchPopup } from "./SearchPopup";
import type { ProjectData, ProjectFileData } from "../types";

const PROJECT: ProjectData = {
  id: "project-1",
  name: "Website Redesign",
  description: "Refresh the marketing site",
  creator: {
    name: "Owner",
    avatar: "",
  },
  status: {
    label: "Active",
    color: "#58AFFF",
    bgColor: "rgba(88,175,255,0.12)",
    dotColor: "#58AFFF",
  },
  category: "Web Design",
  archived: false,
  tasks: [
    {
      id: "task-1",
      title: "Draft homepage wireframe",
      assignee: {
        name: "Alex",
        avatar: "",
      },
      dueDateEpochMs: null,
      completed: false,
    },
  ],
};

const FILES: ProjectFileData[] = [
  {
    id: "file-1",
    projectPublicId: "project-1",
    tab: "Assets",
    name: "hero-logo.png",
    type: "PNG",
    displayDateEpochMs: 1700000000000,
    downloadable: true,
  },
];

describe("SearchPopup", () => {
  test("runs quick actions from default view", () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();

    render(
      <SearchPopup
        isOpen
        onClose={onClose}
        projects={{ [PROJECT.id]: PROJECT }}
        files={FILES}
        onNavigate={onNavigate}
        onOpenInbox={vi.fn()}
        onOpenCreateProject={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Go to Tasks"));

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("tasks");
  });

  test("finds task results and navigates with highlight", async () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();
    const onHighlightNavigate = vi.fn();

    render(
      <SearchPopup
        isOpen
        onClose={onClose}
        projects={{ [PROJECT.id]: PROJECT }}
        files={FILES}
        onNavigate={onNavigate}
        onOpenInbox={vi.fn()}
        onOpenCreateProject={vi.fn()}
        onOpenSettings={vi.fn()}
        onHighlightNavigate={onHighlightNavigate}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText(
        "Search projects, tasks, files, or actions...",
      ),
      { target: { value: "wireframe" } },
    );

    fireEvent.click(
      await screen.findByText(
        (_, element) =>
          element?.textContent?.trim() === "Draft homepage wireframe",
      ),
    );

    await waitFor(() => {
      expect(onNavigate).toHaveBeenCalledWith("project:project-1");
    });

    expect(onClose).toHaveBeenCalled();
    expect(onHighlightNavigate).toHaveBeenCalledWith("project-1", {
      type: "task",
      taskId: "task-1",
    });
  });

  test("supports keyboard navigation and enter activation", async () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();

    render(
      <SearchPopup
        isOpen
        onClose={onClose}
        projects={{ [PROJECT.id]: PROJECT }}
        files={FILES}
        onNavigate={onNavigate}
        onOpenInbox={vi.fn()}
        onOpenCreateProject={vi.fn()}
        onOpenSettings={vi.fn()}
      />,
    );

    const input = screen.getByPlaceholderText(
      "Search projects, tasks, files, or actions...",
    );

    fireEvent.change(input, { target: { value: "todo list" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith("tasks");
  });
});
