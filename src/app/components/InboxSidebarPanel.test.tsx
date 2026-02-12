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
        onClose={vi.fn()}
        activities={[]}
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
        onClose={onClose}
        activities={activities}
        unreadCount={1}
        onMarkActivityRead={onMarkActivityRead}
        onMarkAllRead={onMarkAllRead}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    expect(screen.getByText("Inbox")).toBeInTheDocument();
    expect(screen.getByText("1 unread")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Mark all as read" }));
    expect(onMarkAllRead).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Mark read" }));
    expect(onMarkActivityRead).toHaveBeenCalledWith("activity-1");

    expect(screen.getByText("Created project Website Redesign")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search inbox"), {
      target: { value: "finalize" },
    });
    expect(screen.queryByText("Created project Website Redesign")).toBeNull();
    expect(screen.getByText("Completed task Finalize homepage copy")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search inbox"), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByTitle("Filter inbox"));
    fireEvent.click(screen.getByRole("button", { name: "Tasks" }));
    expect(screen.queryByText("Created project Website Redesign")).toBeNull();

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
        onClose={vi.fn()}
        activities={activities}
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

  test("calls onActivityClick when a row is clicked", () => {
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
        onClose={vi.fn()}
        activities={[activity]}
        unreadCount={0}
        activitiesPaginationStatus="Exhausted"
        onActivityClick={onActivityClick}
      />,
    );

    fireEvent.click(screen.getByText("Created project Clickable Project"));

    expect(onActivityClick).toHaveBeenCalledWith(activity);
  });

  test("marks unread activity as read when the row is clicked", () => {
    const onActivityClick = vi.fn();
    const onMarkActivityRead = vi.fn();
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
        onClose={vi.fn()}
        activities={[activity]}
        unreadCount={1}
        onMarkActivityRead={onMarkActivityRead}
        onActivityClick={onActivityClick}
        activitiesPaginationStatus="Exhausted"
      />,
    );

    fireEvent.click(screen.getByText("Created project Unread Clickable Project"));

    expect(onMarkActivityRead).toHaveBeenCalledWith("activity-unread-click");
    expect(onActivityClick).toHaveBeenCalledWith(activity);
  });
});
