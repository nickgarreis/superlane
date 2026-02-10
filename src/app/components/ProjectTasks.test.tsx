/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { ProjectTasks } from "./ProjectTasks";
import type { Task, ViewerIdentity, WorkspaceMember } from "../types";

const VIEWER: ViewerIdentity = {
  userId: "user-1",
  workosUserId: "workos-1",
  name: "Alex",
  email: "alex@example.com",
  avatarUrl: null,
  role: "owner",
};

const MEMBERS: WorkspaceMember[] = [
  {
    userId: "user-1",
    workosUserId: "workos-1",
    name: "Alex",
    email: "alex@example.com",
    avatarUrl: null,
    role: "owner",
    isViewer: true,
  },
];

const TASKS: Task[] = [
  {
    id: "task-1",
    title: "Draft hero section",
    assignee: {
      name: "Alex",
      avatar: "",
    },
    completed: false,
    dueDateEpochMs: null,
  },
];

describe("ProjectTasks", () => {
  test("creates a task when pressing Enter in add mode", () => {
    const onUpdateTasks = vi.fn();

    render(
      <ProjectTasks
        tasks={[]}
        onUpdateTasks={onUpdateTasks}
        assignableMembers={MEMBERS}
        viewerIdentity={VIEWER}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add task/i }));

    const input = screen.getByPlaceholderText("What needs to be done?");
    fireEvent.change(input, { target: { value: "Ship QA fixes" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onUpdateTasks).toHaveBeenCalledTimes(1);
    expect(onUpdateTasks).toHaveBeenCalledWith([
      expect.objectContaining({
        title: "Ship QA fixes",
        completed: false,
      }),
    ]);
  });

  test("does not open add mode when task creation is disabled", () => {
    const onUpdateTasks = vi.fn();

    render(
      <ProjectTasks
        tasks={[]}
        onUpdateTasks={onUpdateTasks}
        assignableMembers={MEMBERS}
        viewerIdentity={VIEWER}
        canAddTasks={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add task/i }));

    expect(screen.queryByPlaceholderText("What needs to be done?")).not.toBeInTheDocument();
    expect(onUpdateTasks).not.toHaveBeenCalled();
  });

  test("prevents task edits when editing is disabled", () => {
    const onUpdateTasks = vi.fn();

    render(
      <ProjectTasks
        tasks={TASKS}
        onUpdateTasks={onUpdateTasks}
        assignableMembers={MEMBERS}
        viewerIdentity={VIEWER}
        canEditTasks={false}
      />,
    );

    fireEvent.click(screen.getByText("Draft hero section"));

    expect(onUpdateTasks).not.toHaveBeenCalled();
  });

  test("clears missing highlight immediately", async () => {
    const onHighlightDone = vi.fn();

    render(
      <ProjectTasks
        tasks={[]}
        onUpdateTasks={vi.fn()}
        assignableMembers={MEMBERS}
        viewerIdentity={VIEWER}
        highlightedTaskId="missing-task"
        onHighlightDone={onHighlightDone}
      />,
    );

    await waitFor(() => {
      expect(onHighlightDone).toHaveBeenCalledTimes(1);
    });
  });

  test("toggles completion and deletes tasks when editable", () => {
    const onUpdateTasks = vi.fn();

    render(
      <ProjectTasks
        tasks={TASKS}
        onUpdateTasks={onUpdateTasks}
        assignableMembers={MEMBERS}
        viewerIdentity={VIEWER}
      />,
    );

    fireEvent.click(screen.getByText("Draft hero section"));
    fireEvent.click(screen.getByTitle("Delete task"));

    expect(onUpdateTasks).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "task-1",
        completed: true,
      }),
    ]);
    expect(onUpdateTasks).toHaveBeenCalledWith([]);
  });

  test("updates project and assignee through row dropdowns", () => {
    const onUpdateTasks = vi.fn();
    const members: WorkspaceMember[] = [
      ...MEMBERS,
      {
        userId: "user-2",
        workosUserId: "workos-2",
        name: "Taylor",
        email: "taylor@example.com",
        avatarUrl: null,
        role: "member",
        isViewer: false,
      },
    ];

    render(
      <ProjectTasks
        tasks={TASKS}
        onUpdateTasks={onUpdateTasks}
        assignableMembers={members}
        viewerIdentity={VIEWER}
        showProjectColumn
        projectOptions={[{ id: "project-2", name: "Mobile Refresh", category: "Product" }]}
      />,
    );

    fireEvent.click(screen.getByText("No project"));
    fireEvent.click(screen.getByText("Mobile Refresh"));

    fireEvent.click(screen.getByTitle("Alex"));
    fireEvent.click(screen.getByText("Taylor"));

    expect(onUpdateTasks).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "task-1",
        projectId: "project-2",
      }),
    ]);
    expect(onUpdateTasks).toHaveBeenCalledWith([
      expect.objectContaining({
        id: "task-1",
        assignee: expect.objectContaining({
          name: "Taylor",
        }),
      }),
    ]);
  });
});
