/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { ChatSidebar } from "./ChatSidebarPanel";
import type { ProjectData, ViewerIdentity, WorkspaceMember } from "../../types";

const {
  mockUseQuery,
  mockUseMutation,
} = vi.hoisted(() => ({
  mockUseQuery: vi.fn(),
  mockUseMutation: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
}));

const viewerIdentity: ViewerIdentity = {
  userId: "viewer-user-id",
  workosUserId: "workos-viewer-id",
  name: "Jordan Viewer",
  email: "jordan@example.com",
  avatarUrl: null,
  role: "owner",
};

const workspaceMembers: WorkspaceMember[] = [
  {
    userId: "viewer-user-id",
    workosUserId: "workos-viewer-id",
    name: "Jordan Viewer",
    email: "jordan@example.com",
    avatarUrl: null,
    role: "owner",
    isViewer: true,
  },
];

const activeProject: ProjectData = {
  id: "project-alpha",
  name: "Project Alpha",
  description: "Project description",
  creator: {
    userId: "viewer-user-id",
    name: "Jordan Viewer",
    avatar: "",
  },
  status: {
    label: "Active",
    color: "#fff",
    bgColor: "#000",
    dotColor: "#fff",
  },
  category: "Web Design",
  scope: "Landing page(s)",
  archived: false,
  tasks: [],
};

describe("ChatSidebar reactions", () => {
  beforeEach(() => {
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();
  });

  test("toggles reactions for existing comments", async () => {
    const createCommentMutation = vi.fn().mockResolvedValue({});
    const updateCommentMutation = vi.fn().mockResolvedValue({});
    const removeCommentMutation = vi.fn().mockResolvedValue({});
    const toggleResolvedMutation = vi.fn().mockResolvedValue({});
    const toggleReactionMutation = vi.fn().mockResolvedValue({});

    mockUseQuery.mockReturnValue([
      {
        id: "comment-1",
        author: {
          userId: "viewer-user-id",
          name: "Jordan Viewer",
          avatar: "",
        },
        content: "Looks good",
        timestamp: "now",
        replies: [],
        resolved: false,
        reactions: [
          {
            emoji: "👍",
            users: ["Jordan Viewer"],
            userIds: ["viewer-user-id"],
          },
        ],
      },
    ]);

    mockUseMutation.mockImplementation((mutationRef: unknown) => {
      const functionName = getFunctionName(mutationRef as any);

      if (functionName.endsWith("comments:create")) {
        return createCommentMutation;
      }
      if (functionName.endsWith("comments:update")) {
        return updateCommentMutation;
      }
      if (functionName.endsWith("comments:remove")) {
        return removeCommentMutation;
      }
      if (functionName.endsWith("comments:toggleResolved")) {
        return toggleResolvedMutation;
      }
      if (functionName.endsWith("comments:toggleReaction")) {
        return toggleReactionMutation;
      }

      throw new Error(`Unexpected mutation reference: ${functionName}`);
    });

    render(
      <ChatSidebar
        isOpen
        onClose={vi.fn()}
        activeProject={activeProject}
        allProjects={{ [activeProject.id]: activeProject }}
        workspaceMembers={workspaceMembers}
        viewerIdentity={viewerIdentity}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /👍/ }));

    await waitFor(() => {
      expect(toggleReactionMutation).toHaveBeenCalledWith({
        commentId: "comment-1",
        emoji: "👍",
      });
    });
  });

  test("toggles resolved thread visibility", async () => {
    mockUseQuery.mockReturnValue([
      {
        id: "comment-resolved-1",
        author: {
          userId: "viewer-user-id",
          name: "Jordan Viewer",
          avatar: "",
        },
        content: "Resolved comment",
        timestamp: "now",
        replies: [],
        resolved: true,
        reactions: [],
      },
    ]);

    mockUseMutation.mockImplementation(() => vi.fn().mockResolvedValue({}));

    render(
      <ChatSidebar
        isOpen
        onClose={vi.fn()}
        activeProject={activeProject}
        allProjects={{ [activeProject.id]: activeProject }}
        workspaceMembers={workspaceMembers}
        viewerIdentity={viewerIdentity}
      />,
    );

    expect(screen.queryByText("Resolved comment")).toBeNull();
    const resolvedThreadsToggle = screen.getByRole("button", {
      name: /expand resolved threads/i,
    });
    expect(resolvedThreadsToggle).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(resolvedThreadsToggle);

    await waitFor(() => {
      expect(screen.getByText("Resolved comment")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("button", { name: /collapse resolved threads/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });
});
