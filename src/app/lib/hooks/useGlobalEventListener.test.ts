/** @vitest-environment jsdom */

import { renderHook } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { useGlobalEventListener } from "./useGlobalEventListener";

describe("useGlobalEventListener", () => {
  test("registers listener, uses latest callback, and cleans up on unmount", () => {
    const target = new EventTarget();
    const firstListener = vi.fn();
    const secondListener = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ listener }) =>
        useGlobalEventListener({
          target,
          type: "test-event",
          listener,
        }),
      {
        initialProps: { listener: firstListener },
      },
    );

    target.dispatchEvent(new Event("test-event"));
    expect(firstListener).toHaveBeenCalledTimes(1);

    rerender({ listener: secondListener });

    target.dispatchEvent(new Event("test-event"));
    expect(firstListener).toHaveBeenCalledTimes(1);
    expect(secondListener).toHaveBeenCalledTimes(1);

    unmount();
    target.dispatchEvent(new Event("test-event"));
    expect(secondListener).toHaveBeenCalledTimes(1);
  });

  test("does not resubscribe when options object identity changes without value changes", () => {
    const addEventListener = vi.fn();
    const removeEventListener = vi.fn();
    const target = {
      addEventListener,
      removeEventListener,
    } as unknown as EventTarget;
    const listener = vi.fn();

    const { rerender, unmount } = renderHook(
      ({ options }: { options: AddEventListenerOptions }) =>
        useGlobalEventListener({
          target,
          type: "test-event",
          listener,
          options,
        }),
      {
        initialProps: { options: { passive: true } },
      },
    );

    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledTimes(0);

    rerender({ options: { passive: true } });
    expect(addEventListener).toHaveBeenCalledTimes(1);
    expect(removeEventListener).toHaveBeenCalledTimes(0);

    rerender({ options: { passive: false } });
    expect(addEventListener).toHaveBeenCalledTimes(2);
    expect(removeEventListener).toHaveBeenCalledTimes(1);

    unmount();
    expect(removeEventListener).toHaveBeenCalledTimes(2);
  });

  test("supports ref targets and rebinds when ref current changes", () => {
    const firstTarget = new EventTarget();
    const secondTarget = new EventTarget();
    const addFirst = vi.spyOn(firstTarget, "addEventListener");
    const removeFirst = vi.spyOn(firstTarget, "removeEventListener");
    const addSecond = vi.spyOn(secondTarget, "addEventListener");
    const removeSecond = vi.spyOn(secondTarget, "removeEventListener");
    const listener = vi.fn();
    const targetRef: { current: EventTarget | null } = { current: firstTarget };

    const { rerender, unmount } = renderHook(() =>
      useGlobalEventListener({
        target: targetRef,
        type: "test-event",
        listener,
        enabled: true,
      }),
    );

    expect(addFirst).toHaveBeenCalledTimes(1);
    expect(addSecond).toHaveBeenCalledTimes(0);

    targetRef.current = secondTarget;
    rerender();

    expect(removeFirst).toHaveBeenCalledTimes(1);
    expect(addSecond).toHaveBeenCalledTimes(1);

    firstTarget.dispatchEvent(new Event("test-event"));
    expect(listener).toHaveBeenCalledTimes(0);

    secondTarget.dispatchEvent(new Event("test-event"));
    expect(listener).toHaveBeenCalledTimes(1);

    unmount();
    expect(removeSecond).toHaveBeenCalledTimes(1);
  });
});
