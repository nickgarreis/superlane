/** @vitest-environment jsdom */

import React, { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import {
  MentionTextarea,
  renderCommentContent,
  type MentionItem,
} from "./MentionTextarea";
import { buildMentionUserAvatarLookup } from "./mentions/userAvatarLookup";

const mentionItems: MentionItem[] = [
  { type: "task", id: "task-1", label: "Task Alpha" },
  { type: "file", id: "file-1", label: "File Bravo", meta: "PDF" },
  {
    type: "user",
    id: "user-1",
    label: "Casey User",
    meta: "Owner",
    avatar: "https://cdn.example/casey.png",
  },
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
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    try {
      const refWarnings = consoleErrorSpy.mock.calls
        .map((args) => args.map((arg) => String(arg)).join(" "))
        .filter((message) => message.includes("`ref` is not a prop"));
      expect(refWarnings).toHaveLength(0);
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

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
    expect(screen.getByAltText("Casey User profile image")).toBeInTheDocument();

    fireEvent.keyDown(editor, { key: "ArrowDown" });
    fireEvent.keyDown(editor, { key: "Enter" });

    await waitFor(() => {
      expect(screen.getByTestId("mention-value")).toHaveTextContent(
        "@[file:File Bravo]",
      );
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
      expect(screen.getByTestId("mention-value")).toHaveTextContent(
        "Hello World",
      );
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

  test("renders long mention labels with wrap-safe classes", () => {
    const longLabel = "ProjectNameWithNoSpacesThatShouldBreakAcrossLinesInNarrowContainers";

    render(
      <div>
        {renderCommentContent(`See @[file:${longLabel}]`, vi.fn())}
      </div>,
    );

    const label = screen.getByText(longLabel);
    expect(label).toHaveClass("break-words", "min-w-0");
    expect(label).not.toHaveClass("break-all");
    expect(label.parentElement).toHaveClass("max-w-full", "min-w-0", "items-start");
    expect(label.parentElement).not.toHaveClass("items-center");
    const leadingVisual = label.parentElement?.firstElementChild;
    expect(leadingVisual).toHaveClass("shrink-0", "pt-[2px]");
  });

  test("does not apply top icon padding to user mentions", () => {
    const userLabel = "Casey User";

    render(
      <div>
        {renderCommentContent(`See @[user:${userLabel}]`, vi.fn())}
      </div>,
    );

    const label = screen.getByText(userLabel);
    const leadingVisual = label.parentElement?.firstElementChild;
    expect(leadingVisual).toHaveClass("shrink-0");
    expect(leadingVisual).not.toHaveClass("pt-[2px]");
  });

  test("renders user mention avatar when lookup data is available", () => {
    const userLabel = "Casey User";
    const lookup = buildMentionUserAvatarLookup([
      { label: userLabel, avatarUrl: "https://cdn.example/casey.png" },
    ]);

    render(
      <div>
        {renderCommentContent(`See @[user:${userLabel}]`, vi.fn(), {
          userAvatarByLabel: lookup,
        })}
      </div>,
    );

    const avatar = screen.getByAltText("Casey User profile image");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "https://cdn.example/casey.png");
  });

  test("falls back to initials when user mention label is ambiguous", () => {
    const userLabel = "Casey User";
    const lookup = buildMentionUserAvatarLookup([
      { label: "Casey User", avatarUrl: "https://cdn.example/casey-a.png" },
      { label: "casey   user", avatarUrl: "https://cdn.example/casey-b.png" },
    ]);

    render(
      <div>
        {renderCommentContent(`See @[user:${userLabel}]`, vi.fn(), {
          userAvatarByLabel: lookup,
        })}
      </div>,
    );

    expect(screen.queryByAltText("Casey User profile image")).toBeNull();
    expect(screen.getByText("CU")).toBeInTheDocument();
  });
});
