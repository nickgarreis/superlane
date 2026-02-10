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
});
