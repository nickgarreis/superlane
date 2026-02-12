/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { SidebarProfileMenu } from "./SidebarProfileMenu";
import type { ViewerIdentity } from "../../types";
import { NOTIFICATIONS_FROM_EMAIL } from "../../lib/contact";

vi.mock("react-dnd", () => ({
  useDrag: () => [{ isDragging: false }, () => {}],
}));

const viewerIdentity: ViewerIdentity = {
  userId: "viewer-user-id",
  workosUserId: "workos-user-id",
  name: "Jordan Viewer",
  email: "jordan@example.com",
  avatarUrl: null,
  role: "owner",
};

describe("SidebarProfileMenu", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("wires settings/help/logout actions", () => {
    const onOpenSettings = vi.fn();
    const onLogout = vi.fn();
    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);

    render(
      <SidebarProfileMenu
        viewerIdentity={viewerIdentity}
        onOpenSettings={onOpenSettings}
        onOpenSettingsIntent={vi.fn()}
        onLogout={onLogout}
      />,
    );

    fireEvent.click(screen.getByText("Settings"));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByText("Help & Support"));
    expect(windowOpenSpy).toHaveBeenCalledWith(
      `mailto:${NOTIFICATIONS_FROM_EMAIL}`,
      "_self",
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Profile menu for Jordan Viewer" }),
    );
    fireEvent.click(screen.getByRole("menuitem", { name: "Log out" }));
    expect(onLogout).toHaveBeenCalledTimes(1);
  });

  test("supports keyboard menu open/close and feedback popups", async () => {
    render(
      <SidebarProfileMenu
        viewerIdentity={viewerIdentity}
        onOpenSettings={vi.fn()}
        onOpenSettingsIntent={vi.fn()}
        onLogout={vi.fn()}
      />,
    );

    const trigger = screen.getByRole("button", {
      name: "Profile menu for Jordan Viewer",
    });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(
      screen.getByRole("menu", { name: "Profile actions for Jordan Viewer" }),
    ).toBeInTheDocument();

    fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("menuitem", { name: "Request a feature" }),
    );
    expect(screen.getByText("Request a feature")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() => {
      expect(screen.queryByText("Request a feature")).not.toBeInTheDocument();
    });

    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole("menuitem", { name: "Report a bug" }));
    expect(screen.getByText("Report a bug")).toBeInTheDocument();
  });
});
