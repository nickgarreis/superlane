/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { CollaborationComment } from "../../types";
import { CommentItem } from "./CommentItem";
import type { CommentItemProps } from "./commentItemTypes";

vi.mock("./ReactionPicker", () => ({
  ReactionPicker: () => null,
}));

const baseComment: CollaborationComment = {
  id: "comment-1",
  author: {
    userId: "user-1",
    name: "Alex Owner",
    avatar: "",
  },
  content: "Looks good",
  timestamp: "now",
  replies: [],
  resolved: false,
  reactions: [
    {
      emoji: "👍",
      users: ["Alex Owner"],
      userIds: ["user-1"],
    },
  ],
};

const createProps = (
  overrides?: Partial<CommentItemProps>,
): CommentItemProps => ({
  comment: baseComment,
  currentUserId: "user-1",
  currentUserName: "Alex Owner",
  currentUserAvatar: "",
  isTopLevel: true,
  mentionItems: [],
  replyingTo: null,
  editingComment: null,
  editValue: "",
  activeReactionPicker: null,
  activeMoreMenu: null,
  collapsedThreads: new Set<string>(),
  replyValue: "",
  onSetReplyingTo: vi.fn(),
  onSetReplyValue: vi.fn(),
  onSetEditingComment: vi.fn(),
  onSetEditValue: vi.fn(),
  onSetActiveReactionPicker: vi.fn(),
  onSetActiveMoreMenu: vi.fn(),
  onReply: vi.fn(),
  onEditComment: vi.fn(),
  onDeleteComment: vi.fn(),
  onResolve: vi.fn(),
  onToggleReaction: vi.fn(),
  onToggleThread: vi.fn(),
  ...overrides,
});

describe("CommentItem", () => {
  test("invokes reaction, reply, and resolve handlers", () => {
    const props = createProps();

    render(<CommentItem {...props} />);

    fireEvent.click(screen.getByRole("button", { name: /👍/ }));
    fireEvent.click(screen.getByRole("button", { name: "Reply" }));
    fireEvent.click(screen.getByRole("button", { name: "Resolve" }));

    expect(props.onToggleReaction).toHaveBeenCalledWith("comment-1", "👍");
    expect(props.onSetReplyingTo).toHaveBeenCalledWith("comment-1");
    expect(props.onResolve).toHaveBeenCalledWith("comment-1");
  });

  test("submits inline reply composer", () => {
    const onReply = vi.fn();

    render(
      <CommentItem
        {...createProps({
          replyingTo: "comment-1",
          replyValue: "ship it",
          onReply,
        })}
      />,
    );

    const textboxes = screen.getAllByRole("textbox");
    fireEvent.keyDown(textboxes[textboxes.length - 1], {
      key: "Enter",
      metaKey: true,
    });

    expect(onReply).toHaveBeenCalledWith("comment-1");
  });
});
