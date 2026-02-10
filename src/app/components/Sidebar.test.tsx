/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
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
        onSearch={vi.fn()}
        onOpenCreateProject={vi.fn()}
        currentView="tasks"
        projects={{}}
        viewerIdentity={viewerIdentity}
        activeWorkspace={workspaces[0]}
        workspaces={workspaces}
        onSwitchWorkspace={vi.fn()}
        onCreateWorkspace={onCreateWorkspace}
        canCreateWorkspace={false}
        onOpenSettings={vi.fn()}
        onArchiveProject={vi.fn()}
        onUnarchiveProject={vi.fn()}
        onUpdateProjectStatus={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
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
        onSearch={vi.fn()}
        onOpenCreateProject={vi.fn()}
        currentView="tasks"
        projects={{}}
        viewerIdentity={viewerIdentity}
        activeWorkspace={workspaces[0]}
        workspaces={workspaces}
        onSwitchWorkspace={onSwitchWorkspace}
        onCreateWorkspace={vi.fn()}
        canCreateWorkspace={true}
        onOpenSettings={vi.fn()}
        onArchiveProject={vi.fn()}
        onUnarchiveProject={vi.fn()}
        onUpdateProjectStatus={vi.fn()}
        onEditProject={vi.fn()}
        onViewReviewProject={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Workspace Alpha"));
    fireEvent.click(screen.getByText("Workspace Beta"));

    expect(onSwitchWorkspace).toHaveBeenCalledWith("workspace-beta");
  });
});
