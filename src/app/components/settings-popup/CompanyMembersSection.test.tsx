/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { CompanyMembersSection } from "./CompanyMembersSection";

const { safeScrollIntoViewMock } = vi.hoisted(() => ({
  safeScrollIntoViewMock: vi.fn(),
}));

vi.mock("../../lib/dom", () => ({
  safeScrollIntoView: (...args: unknown[]) => safeScrollIntoViewMock(...args),
}));

const baseMembers = [
  {
    userId: "owner-1",
    name: "Owner",
    email: "owner@example.com",
    role: "owner" as const,
    status: "active" as const,
    avatarUrl: null,
  },
  {
    userId: "member-1",
    name: "Taylor",
    email: "taylor@example.com",
    role: "member" as const,
    status: "active" as const,
    avatarUrl: null,
  },
];

const basePendingInvitations = [
  {
    invitationId: "invite-1",
    email: "new@example.com",
    state: "pending" as const,
    requestedRole: "member" as const,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
];

const buildProps = () => ({
  members: baseMembers,
  pendingInvitations: basePendingInvitations,
  viewerRole: "owner" as const,
  hasOrganizationLink: true,
  canManageMembers: true,
  onInviteMember: vi.fn().mockResolvedValue(undefined),
  onChangeMemberRole: vi.fn().mockResolvedValue(undefined),
  onRemoveMember: vi.fn().mockResolvedValue(undefined),
  onResendInvitation: vi.fn().mockResolvedValue(undefined),
  onRevokeInvitation: vi.fn().mockResolvedValue(undefined),
});

describe("CompanyMembersSection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("invites, updates roles, removes members, and manages invitations", async () => {
    const props = buildProps();

    render(<CompanyMembersSection {...props} />);

    expect(screen.getByText("Pending")).toHaveAttribute(
      "data-sidebar-tag-tone",
      "pending",
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "invitee@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));

    await waitFor(() => {
      expect(props.onInviteMember).toHaveBeenCalledWith({
        email: "invitee@example.com",
        role: "member",
      });
    });

    fireEvent.click(screen.getAllByRole("button", { name: "member" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "admin" }));

    await waitFor(() => {
      expect(props.onChangeMemberRole).toHaveBeenCalledWith({
        userId: "member-1",
        role: "admin",
      });
    });

    fireEvent.click(screen.getByTitle("Remove member"));

    await waitFor(() => {
      expect(props.onRemoveMember).toHaveBeenCalledWith({ userId: "member-1" });
    });

    fireEvent.click(screen.getByTitle("Resend invitation"));
    fireEvent.click(screen.getByTitle("Revoke invitation"));

    await waitFor(() => {
      expect(props.onResendInvitation).toHaveBeenCalledWith({
        invitationId: "invite-1",
      });
      expect(props.onRevokeInvitation).toHaveBeenCalledWith({
        invitationId: "invite-1",
      });
    });
  });

  test("focuses member rows by userId", async () => {
    const props = buildProps();

    render(
      <CompanyMembersSection
        {...props}
        focusTarget={{ kind: "member", userId: "member-1" }}
      />,
    );

    await waitFor(() => {
      expect(safeScrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    const focusedRow = safeScrollIntoViewMock.mock.calls[0]?.[0] as HTMLElement;
    expect(focusedRow.textContent).toContain("Taylor");
    expect(focusedRow.classList.contains("settings-row-flash")).toBe(true);
  });

  test("focuses invitation rows by email", async () => {
    const props = buildProps();

    render(
      <CompanyMembersSection
        {...props}
        focusTarget={{ kind: "invitation", email: "new@example.com" }}
      />,
    );

    await waitFor(() => {
      expect(safeScrollIntoViewMock).toHaveBeenCalledTimes(1);
    });

    const focusedRow = safeScrollIntoViewMock.mock.calls[0]?.[0] as HTMLElement;
    expect(focusedRow.textContent).toContain("new@example.com");
    expect(focusedRow.classList.contains("settings-row-flash")).toBe(true);
  });
});
