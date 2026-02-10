/** @vitest-environment jsdom */

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { FeedbackPopup } from "./FeedbackPopup";

const { toastSuccessMock } = vi.hoisted(() => ({
  toastSuccessMock: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

describe("FeedbackPopup", () => {
  beforeEach(() => {
    toastSuccessMock.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("does not render when closed", () => {
    render(<FeedbackPopup isOpen={false} type="feature" onClose={vi.fn()} />);
    expect(screen.queryByText("Request a feature")).not.toBeInTheDocument();
  });

  test("submits feature feedback and closes", async () => {
    vi.useFakeTimers();
    const onClose = vi.fn();

    render(<FeedbackPopup isOpen type="feature" onClose={onClose} />);

    fireEvent.change(screen.getByPlaceholderText("Brief summary of your idea"), {
      target: { value: "Need CSV export" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    expect(toastSuccessMock).toHaveBeenCalledWith("Feature request submitted — thank you!");
    expect(onClose).toHaveBeenCalled();
  });

  test("supports escape close and enter-to-description keyboard flow", () => {
    const onClose = vi.fn();
    render(<FeedbackPopup isOpen type="bug" onClose={onClose} />);

    const titleInput = screen.getByPlaceholderText("What went wrong?");
    const descriptionField = screen.getByPlaceholderText(
      "Steps to reproduce, what you expected to happen...",
    );

    fireEvent.keyDown(titleInput, { key: "Enter" });
    expect(descriptionField).toHaveFocus();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
