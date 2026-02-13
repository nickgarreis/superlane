/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SidebarPrimaryActions } from "./SidebarPrimaryActions";

vi.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, () => {}],
}));

describe("SidebarPrimaryActions", () => {
  test("renders keyboard shortcuts and invokes actions", () => {
    const onSearch = vi.fn();
    const onNavigate = vi.fn();
    const onOpenInbox = vi.fn();
    const onOpenCreateProject = vi.fn();

    render(
      <SidebarPrimaryActions
        currentView="tasks"
        inboxUnreadCount={7}
        onSearch={onSearch}
        onSearchIntent={vi.fn()}
        onNavigate={onNavigate}
        onOpenInbox={onOpenInbox}
        onOpenCreateProject={onOpenCreateProject}
        onOpenCreateProjectIntent={vi.fn()}
      />,
    );

    expect(screen.getByText("⌘K")).toBeInTheDocument();
    expect(screen.getByText("⌘A")).toBeInTheDocument();
    expect(screen.getByText("⌘I")).toBeInTheDocument();
    expect(screen.getByText("⌘P")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Search"));
    expect(onSearch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Inbox"));
    expect(onOpenInbox).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Create Project"));
    expect(onOpenCreateProject).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Archive"));
    expect(onNavigate).toHaveBeenCalledWith("archive");

    const unreadDot = screen.getByTestId("inbox-unread-dot");
    expect(unreadDot).toBeInTheDocument();
    expect(unreadDot).toHaveClass("rounded-full");
    expect(unreadDot).toHaveClass("bg-sky-500");
  });
});
