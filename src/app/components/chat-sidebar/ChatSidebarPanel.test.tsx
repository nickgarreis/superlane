/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { getFunctionName } from "convex/server";
import { ChatSidebar } from "./ChatSidebarPanel";
import type { ProjectData, ViewerIdentity, WorkspaceMember } from "../../types";

const {
  mockUsePaginatedQuery,
  mockUseMutation,
  mockUseConvex,
} = vi.hoisted(() => ({
  mockUsePaginatedQuery: vi.fn(),
  mockUseMutation: vi.fn(),
  mockUseConvex: vi.fn(),
}));

vi.mock("convex/react", () => ({
  usePaginatedQuery: mockUsePaginatedQuery,
  useMutation: mockUseMutation,
  useConvex: mockUseConvex,
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
    (window as { __setViewportWidth?: (value: number) => void }).__setViewportWidth?.(
      1280,
    );
    Object.defineProperty(window, "scrollTo", {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });
    mockUsePaginatedQuery.mockReset();
    mockUseMutation.mockReset();
    mockUseConvex.mockReset();
    mockUseConvex.mockReturnValue({
      query: vi.fn().mockResolvedValue({
        page: [],
        isDone: true,
        continueCursor: null,
      }),
    });
  });

  test("renders as a full-width drawer on mobile viewports", async () => {
    (window as { __setViewportWidth?: (value: number) => void }).__setViewportWidth?.(
      390,
    );
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });
    mockUseMutation.mockImplementation(() => vi.fn().mockResolvedValue({}));

    render(
      <ChatSidebar
        isOpen
        onClose={vi.fn()}
        activeProject={activeProject}
        activeProjectTasks={[]}
        allProjects={{ [activeProject.id]: activeProject }}
        workspaceMembers={workspaceMembers}
        viewerIdentity={viewerIdentity}
      />,
    );

    const panel = await screen.findByTestId("chat-sidebar-panel");
    expect(panel.className).toContain("fixed");
    expect(panel.className).toContain("w-full");
  });

  test("toggles reactions for existing comments", async () => {
    const createCommentMutation = vi.fn().mockResolvedValue({});
    const updateCommentMutation = vi.fn().mockResolvedValue({});
    const removeCommentMutation = vi.fn().mockResolvedValue({});
    const toggleResolvedMutation = vi.fn().mockResolvedValue({});
    const toggleReactionMutation = vi.fn().mockResolvedValue({});

    mockUsePaginatedQuery.mockReturnValue({
      results: [
        {
          id: "comment-1",
          author: {
            userId: "viewer-user-id",
            name: "Jordan Viewer",
            avatar: "",
          },
          content: "Looks good",
          createdAtEpochMs: Date.now(),
          resolved: false,
          edited: false,
          replyCount: 0,
          reactions: [
            {
              emoji: "👍",
              users: ["Jordan Viewer"],
              userIds: ["viewer-user-id"],
            },
          ],
        },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

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
        activeProjectTasks={[]}
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
    mockUsePaginatedQuery.mockReturnValue({
      results: [
        {
          id: "comment-resolved-1",
          author: {
            userId: "viewer-user-id",
            name: "Jordan Viewer",
            avatar: "",
          },
          content: "Resolved comment",
          createdAtEpochMs: Date.now(),
          resolved: true,
          edited: false,
          replyCount: 0,
          reactions: [],
        },
      ],
      status: "Exhausted",
      loadMore: vi.fn(),
    });

    mockUseMutation.mockImplementation(() => vi.fn().mockResolvedValue({}));

    render(
      <ChatSidebar
        isOpen
        onClose={vi.fn()}
        activeProject={activeProject}
        activeProjectTasks={[]}
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

  test("dropdown shows only active and archived projects and routes archived to archive detail", async () => {
    mockUsePaginatedQuery.mockReturnValue({
      results: [],
      status: "Exhausted",
      loadMore: vi.fn(),
    });
    mockUseMutation.mockImplementation(() => vi.fn().mockResolvedValue({}));

    const onSwitchProject = vi.fn();
    const archiveProject: ProjectData = {
      ...activeProject,
      id: "project-archive",
      name: "Archive Candidate",
      archived: true,
    };
    const activeCandidate: ProjectData = {
      ...activeProject,
      id: "project-active",
      name: "Active Candidate",
      archived: false,
      status: { ...activeProject.status, label: "Active" },
    };
    const draftCandidate: ProjectData = {
      ...activeProject,
      id: "project-draft",
      name: "Draft Candidate",
      archived: false,
      status: { ...activeProject.status, label: "Draft" },
    };
    const reviewCandidate: ProjectData = {
      ...activeProject,
      id: "project-review",
      name: "Review Candidate",
      archived: false,
      status: { ...activeProject.status, label: "Review" },
    };
    const completedCandidate: ProjectData = {
      ...activeProject,
      id: "project-completed",
      name: "Completed Candidate",
      archived: false,
      status: { ...activeProject.status, label: "Completed" },
    };

    render(
      <ChatSidebar
        isOpen
        onClose={vi.fn()}
        activeProject={activeProject}
        activeProjectTasks={[]}
        allProjects={{
          [activeProject.id]: activeProject,
          [archiveProject.id]: archiveProject,
          [activeCandidate.id]: activeCandidate,
          [draftCandidate.id]: draftCandidate,
          [reviewCandidate.id]: reviewCandidate,
          [completedCandidate.id]: completedCandidate,
        }}
        workspaceMembers={workspaceMembers}
        viewerIdentity={viewerIdentity}
        onSwitchProject={onSwitchProject}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: /open project dropdown\. current project: project alpha/i,
      }),
    );

    expect(screen.getByRole("button", { name: /active candidate/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /archive candidate/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /draft candidate/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /review candidate/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /completed candidate/i })).toBeNull();
    expect(screen.getByText("Archived")).toHaveAttribute(
      "data-sidebar-tag-tone",
      "archived",
    );

    fireEvent.click(screen.getByRole("button", { name: /archive candidate/i }));
    expect(onSwitchProject).toHaveBeenCalledWith("archive-project:project-archive");

    fireEvent.click(
      screen.getByRole("button", {
        name: /open project dropdown\. current project: project alpha/i,
      }),
    );
    fireEvent.click(screen.getByRole("button", { name: /active candidate/i }));
    expect(onSwitchProject).toHaveBeenCalledWith("project:project-active");
  });
});
