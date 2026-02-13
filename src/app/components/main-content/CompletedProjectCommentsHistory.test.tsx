/** @vitest-environment jsdom */

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import {
  CompletedProjectCommentsHistory,
  type CompletedCommentHistoryItem,
} from "./CompletedProjectCommentsHistory";
import type { WorkspaceMember } from "../../types";

const workspaceMembers: WorkspaceMember[] = [
  {
    userId: "user-1",
    workosUserId: "workos-1",
    name: "Alex Owner",
    email: "alex@example.com",
    avatarUrl: null,
    role: "owner",
    isViewer: true,
  },
];

const buildComment = (
  overrides: Partial<CompletedCommentHistoryItem> & Pick<CompletedCommentHistoryItem, "id" | "content">,
): CompletedCommentHistoryItem => ({
  id: overrides.id,
  parentCommentId: overrides.parentCommentId ?? null,
  author: overrides.author ?? {
    userId: "user-1",
    name: "Alex Owner",
    avatar: "",
  },
  content: overrides.content,
  createdAtEpochMs: overrides.createdAtEpochMs ?? Date.now() - 5_000,
  resolved: overrides.resolved ?? false,
  edited: overrides.edited ?? false,
  reactions: overrides.reactions ?? [],
  replies: overrides.replies ?? [],
});

describe("CompletedProjectCommentsHistory", () => {
  test("renders loading state", () => {
    const { container } = render(
      <CompletedProjectCommentsHistory
        comments={[]}
        loading
        workspaceMembers={workspaceMembers}
      />,
    );

    expect(screen.getByText("Comments history")).toBeInTheDocument();
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(2);
  });

  test("renders empty state when history is empty", () => {
    render(
      <CompletedProjectCommentsHistory
        comments={[]}
        loading={false}
        workspaceMembers={workspaceMembers}
      />,
    );

    expect(
      screen.getByText("No comment history for this project yet"),
    ).toBeInTheDocument();
  });

  test("renders threaded comments with resolved and reaction metadata", () => {
    const comments: CompletedCommentHistoryItem[] = [
      buildComment({
        id: "thread-1",
        content: "Top-level @[user:Alex Owner] comment",
        resolved: true,
        edited: true,
        reactions: [{ emoji: "🔥", users: ["Alex Owner", "Taylor"], userIds: ["u1", "u2"] }],
        replies: [
          buildComment({
            id: "reply-1",
            parentCommentId: "thread-1",
            content: "Reply body",
            reactions: [{ emoji: "✅", users: ["Alex Owner"], userIds: ["u1"] }],
          }),
        ],
      }),
    ];

    render(
      <CompletedProjectCommentsHistory
        comments={comments}
        loading={false}
        workspaceMembers={workspaceMembers}
      />,
    );

    expect(
      screen.getAllByText((_, element) =>
        (element?.textContent ?? "").includes("Top-level")
        && (element?.textContent ?? "").includes("comment"),
      ).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("Reply body")).toBeInTheDocument();
    expect(screen.getByText("Resolved")).toBeInTheDocument();
    expect(screen.getByText("Edited")).toBeInTheDocument();
    expect(screen.getByLabelText("🔥 2")).toBeInTheDocument();
    expect(screen.getByLabelText("✅ 1")).toBeInTheDocument();
    expect(screen.getAllByText("Alex Owner").length).toBeGreaterThan(0);
    expect(screen.getByText("1 thread")).toBeInTheDocument();
  });
});
