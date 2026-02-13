/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { Sidebar } from "./Sidebar";
import type { ViewerIdentity, Workspace } from "../types";

vi.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, () => {}],
  useDrop: () => [{ isOver: false }, () => {}],
}));

const viewerIdentity: ViewerIdentity = {
  userId: "viewer-id",
  workosUserId: "workos-viewer-id",
  name: "Alex Member",
  email: "alex@example.com",
  avatarUrl: null,
  role: "member",
};

const workspaces: Workspace[] = [
  {
    id: "workspace-alpha",
    slug: "workspace-alpha",
    name: "Workspace Alpha",
    plan: "Free",
  },
  {
    id: "workspace-beta",
    slug: "workspace-beta",
    name: "Workspace Beta",
    plan: "Pro",
  },
];

describe("Sidebar workspace permissions", () => {
  test("blocks create workspace interaction when viewer lacks permission", () => {
    const onCreateWorkspace = vi.fn();

    render(
      <Sidebar
        onNavigate={vi.fn()}
        onOpenInbox={vi.fn()}
        inboxUnreadCount={0}
        onSearch={vi.fn()}
        onOpenCreateProject={vi.fn()}
        currentView="tasks"
        projects={{}}
        approvedSidebarProjectIds={[]}
        viewerIdentity={viewerIdentity}
        activeWorkspace={workspaces[0]}
        workspaces={workspaces}
        onSwitchWorkspace={vi.fn()}
        onCreateWorkspace={onCreateWorkspace}
        canCreateWorkspace={false}
        onOpenSettings={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={vi.fn()}
        onOpenDraftPendingProjectsPopup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Workspace Alpha"));
    fireEvent.click(screen.getByText("Create Workspace"));

    expect(onCreateWorkspace).not.toHaveBeenCalled();
  });

  test("uses workspace slug when switching workspace", () => {
    const onSwitchWorkspace = vi.fn();

    render(
      <Sidebar
        onNavigate={vi.fn()}
        onOpenInbox={vi.fn()}
        inboxUnreadCount={0}
        onSearch={vi.fn()}
        onOpenCreateProject={vi.fn()}
        currentView="tasks"
        projects={{}}
        approvedSidebarProjectIds={[]}
        viewerIdentity={viewerIdentity}
        activeWorkspace={workspaces[0]}
        workspaces={workspaces}
        onSwitchWorkspace={onSwitchWorkspace}
        onCreateWorkspace={vi.fn()}
        canCreateWorkspace={true}
        onOpenSettings={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={vi.fn()}
        onOpenDraftPendingProjectsPopup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Workspace Alpha"));
    fireEvent.click(screen.getByText("Workspace Beta"));

    expect(onSwitchWorkspace).toHaveBeenCalledWith("workspace-beta");
  });

  test("shows unread inbox badge and caps at 99+", () => {
    const { rerender } = render(
      <Sidebar
        onNavigate={vi.fn()}
        onOpenInbox={vi.fn()}
        inboxUnreadCount={7}
        onSearch={vi.fn()}
        onOpenCreateProject={vi.fn()}
        currentView="tasks"
        projects={{}}
        approvedSidebarProjectIds={[]}
        viewerIdentity={viewerIdentity}
        activeWorkspace={workspaces[0]}
        workspaces={workspaces}
        onSwitchWorkspace={vi.fn()}
        onCreateWorkspace={vi.fn()}
        canCreateWorkspace={true}
        onOpenSettings={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={vi.fn()}
        onOpenDraftPendingProjectsPopup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    const inboxItem = screen.getByTitle("Inbox");
    const unreadBadge = within(inboxItem).getByText("7");
    expect(unreadBadge).toBeInTheDocument();
    expect(unreadBadge).toHaveAttribute("data-sidebar-tag-tone", "inboxUnread");
    expect(unreadBadge).toHaveClass("txt-tone-accent");

    rerender(
      <Sidebar
        onNavigate={vi.fn()}
        onOpenInbox={vi.fn()}
        inboxUnreadCount={180}
        onSearch={vi.fn()}
        onOpenCreateProject={vi.fn()}
        currentView="tasks"
        projects={{}}
        approvedSidebarProjectIds={[]}
        viewerIdentity={viewerIdentity}
        activeWorkspace={workspaces[0]}
        workspaces={workspaces}
        onSwitchWorkspace={vi.fn()}
        onCreateWorkspace={vi.fn()}
        canCreateWorkspace={true}
        onOpenSettings={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={vi.fn()}
        onOpenDraftPendingProjectsPopup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    const cappedBadge = within(screen.getByTitle("Inbox")).getByText("99+");
    expect(cappedBadge).toBeInTheDocument();
    expect(cappedBadge).toHaveAttribute("data-sidebar-tag-tone", "inboxUnread");
    expect(cappedBadge).toHaveClass("txt-tone-accent");
  });

  test("hides inbox badge when unread count is zero", () => {
    render(
      <Sidebar
        onNavigate={vi.fn()}
        onOpenInbox={vi.fn()}
        inboxUnreadCount={0}
        onSearch={vi.fn()}
        onOpenCreateProject={vi.fn()}
        currentView="tasks"
        projects={{}}
        approvedSidebarProjectIds={[]}
        viewerIdentity={viewerIdentity}
        activeWorkspace={workspaces[0]}
        workspaces={workspaces}
        onSwitchWorkspace={vi.fn()}
        onCreateWorkspace={vi.fn()}
        canCreateWorkspace={true}
        onOpenSettings={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onOpenCompletedProjectsPopup={vi.fn()}
        onOpenDraftPendingProjectsPopup={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    expect(within(screen.getByTitle("Inbox")).queryByText("99+")).toBeNull();
    expect(within(screen.getByTitle("Inbox")).queryByText("7")).toBeNull();
  });
});
