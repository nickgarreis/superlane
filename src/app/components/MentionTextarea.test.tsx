/** @vitest-environment jsdom */

import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { MentionTextarea, renderCommentContent, type MentionItem } from "./MentionTextarea";

const mentionItems: MentionItem[] = [
  { type: "task", id: "task-1", label: "Task Alpha" },
  { type: "file", id: "file-1", label: "File Bravo", meta: "PDF" },
  { type: "user", id: "user-1", label: "Casey User", meta: "Owner" },
];

function setSelectionAtEnd(element: HTMLElement) {
  if (!element.firstChild) {
    element.appendChild(document.createTextNode(""));
  }
  const textNode = element.firstChild as Text;
  const range = document.createRange();
  range.setStart(textNode, textNode.textContent?.length ?? 0);
  range.collapse(true);

  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
}

function ControlledMentionTextarea({
  initialValue = "",
  onMentionClick,
}: {
  initialValue?: string;
  onMentionClick?: (type: "task" | "file" | "user", label: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <>
      <MentionTextarea
        value={value}
        onChange={setValue}
        items={mentionItems}
        placeholder="Type"
        onMentionClick={onMentionClick}
        className="min-h-[24px]"
      />
      <div data-testid="mention-value">{value}</div>
    </>
  );
}

describe("MentionTextarea", () => {
  test("supports keyboard selection from mention dropdown", async () => {
    render(<ControlledMentionTextarea initialValue="" />);

    const editor = screen.getByRole("textbox");
    fireEvent.focus(editor);
    editor.textContent = "@";
    setSelectionAtEnd(editor);

    fireEvent.input(editor);

    await waitFor(() => {
      expect(screen.getByText("Task Alpha")).toBeInTheDocument();
    });

    fireEvent.keyDown(editor, { key: "ArrowDown" });
    fireEvent.keyDown(editor, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByTestId("mention-value")).toHaveTextContent("@[file:File Bravo]");
    });
  });

  test("pastes plain text into editor state", async () => {
    render(<ControlledMentionTextarea initialValue="Hello " />);

    const editor = screen.getByRole("textbox");
    setSelectionAtEnd(editor);

    fireEvent.paste(editor, {
      clipboardData: {
        getData: () => "World",
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId("mention-value")).toHaveTextContent("Hello World");
    });
  });

  test("invokes mention click callback for rendered comment content", () => {
    const onMentionClick = vi.fn();

    render(
      <div>
        {renderCommentContent("See @[task:Task Alpha] please", onMentionClick)}
      </div>,
    );

    fireEvent.click(screen.getByText("Task Alpha"));

    expect(onMentionClick).toHaveBeenCalledWith("task", "Task Alpha");
  });
});
