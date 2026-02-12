/** @vitest-environment jsdom */

import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CompanyTab } from "./CompanyTab";

vi.mock("./CompanyMembersSection", () => ({
  CompanyMembersSection: () => (
    <div data-testid="members-section">Members section</div>
  ),
}));

vi.mock("./CompanyBrandAssetsSection", () => ({
  CompanyBrandAssetsSection: () => (
    <div data-testid="brand-assets-section">Brand assets section</div>
  ),
}));

describe("CompanyTab", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("renders loading state", () => {
    render(
      <CompanyTab
        activeWorkspace={undefined}
        company={null}
        loading
        onUpdateWorkspaceGeneral={vi.fn().mockResolvedValue(undefined)}
        onUploadWorkspaceLogo={vi.fn().mockResolvedValue(undefined)}
        onInviteMember={vi.fn().mockResolvedValue(undefined)}
        onChangeMemberRole={vi.fn().mockResolvedValue(undefined)}
        onRemoveMember={vi.fn().mockResolvedValue(undefined)}
        onResendInvitation={vi.fn().mockResolvedValue(undefined)}
        onRevokeInvitation={vi.fn().mockResolvedValue(undefined)}
        onUploadBrandAsset={vi.fn().mockResolvedValue(undefined)}
        onRemoveBrandAsset={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    expect(screen.getByText("Loading company settings...")).toBeInTheDocument();
  });

  test("debounces workspace name updates and handles logo actions", async () => {
    const onUpdateWorkspaceGeneral = vi.fn().mockResolvedValue(undefined);
    const onUploadWorkspaceLogo = vi.fn().mockResolvedValue(undefined);

    const { container } = render(
      <CompanyTab
        activeWorkspace={{
          id: "workspace-1",
          slug: "workspace-1",
          name: "Workspace",
          plan: "Starter",
        }}
        company={{
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
        }}
        loading={false}
        onUpdateWorkspaceGeneral={onUpdateWorkspaceGeneral}
        onUploadWorkspaceLogo={onUploadWorkspaceLogo}
        onInviteMember={vi.fn().mockResolvedValue(undefined)}
        onChangeMemberRole={vi.fn().mockResolvedValue(undefined)}
        onRemoveMember={vi.fn().mockResolvedValue(undefined)}
        onResendInvitation={vi.fn().mockResolvedValue(undefined)}
        onRevokeInvitation={vi.fn().mockResolvedValue(undefined)}
        onUploadBrandAsset={vi.fn().mockResolvedValue(undefined)}
        onRemoveBrandAsset={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    const nameInput = container.querySelector('input[type="text"]');
    expect(nameInput).not.toBeNull();
    expect(
      screen.queryByText("Workspace Name"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Manage billing" }),
    ).toBeInTheDocument();

    act(() => {
      fireEvent.change(nameInput as HTMLInputElement, {
        target: { value: "Workspace Draft" },
      });
    });

    act(() => {
      fireEvent.change(nameInput as HTMLInputElement, {
        target: { value: "Workspace Renamed" },
      });
    });

    act(() => {
      vi.advanceTimersByTime(801);
    });
    expect(onUpdateWorkspaceGeneral).toHaveBeenCalledTimes(1);
    expect(onUpdateWorkspaceGeneral).toHaveBeenCalledWith({
      name: "Workspace Renamed",
    });

    const fileInput = container.querySelector('input[type="file"]');
    expect(fileInput).not.toBeNull();

    await act(async () => {
      fireEvent.change(fileInput as HTMLInputElement, {
        target: {
          files: [new File(["logo"], "logo.png", { type: "image/png" })],
        },
      });
    });

    expect(onUploadWorkspaceLogo).toHaveBeenCalledWith(
      expect.objectContaining({ name: "logo.png" }),
    );
  });
});
