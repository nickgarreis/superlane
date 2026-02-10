/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Tasks } from "./Tasks";
import type { ProjectData, Task, ViewerIdentity, WorkspaceMember } from "../types";

const { projectTasksRenderMock } = vi.hoisted(() => ({
  projectTasksRenderMock: vi.fn(),
}));

vi.mock("../../imports/HorizontalBorder", () => ({
  default: ({ onToggleSidebar }: { onToggleSidebar: () => void }) => (
    <button type="button" onClick={onToggleSidebar}>Toggle</button>
  ),
}));

vi.mock("./ProjectLogo", () => ({
  ProjectLogo: ({ category }: { category: string }) => <span data-testid="project-logo">{category}</span>,
}));

vi.mock("./ProjectTasks", () => ({
  ProjectTasks: (props: {
    tasks: Task[];
    isAddingMode?: boolean;
    onUpdateTasks: (tasks: Task[]) => void;
  }) => {
    projectTasksRenderMock(props);

    return (
      <div>
        <div data-testid="task-count">{props.tasks.length}</div>
        <div data-testid="adding-flag">{props.isAddingMode ? "true" : "false"}</div>
        <button
          type="button"
          onClick={() => {
            props.onUpdateTasks([
              ...props.tasks.map((task) => task.id === "task-1" ? { ...task, title: "Design Homepage Updated" } : task),
              {
                id: "task-new",
                title: "New Imported Task",
                projectId: "archived-1",
                assignee: { name: "Alex", avatar: "" },
                dueDateEpochMs: null,
                completed: false,
              },
            ]);
          }}
        >
          Emit update
        </button>
      </div>
    );
  },
}));

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

const buildProject = (args: Partial<ProjectData> & Pick<ProjectData, "id" | "name" | "category">): ProjectData => ({
  id: args.id,
  name: args.name,
  category: args.category,
  archived: args.archived ?? false,
  description: args.description ?? "",
  creator: args.creator ?? { name: "Owner", avatar: "" },
  status: args.status ?? {
    label: "Active",
    color: "#58AFFF",
    bgColor: "rgba(88,175,255,0.12)",
    dotColor: "#58AFFF",
  },
  tasks: args.tasks ?? [],
  completedAt: args.completedAt ?? null,
  workspaceId: args.workspaceId,
  workspaceSlug: args.workspaceSlug,
  archivedAt: args.archivedAt,
  deletedAt: args.deletedAt,
  reviewComments: args.reviewComments,
  scope: args.scope,
});

describe("Tasks", () => {
  test("filters tasks by search and project and toggles add mode", async () => {
    const projects: Record<string, ProjectData> = {
      "active-1": buildProject({ id: "active-1", name: "Active One", category: "Web" }),
      "active-2": buildProject({ id: "active-2", name: "Active Two", category: "Brand" }),
      "archived-1": buildProject({
        id: "archived-1",
        name: "Archived One",
        category: "Legacy",
        archived: true,
      }),
    };

    const workspaceTasks: Task[] = [
      {
        id: "task-1",
        title: "Design homepage",
        projectId: "active-1",
        assignee: { name: "Alex", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
      },
      {
        id: "task-2",
        title: "Legacy cleanup",
        projectId: "archived-1",
        assignee: { name: "Alex", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
      },
      {
        id: "task-3",
        title: "General ops",
        assignee: { name: "Alex", avatar: "" },
        dueDateEpochMs: null,
        completed: false,
      },
    ];

    render(
      <Tasks
        onToggleSidebar={vi.fn()}
        isSidebarOpen
        projects={projects}
        workspaceTasks={workspaceTasks}
        onUpdateWorkspaceTasks={vi.fn()}
        workspaceMembers={MEMBERS}
        viewerIdentity={VIEWER}
      />,
    );

    expect(screen.getByTestId("task-count")).toHaveTextContent("3");

    fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
      target: { value: "design" },
    });

    await waitFor(() => {
      expect(screen.getByTestId("task-count")).toHaveTextContent("1");
    });

    fireEvent.change(screen.getByPlaceholderText("Search tasks"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTitle("Filter by project"));
    fireEvent.click(screen.getByText("Active Two"));

    await waitFor(() => {
      expect(screen.getByTestId("task-count")).toHaveTextContent("0");
    });

    fireEvent.click(screen.getByRole("button", { name: /add task/i }));
    expect(screen.getByTestId("adding-flag")).toHaveTextContent("true");
  });

  test("normalizes workspace task updates against active project ids", async () => {
    const onUpdateWorkspaceTasks = vi.fn();

    const projects: Record<string, ProjectData> = {
      "active-1": buildProject({ id: "active-1", name: "Active One", category: "Web" }),
      "archived-1": buildProject({
        id: "archived-1",
        name: "Archived One",
        category: "Legacy",
        archived: true,
      }),
    };

    render(
      <Tasks
        onToggleSidebar={vi.fn()}
        isSidebarOpen
        projects={projects}
        workspaceTasks={[
          {
            id: "task-1",
            title: "Design homepage",
            projectId: "active-1",
            assignee: { name: "Alex", avatar: "" },
            dueDateEpochMs: null,
            completed: false,
          },
          {
            id: "task-2",
            title: "Legacy cleanup",
            projectId: "archived-1",
            assignee: { name: "Alex", avatar: "" },
            dueDateEpochMs: null,
            completed: false,
          },
        ]}
        onUpdateWorkspaceTasks={onUpdateWorkspaceTasks}
        workspaceMembers={MEMBERS}
        viewerIdentity={VIEWER}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Emit update" }));

    await waitFor(() => {
      expect(onUpdateWorkspaceTasks).toHaveBeenCalledTimes(1);
    });

    const updatedTasks = onUpdateWorkspaceTasks.mock.calls[0][0] as Task[];
    expect(updatedTasks).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "task-1", title: "Design Homepage Updated", projectId: "active-1" }),
        expect.objectContaining({ id: "task-2", projectId: undefined }),
        expect.objectContaining({ id: "task-new", projectId: undefined }),
      ]),
    );
  });
});
