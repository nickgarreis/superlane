/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { PendingHighlight } from "../../dashboard/types";
import type { ProjectFileData, Task } from "../../types";
import { useMainContentHighlighting } from "./useMainContentHighlighting";

const { toastErrorMock } = vi.hoisted(() => ({
  toastErrorMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
  },
}));

const TASK_MISSING_MESSAGE =
  "Task could not be found. It may have been moved or deleted.";

type HookProps = {
  projectId: string;
  tasks: Task[];
  projectFiles: ProjectFileData[];
  pendingHighlight?: PendingHighlight | null;
  onClearPendingHighlight: () => void;
  setActiveTab: (tab: "Assets" | "Contract" | "Attachments") => void;
};

const createTask = (id: string): Task => ({
  id,
  title: `Task ${id}`,
  assignee: { name: "Alex", avatar: "" },
  completed: false,
  dueDateEpochMs: null,
});

const createFile = (id: string, tab: "Assets" | "Contract" | "Attachments") => ({
  id,
  projectPublicId: "project-1",
  tab,
  name: "agreement.pdf",
  type: "PDF",
  displayDateEpochMs: 1700000000000,
});

describe("useMainContentHighlighting", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("waits for task data before applying and clearing pending highlight", async () => {
    const onClearPendingHighlight = vi.fn();
    const setActiveTab = vi.fn();
    const pendingHighlight: PendingHighlight = {
      projectId: "project-1",
      type: "task",
      taskId: "task-1",
    };

    const { result, rerender } = renderHook(
      (props: HookProps) => useMainContentHighlighting(props),
      {
        initialProps: {
          projectId: "project-1",
          tasks: [],
          projectFiles: [],
          pendingHighlight,
          onClearPendingHighlight,
          setActiveTab,
        },
      },
    );

    expect(result.current.highlightedTaskId).toBeNull();
    expect(onClearPendingHighlight).not.toHaveBeenCalled();

    act(() => {
      rerender({
        projectId: "project-1",
        tasks: [createTask("task-1")],
        projectFiles: [],
        pendingHighlight,
        onClearPendingHighlight,
        setActiveTab,
      });
    });
    expect(result.current.highlightedTaskId).toBe("task-1");
    expect(onClearPendingHighlight).not.toHaveBeenCalled();

    act(() => {
      result.current.handleTaskHighlightDone({ status: "applied" });
    });

    expect(onClearPendingHighlight).toHaveBeenCalledTimes(1);
    expect(result.current.highlightedTaskId).toBeNull();
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  test("waits for file data and clears pending highlight after flash lifecycle", async () => {
    const onClearPendingHighlight = vi.fn();
    const setActiveTab = vi.fn();
    const pendingHighlight: PendingHighlight = {
      projectId: "project-1",
      type: "file",
      fileName: "agreement.pdf",
      fileTab: "Contract",
    };

    const { result, rerender } = renderHook(
      (props: HookProps) => useMainContentHighlighting(props),
      {
        initialProps: {
          projectId: "project-1",
          tasks: [],
          projectFiles: [],
          pendingHighlight,
          onClearPendingHighlight,
          setActiveTab,
        },
      },
    );

    act(() => {
      rerender({
        projectId: "project-1",
        tasks: [],
        projectFiles: [createFile("file-1", "Contract")],
        pendingHighlight,
        onClearPendingHighlight,
        setActiveTab,
      });
    });
    expect(result.current.highlightedFileId).toBe("file-1");

    const fileRow = document.createElement("div");
    result.current.fileRowRefs.current["file-1"] = fileRow;

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(fileRow.classList.contains("file-row-flash")).toBe(true);
    expect(onClearPendingHighlight).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(onClearPendingHighlight).toHaveBeenCalledTimes(1);
    expect(result.current.highlightedFileId).toBeNull();
    expect(setActiveTab).toHaveBeenCalledWith("Contract");
    expect(toastErrorMock).not.toHaveBeenCalled();
  });

  test("emits toast and clears pending highlight when data never resolves", () => {
    const onClearPendingHighlight = vi.fn();
    const setActiveTab = vi.fn();

    renderHook(() =>
      useMainContentHighlighting({
        projectId: "project-1",
        tasks: [],
        projectFiles: [],
        pendingHighlight: {
          projectId: "project-1",
          type: "task",
          taskId: "missing-task",
        },
        onClearPendingHighlight,
        setActiveTab,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(onClearPendingHighlight).toHaveBeenCalledTimes(1);
    expect(toastErrorMock).toHaveBeenCalledWith(TASK_MISSING_MESSAGE);
  });
});
