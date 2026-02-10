/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { CompanyMembersSection } from "./CompanyMembersSection";

describe("CompanyMembersSection", () => {
  test("invites, updates roles, removes members, and manages invitations", async () => {
    const onInviteMember = vi.fn().mockResolvedValue(undefined);
    const onChangeMemberRole = vi.fn().mockResolvedValue(undefined);
    const onRemoveMember = vi.fn().mockResolvedValue(undefined);
    const onResendInvitation = vi.fn().mockResolvedValue(undefined);
    const onRevokeInvitation = vi.fn().mockResolvedValue(undefined);

    render(
      <CompanyMembersSection
        members={[
          {
            userId: "owner-1",
            name: "Owner",
            email: "owner@example.com",
            role: "owner",
            status: "active",
            avatarUrl: null,
          },
          {
            userId: "member-1",
            name: "Taylor",
            email: "taylor@example.com",
            role: "member",
            status: "active",
            avatarUrl: null,
          },
        ]}
        pendingInvitations={[
          {
            invitationId: "invite-1",
            email: "new@example.com",
            state: "pending",
            requestedRole: "member",
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
        ]}
        viewerRole="owner"
        hasOrganizationLink
        canManageMembers
        onInviteMember={onInviteMember}
        onChangeMemberRole={onChangeMemberRole}
        onRemoveMember={onRemoveMember}
        onResendInvitation={onResendInvitation}
        onRevokeInvitation={onRevokeInvitation}
      />, 
    );

    fireEvent.change(screen.getByPlaceholderText("Email address"), {
      target: { value: "invitee@example.com" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Invite" }));

    await waitFor(() => {
      expect(onInviteMember).toHaveBeenCalledWith({ email: "invitee@example.com", role: "member" });
    });

    fireEvent.click(screen.getAllByRole("button", { name: "member" })[1]);
    fireEvent.click(screen.getByRole("button", { name: "admin" }));

    await waitFor(() => {
      expect(onChangeMemberRole).toHaveBeenCalledWith({ userId: "member-1", role: "admin" });
    });

    fireEvent.click(screen.getByTitle("Remove member"));

    await waitFor(() => {
      expect(onRemoveMember).toHaveBeenCalledWith({ userId: "member-1" });
    });

    fireEvent.click(screen.getByTitle("Resend invitation"));
    fireEvent.click(screen.getByTitle("Revoke invitation"));

    await waitFor(() => {
      expect(onResendInvitation).toHaveBeenCalledWith({ invitationId: "invite-1" });
      expect(onRevokeInvitation).toHaveBeenCalledWith({ invitationId: "invite-1" });
    });
  });
});
