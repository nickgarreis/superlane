/** @vitest-environment jsdom */

import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useTaskHighlight } from "./useTaskHighlight";

describe("useTaskHighlight", () => {
  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  test("polls until task row mounts and reports applied", () => {
    vi.useFakeTimers();
    const onHighlightDone = vi.fn();
    const taskRowRefs = {
      current: {} as Record<string, HTMLDivElement | null>,
    };

    renderHook(() =>
      useTaskHighlight({
        highlightedTaskId: "task-1",
        onHighlightDone,
        taskRowRefs,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(onHighlightDone).not.toHaveBeenCalled();

    const row = document.createElement("div");
    taskRowRefs.current["task-1"] = row;

    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(row.classList.contains("task-row-flash")).toBe(true);
    expect(onHighlightDone).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(onHighlightDone).toHaveBeenCalledTimes(1);
    expect(onHighlightDone).toHaveBeenCalledWith({ status: "applied" });
  });

  test("reports missing when row does not mount before timeout", () => {
    vi.useFakeTimers();
    const onHighlightDone = vi.fn();
    const taskRowRefs = {
      current: {} as Record<string, HTMLDivElement | null>,
    };

    renderHook(() =>
      useTaskHighlight({
        highlightedTaskId: "missing-task",
        onHighlightDone,
        taskRowRefs,
      }),
    );

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onHighlightDone).toHaveBeenCalledTimes(1);
    expect(onHighlightDone).toHaveBeenCalledWith({ status: "missing" });
  });
});
