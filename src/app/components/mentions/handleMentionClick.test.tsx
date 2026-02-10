/** @vitest-environment jsdom */

import type React from "react";
import { describe, expect, test, vi } from "vitest";
import { handleMentionClick } from "./handleMentionClick";

describe("handleMentionClick", () => {
  test("resolves mention metadata and calls onMentionClick", () => {
    const rootElement = document.createElement("div");
    const mentionElement = document.createElement("span");
    mentionElement.dataset.mention = "@[task:Ship launch assets]";
    rootElement.appendChild(mentionElement);

    Object.defineProperty(mentionElement, "offsetWidth", {
      configurable: true,
      value: 64,
    });

    const preventDefault = vi.fn();
    const stopPropagation = vi.fn();
    const onMentionClick = vi.fn();

    handleMentionClick({
      event: {
        target: mentionElement,
        preventDefault,
        stopPropagation,
      } as unknown as React.MouseEvent<HTMLDivElement>,
      rootElement,
      onMentionClick,
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(stopPropagation).toHaveBeenCalledTimes(1);
    expect(mentionElement.classList.contains("mention-badge-pulse")).toBe(true);
    expect(onMentionClick).toHaveBeenCalledWith("task", "Ship launch assets");
  });

  test("returns early when callback is not provided", () => {
    const rootElement = document.createElement("div");
    const mentionElement = document.createElement("span");
    mentionElement.dataset.mention = "@[user:Alex]";
    rootElement.appendChild(mentionElement);

    expect(() =>
      handleMentionClick({
        event: {
          target: mentionElement,
          preventDefault: vi.fn(),
          stopPropagation: vi.fn(),
        } as unknown as React.MouseEvent<HTMLDivElement>,
        rootElement,
      }),
    ).not.toThrow();
  });
});
