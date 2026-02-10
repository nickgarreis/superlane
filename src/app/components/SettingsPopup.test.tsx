/** @vitest-environment jsdom */

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SettingsPopup } from "./SettingsPopup";
import type { SettingsPopupProps } from "./settings-popup/types";

const buildProps = (overrides: Partial<SettingsPopupProps> = {}): SettingsPopupProps => ({
  isOpen: true,
  onClose: vi.fn(),
  initialTab: "Account",
  activeWorkspace: {
    id: "workspace-1",
    slug: "workspace-1",
    name: "Workspace",
    plan: "Starter",
  },
  account: {
    firstName: "Alex",
    lastName: "Owner",
    email: "alex@example.com",
    avatarUrl: null,
  },
  notifications: {
    events: {
      eventNotifications: true,
      teamActivities: true,
      productUpdates: false,
    },
  },
  company: {
    workspace: {
      id: "workspace-1",
      slug: "workspace-1",
      name: "Workspace",
      plan: "Starter",
      logo: null,
      logoColor: null,
      logoText: "W",
      workosOrganizationId: null,
    },
    capability: {
      hasOrganizationLink: true,
      canManageWorkspaceGeneral: true,
      canManageMembers: true,
      canManageBrandAssets: true,
      canDeleteWorkspace: true,
    },
    members: [],
    pendingInvitations: [],
    brandAssets: [],
    viewerRole: "owner",
  },
  loadingCompany: false,
  onSaveAccount: vi.fn().mockResolvedValue(undefined),
  onUploadAvatar: vi.fn().mockResolvedValue(undefined),
  onRemoveAvatar: vi.fn().mockResolvedValue(undefined),
  onSaveNotifications: vi.fn().mockResolvedValue(undefined),
  onUpdateWorkspaceGeneral: vi.fn().mockResolvedValue(undefined),
  onUploadWorkspaceLogo: vi.fn().mockResolvedValue(undefined),
  onInviteMember: vi.fn().mockResolvedValue(undefined),
  onChangeMemberRole: vi.fn().mockResolvedValue(undefined),
  onRemoveMember: vi.fn().mockResolvedValue(undefined),
  onResendInvitation: vi.fn().mockResolvedValue(undefined),
  onRevokeInvitation: vi.fn().mockResolvedValue(undefined),
  onUploadBrandAsset: vi.fn().mockResolvedValue(undefined),
  onRemoveBrandAsset: vi.fn().mockResolvedValue(undefined),
  onSoftDeleteWorkspace: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

describe("SettingsPopup", () => {
  test("does not render when closed", () => {
    render(<SettingsPopup {...buildProps({ isOpen: false })} />);

    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
  });

  test("switches tabs and closes from backdrop click", async () => {
    const onClose = vi.fn();
    const { container } = render(
      <SettingsPopup
        {...buildProps({
          onClose,
          initialTab: "Notifications",
        })}
      />,
    );

    expect(screen.getByRole("heading", { name: "Notifications" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Company" }));
    expect(await screen.findByRole("heading", { name: "Company" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Billing & Plans" }));
    expect(await screen.findByRole("heading", { name: "Billing & Plans" })).toBeInTheDocument();

    fireEvent.click(container.firstChild as HTMLElement);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
