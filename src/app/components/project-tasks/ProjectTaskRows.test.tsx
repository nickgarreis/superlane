/** @vitest-environment jsdom */

import React from "react";
import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import type { Task } from "../../types";
import { ProjectTaskRows } from "./ProjectTaskRows";

const { scrollToIndexMock } = vi.hoisted(() => ({
  scrollToIndexMock: vi.fn(),
}));

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: () => ({
    getTotalSize: () => 0,
    getVirtualItems: () => [],
    measureElement: vi.fn(),
    scrollToIndex: scrollToIndexMock,
  }),
}));

const createTask = (id: string): Task => ({
  id,
  title: `Task ${id}`,
  assignee: { name: "Alex", avatar: "" },
  completed: false,
  dueDateEpochMs: null,
});

describe("ProjectTaskRows", () => {
  beforeEach(() => {
    scrollToIndexMock.mockReset();
  });

  test("scrolls virtualized list to highlighted task index", async () => {
    const tasks = Array.from({ length: 81 }, (_, index) =>
      createTask(`task-${index}`),
    );
    const highlightedTaskId = "task-40";

    render(
      <div style={{ overflowY: "auto", maxHeight: 600 }}>
        <ProjectTaskRows
          initialTasks={tasks}
          sortedTasks={tasks}
          showProjectColumn={false}
          projectOptions={[]}
          assignableMembers={[]}
          openCalendarTaskId={null}
          setOpenCalendarTaskId={vi.fn()}
          calendarPosition={null}
          setCalendarPosition={vi.fn()}
          openAssigneeTaskId={null}
          setOpenAssigneeTaskId={vi.fn()}
          openProjectTaskId={null}
          setOpenProjectTaskId={vi.fn()}
          closeAllDropdowns={vi.fn()}
          handleToggle={vi.fn()}
          handleDelete={vi.fn()}
          handleDateSelect={vi.fn()}
          handleAssigneeSelect={vi.fn()}
          handleProjectSelect={vi.fn()}
          isAdding={false}
          highlightedTaskId={highlightedTaskId}
          taskRowRefs={{ current: {} }}
          editTaskDisabledMessage="Disabled"
          isTaskEditable={() => true}
        />
      </div>,
    );

    await waitFor(() => {
      expect(scrollToIndexMock).toHaveBeenCalledWith(40, {
        align: "center",
      });
    });
  });
});
