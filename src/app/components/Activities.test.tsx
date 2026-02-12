/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Activities } from "./Activities";
import type { WorkspaceActivity } from "../types";

const buildActivity = (
  overrides: Partial<WorkspaceActivity>,
): WorkspaceActivity => ({
  id: overrides.id ?? "activity-1",
  kind: overrides.kind ?? "project",
  action: overrides.action ?? "created",
  actorType: overrides.actorType ?? "user",
  actorUserId: overrides.actorUserId ?? "user-1",
  actorName: overrides.actorName ?? "Alex",
  actorAvatarUrl: overrides.actorAvatarUrl ?? null,
  projectPublicId: overrides.projectPublicId ?? "project-1",
  projectName: overrides.projectName ?? "Website Redesign",
  projectVisibility: overrides.projectVisibility ?? "workspace",
  projectOwnerUserId: overrides.projectOwnerUserId ?? "user-1",
  taskId: overrides.taskId ?? null,
  taskTitle: overrides.taskTitle ?? null,
  fileName: overrides.fileName ?? null,
  fileTab: overrides.fileTab ?? null,
  targetUserId: overrides.targetUserId ?? null,
  targetUserName: overrides.targetUserName ?? null,
  targetRole: overrides.targetRole ?? null,
  fromValue: overrides.fromValue ?? null,
  toValue: overrides.toValue ?? null,
  message: overrides.message ?? null,
  errorCode: overrides.errorCode ?? null,
  createdAt: overrides.createdAt ?? Date.now(),
});

describe("Activities", () => {
  test("supports search and kind filters", () => {
    const activities: WorkspaceActivity[] = [
      buildActivity({
        id: "project-activity",
        kind: "project",
        action: "created",
        projectName: "Website Redesign",
      }),
      buildActivity({
        id: "task-activity",
        kind: "task",
        action: "completed",
        taskTitle: "Finalize hero section",
      }),
      buildActivity({
        id: "file-activity",
        kind: "file",
        action: "uploaded",
        fileName: "creative-brief.pdf",
        fileTab: "Assets",
      }),
    ];

    render(
      <Activities
        onToggleSidebar={vi.fn()}
        activities={activities}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    expect(screen.getByText("Created project Website Redesign")).toBeInTheDocument();
    expect(screen.getByText("Completed task Finalize hero section")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search activities"), {
      target: { value: "creative-brief" },
    });
    expect(screen.getByText("Uploaded creative-brief.pdf")).toBeInTheDocument();
    expect(
      screen.queryByText("Completed task Finalize hero section"),
    ).not.toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search activities"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTitle("Filter activities"));
    fireEvent.click(screen.getByRole("button", { name: "Tasks" }));

    expect(screen.getByText("Completed task Finalize hero section")).toBeInTheDocument();
    expect(
      screen.queryByText("Created project Website Redesign"),
    ).not.toBeInTheDocument();
  });

  test("loads more items when scrolling near the end", () => {
    const loadMoreWorkspaceActivities = vi.fn();
    const activities: WorkspaceActivity[] = [
      buildActivity({ id: "activity-scroll", kind: "workspace", action: "workspace_general_updated" }),
    ];

    const { container } = render(
      <Activities
        onToggleSidebar={vi.fn()}
        activities={activities}
        activitiesPaginationStatus="CanLoadMore"
        loadMoreWorkspaceActivities={loadMoreWorkspaceActivities}
      />,
    );

    const scrollContainer = container.querySelector(".overflow-y-auto");
    expect(scrollContainer).not.toBeNull();
    if (!scrollContainer) {
      throw new Error("Expected scroll container");
    }
    Object.defineProperty(scrollContainer, "scrollHeight", {
      configurable: true,
      value: 1400,
    });
    Object.defineProperty(scrollContainer, "clientHeight", {
      configurable: true,
      value: 900,
    });
    Object.defineProperty(scrollContainer, "scrollTop", {
      configurable: true,
      value: 280,
      writable: true,
    });

    fireEvent.scroll(scrollContainer);

    expect(loadMoreWorkspaceActivities).toHaveBeenCalledWith(100);
  });

  test("shows empty state when there are no activities", () => {
    render(
      <Activities
        onToggleSidebar={vi.fn()}
        activities={[]}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    expect(screen.getByText("No activities found")).toBeInTheDocument();
  });
});
