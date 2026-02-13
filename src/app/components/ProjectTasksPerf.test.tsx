/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { ProjectTasks } from "./ProjectTasks";
import type { TaskProjectOption } from "./project-tasks/useProjectTaskHandlers";

const projectOptionsRefs: TaskProjectOption[][] = [];
const projectTaskRowsIsMobileValues: boolean[] = [];

vi.mock("./project-tasks/ProjectTaskRows", () => ({
  ProjectTaskRows: (props: {
    projectOptions: TaskProjectOption[];
    isMobile?: boolean;
  }) => {
    projectOptionsRefs.push(props.projectOptions);
    projectTaskRowsIsMobileValues.push(Boolean(props.isMobile));
    return <div data-testid="project-task-rows" />;
  },
}));

describe("ProjectTasks performance guards", () => {
  beforeEach(() => {
    projectOptionsRefs.length = 0;
    projectTaskRowsIsMobileValues.length = 0;
  });

  test("keeps default projectOptions reference stable across rerenders", () => {
    render(
      <ProjectTasks
        tasks={[
          {
            id: "task-1",
            title: "Task one",
            assignee: { userId: "user-1", name: "User One", avatar: "" },
            dueDateEpochMs: null,
            completed: false,
          },
        ]}
        onUpdateTasks={vi.fn()}
        assignableMembers={[
          {
            userId: "user-1",
            workosUserId: "workos-user-1",
            name: "User One",
            email: "user.one@example.com",
            avatarUrl: null,
            role: "member",
            isViewer: true,
          },
        ]}
        viewerIdentity={{
          userId: "user-1",
          workosUserId: "workos-user-1",
          name: "User One",
          email: "user.one@example.com",
          avatarUrl: null,
          role: "member",
        }}
        showProjectColumn
      />,
    );

    fireEvent.click(screen.getByTitle("Sort tasks"));

    expect(projectOptionsRefs.length).toBeGreaterThan(1);
    expect(projectOptionsRefs[0]).toBe(
      projectOptionsRefs[projectOptionsRefs.length - 1],
    );
  });

  test("keeps desktop row layout in mobile mode", () => {
    const { container } = render(
      <ProjectTasks
        isMobile
        tasks={[
          {
            id: "task-1",
            title: "Task one",
            assignee: { userId: "user-1", name: "User One", avatar: "" },
            dueDateEpochMs: null,
            completed: false,
          },
        ]}
        onUpdateTasks={vi.fn()}
        assignableMembers={[
          {
            userId: "user-1",
            workosUserId: "workos-user-1",
            name: "User One",
            email: "user.one@example.com",
            avatarUrl: null,
            role: "member",
            isViewer: true,
          },
        ]}
        viewerIdentity={{
          userId: "user-1",
          workosUserId: "workos-user-1",
          name: "User One",
          email: "user.one@example.com",
          avatarUrl: null,
          role: "member",
        }}
        showProjectColumn
      />,
    );

    expect(container.querySelector(".overflow-x-auto")).not.toBeNull();
    expect(projectTaskRowsIsMobileValues[0]).toBe(false);
  });
});
