/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { InboxSidebarPanel } from "./InboxSidebarPanel";
import type { WorkspaceActivity } from "../types";

const buildActivity = (
  overrides: Partial<WorkspaceActivity>,
): WorkspaceActivity => ({
  id: "activity-1",
  kind: "project",
  action: "created",
  actorType: "user",
  actorUserId: "user-1",
  actorName: "Alex",
  actorAvatarUrl: null,
  projectPublicId: "project-1",
  projectName: "Website Redesign",
  projectVisibility: "workspace",
  projectOwnerUserId: "user-1",
  taskId: null,
  taskTitle: null,
  fileName: null,
  fileTab: null,
  targetUserId: null,
  targetUserName: null,
  targetRole: null,
  fromValue: null,
  toValue: null,
  message: null,
  errorCode: null,
  createdAt: Date.now(),
  ...overrides,
});

describe("InboxSidebarPanel", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  test("does not render when closed", () => {
    render(
      <InboxSidebarPanel
        isOpen={false}
        isMobile={false}
        onClose={vi.fn()}
        activities={[]}
        workspaceMembers={[]}
        unreadCount={0}
        onMarkActivityRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    expect(screen.queryByText("Inbox")).toBeNull();
  });

  test("renders, supports search/filter, and closes", () => {
    const onClose = vi.fn();
    const onMarkActivityRead = vi.fn();
    const onMarkAllRead = vi.fn();
    const activities: WorkspaceActivity[] = [
      buildActivity({
        id: "activity-1",
        kind: "project",
        action: "created",
        projectName: "Website Redesign",
        isRead: false,
      }),
      buildActivity({
        id: "activity-2",
        kind: "task",
        action: "completed",
        taskId: "task-1",
        taskTitle: "Finalize homepage copy",
        isRead: true,
      }),
    ];

    render(
      <InboxSidebarPanel
        isOpen
        isMobile={false}
        onClose={onClose}
        activities={activities}
        workspaceMembers={[]}
        unreadCount={1}
        onMarkActivityRead={onMarkActivityRead}
        onMarkAllRead={onMarkAllRead}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    expect(screen.getByText("Inbox")).toBeInTheDocument();
    const unreadTag = screen.getByText("1 unread");
    expect(unreadTag).toBeInTheDocument();
    expect(unreadTag).toHaveAttribute("data-sidebar-tag-tone", "inboxUnread");
    expect(unreadTag).toHaveClass("txt-tone-accent");
    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));
    expect(onMarkActivityRead).toHaveBeenCalledWith("activity-1");

    expect(screen.getByText(/Created project/i)).toBeInTheDocument();
    expect(screen.getByText("Website Redesign")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search inbox"), {
      target: { value: "finalize" },
    });
    expect(screen.queryByText("Website Redesign")).toBeNull();
    expect(screen.getByText(/Completed task/i)).toBeInTheDocument();
    expect(screen.getAllByText("Finalize homepage copy").length).toBeGreaterThan(0);

    fireEvent.change(screen.getByPlaceholderText("Search inbox"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTitle("Filter inbox"));
    fireEvent.click(screen.getByRole("button", { name: "Tasks" }));
    expect(screen.queryByText("Website Redesign")).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Close inbox" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("loads more activities on scroll threshold", () => {
    const loadMoreWorkspaceActivities = vi.fn();
    const activities: WorkspaceActivity[] = [
      buildActivity({
        id: "activity-1",
        kind: "project",
        action: "created",
      }),
    ];

    render(
      <InboxSidebarPanel
        isOpen
        isMobile={false}
        onClose={vi.fn()}
        activities={activities}
        workspaceMembers={[]}
        unreadCount={1}
        onMarkActivityRead={vi.fn()}
        onMarkAllRead={vi.fn()}
        activitiesPaginationStatus="CanLoadMore"
        loadMoreWorkspaceActivities={loadMoreWorkspaceActivities}
      />,
    );

    const scrollRegion = screen.getByTestId("inbox-scroll-region");
    Object.defineProperties(scrollRegion, {
      scrollHeight: {
        value: 1000,
        configurable: true,
      },
      clientHeight: {
        value: 300,
        configurable: true,
      },
    });

    fireEvent.scroll(scrollRegion, { target: { scrollTop: 460 } });

    expect(loadMoreWorkspaceActivities).toHaveBeenCalledWith(100);
  });

  test("renders mobile backdrop and closes when backdrop is tapped", () => {
    const onClose = vi.fn();

    render(
      <InboxSidebarPanel
        isOpen
        isMobile
        onClose={onClose}
        activities={[]}
        workspaceMembers={[]}
        unreadCount={0}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    const closeButtons = screen.getAllByRole("button", {
      name: "Close inbox",
    });
    expect(closeButtons).toHaveLength(2);
    fireEvent.click(closeButtons[0]);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("does not call onActivityClick when the row container is clicked", () => {
    const onActivityClick = vi.fn();
    const activity = buildActivity({
      id: "activity-click",
      kind: "project",
      action: "created",
      projectName: "Clickable Project",
    });

    render(
      <InboxSidebarPanel
        isOpen
        isMobile={false}
        onClose={vi.fn()}
        activities={[activity]}
        workspaceMembers={[]}
        unreadCount={0}
        activitiesPaginationStatus="Exhausted"
        onActivityClick={onActivityClick}
      />,
    );

    const row = screen.getByLabelText("Projects activity type").closest("div");
    expect(row).not.toBeNull();
    fireEvent.click(row!);

    expect(onActivityClick).not.toHaveBeenCalled();
  });

  test("clicking a mention marks unread activity as read, triggers navigation, and closes inbox", () => {
    const onActivityClick = vi.fn();
    const onMarkActivityRead = vi.fn();
    const onClose = vi.fn();
    const activity = buildActivity({
      id: "activity-unread-click",
      kind: "project",
      action: "created",
      projectName: "Unread Clickable Project",
      isRead: false,
    });

    render(
      <InboxSidebarPanel
        isOpen
        isMobile={false}
        onClose={onClose}
        activities={[activity]}
        workspaceMembers={[]}
        unreadCount={1}
        onMarkActivityRead={onMarkActivityRead}
        onActivityClick={onActivityClick}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    fireEvent.click(screen.getByText("Unread Clickable Project"));

    expect(onMarkActivityRead).toHaveBeenCalledWith("activity-unread-click");
    expect(onActivityClick).toHaveBeenCalledWith(activity);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test("clicking dismiss calls onDismissActivity with the row id", () => {
    const onDismissActivity = vi.fn();
    const activity = buildActivity({
      id: "activity-dismiss",
      kind: "project",
      action: "created",
      projectName: "Dismissable Project",
    });

    render(
      <InboxSidebarPanel
        isOpen
        isMobile={false}
        onClose={vi.fn()}
        activities={[activity]}
        workspaceMembers={[]}
        unreadCount={0}
        activitiesPaginationStatus="Exhausted"
        onDismissActivity={onDismissActivity}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Dismiss activity" }));

    expect(onDismissActivity).toHaveBeenCalledWith("activity-dismiss");
  });

  test("renders inbox user mention avatar from workspace member lookup", () => {
    const activity = buildActivity({
      id: "activity-mention-avatar",
      kind: "collaboration",
      action: "comment_added",
      actorName: "Alex",
      projectName: "Brand Launch",
      message: "@[user:Nick Garreis]",
    });

    render(
      <InboxSidebarPanel
        isOpen
        isMobile={false}
        onClose={vi.fn()}
        activities={[activity]}
        workspaceMembers={[
          {
            userId: "user-nick",
            workosUserId: "workos-nick",
            name: "Nick Garreis",
            email: "nick@example.com",
            avatarUrl: "https://example.com/nick.png",
            role: "member",
            isViewer: false,
          },
        ]}
        unreadCount={0}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    const avatar = screen.getByAltText("Nick Garreis profile image");
    expect(avatar).toHaveAttribute("src", "https://example.com/nick.png");
  });
});
