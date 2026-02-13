/** @vitest-environment jsdom */

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
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
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    const refWarnings = consoleErrorSpy.mock.calls
      .map((args) => args.map((arg) => String(arg)).join(" "))
      .filter((message) => message.includes("`ref` is not a prop"));
    try {
      expect(refWarnings).toHaveLength(0);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

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

    expect(
      screen.queryByPlaceholderText("What needs to be done?"),
    ).not.toBeInTheDocument();
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

  test("dims task titles and checkboxes when editing is disabled", () => {
    const onUpdateTasks = vi.fn();
    const completedTask: Task = {
      ...TASKS[0],
      id: "task-2",
      title: "Finalize QA pass",
      completed: true,
    };

    render(
      <ProjectTasks
        tasks={[TASKS[0], completedTask]}
        onUpdateTasks={onUpdateTasks}
        assignableMembers={MEMBERS}
        viewerIdentity={VIEWER}
        canEditTasks={false}
      />,
    );

    const openTaskTitle = screen.getByText("Draft hero section");
    expect(openTaskTitle).toHaveClass("text-white/40");
    const openTaskCheckbox = openTaskTitle.previousElementSibling;
    expect(openTaskCheckbox).not.toBeNull();
    expect(openTaskCheckbox).toHaveClass("opacity-50");

    const completedTaskTitle = screen.getByText("Finalize QA pass");
    expect(completedTaskTitle).toHaveClass("text-white/30", "line-through");
    const completedTaskCheckbox = completedTaskTitle.previousElementSibling;
    expect(completedTaskCheckbox).not.toBeNull();
    expect(completedTaskCheckbox).toHaveClass("bg-white/15", "opacity-60");
    expect(completedTaskCheckbox).not.toHaveClass("bg-text-tone-accent");
  });

  test("reports missing highlight after retry timeout", () => {
    const onHighlightDone = vi.fn();
    vi.useFakeTimers();
    try {
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

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(onHighlightDone).toHaveBeenCalledTimes(1);
      expect(onHighlightDone).toHaveBeenCalledWith({ status: "missing" });
    } finally {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
  });

  test("applies highlight when task row mounts during retry window", () => {
    const onHighlightDone = vi.fn();
    vi.useFakeTimers();
    try {
      const { rerender } = render(
        <ProjectTasks
          tasks={[]}
          onUpdateTasks={vi.fn()}
          assignableMembers={MEMBERS}
          viewerIdentity={VIEWER}
          highlightedTaskId="task-1"
          onHighlightDone={onHighlightDone}
        />,
      );

      act(() => {
        vi.advanceTimersByTime(200);
      });
      expect(onHighlightDone).not.toHaveBeenCalled();

      rerender(
        <ProjectTasks
          tasks={TASKS}
          onUpdateTasks={vi.fn()}
          assignableMembers={MEMBERS}
          viewerIdentity={VIEWER}
          highlightedTaskId="task-1"
          onHighlightDone={onHighlightDone}
        />,
      );

      act(() => {
        vi.advanceTimersByTime(50);
      });
      expect(onHighlightDone).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(1600);
      });
      expect(onHighlightDone).toHaveBeenCalledTimes(1);
      expect(onHighlightDone).toHaveBeenCalledWith({ status: "applied" });
    } finally {
      vi.runOnlyPendingTimers();
      vi.useRealTimers();
    }
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
        projectOptions={[
          { id: "project-2", name: "Mobile Refresh", category: "Product" },
        ]}
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
