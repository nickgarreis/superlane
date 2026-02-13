/** @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SettingsDangerZoneSection } from "./SettingsDangerZoneSection";

const COMPANY_SETTINGS = {
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
  viewerRole: "owner" as const,
};

describe("SettingsDangerZoneSection", () => {
  test("deletes workspace only after typed confirmation", async () => {
    const onSoftDeleteWorkspace = vi.fn().mockResolvedValue(undefined);

    render(
      <SettingsDangerZoneSection
        company={COMPANY_SETTINGS}
        onSoftDeleteWorkspace={onSoftDeleteWorkspace}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete Workspace" }));

    expect(
      screen.getByRole("heading", { name: "Delete workspace permanently?" }),
    ).toBeInTheDocument();

    const confirmationInput = screen.getByRole("textbox", {
      name: "Delete workspace confirmation",
    });
    const confirmDeleteButton = screen.getAllByRole("button", {
      name: "Delete Workspace",
    })[1];

    expect(confirmDeleteButton).toBeDisabled();

    fireEvent.change(confirmationInput, { target: { value: "delete" } });
    expect(confirmDeleteButton).toBeDisabled();

    fireEvent.change(confirmationInput, { target: { value: "DELETE" } });
    expect(confirmDeleteButton).not.toBeDisabled();

    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(onSoftDeleteWorkspace).toHaveBeenCalledTimes(1);
    });
  });

  test("renders immediate owner action while company data is loading", async () => {
    const onSoftDeleteWorkspace = vi.fn().mockResolvedValue(undefined);

    render(
      <SettingsDangerZoneSection
        company={null}
        viewerRole="owner"
        layout="button"
        onSoftDeleteWorkspace={onSoftDeleteWorkspace}
      />,
    );

    const openButton = screen.getByRole("button", { name: "Delete Workspace" });
    expect(openButton).toBeEnabled();

    fireEvent.click(openButton);

    const confirmationInput = screen.getByRole("textbox", {
      name: "Delete workspace confirmation",
    });
    fireEvent.change(confirmationInput, { target: { value: "DELETE" } });

    const confirmDeleteButton = screen.getAllByRole("button", {
      name: "Delete Workspace",
    })[1];
    fireEvent.click(confirmDeleteButton);

    await waitFor(() => {
      expect(onSoftDeleteWorkspace).toHaveBeenCalledTimes(1);
    });
  });

  test("disables fallback action for non-owners while company data is loading", () => {
    render(
      <SettingsDangerZoneSection
        company={null}
        viewerRole="admin"
        layout="button"
        onSoftDeleteWorkspace={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Delete Workspace" }),
    ).toBeDisabled();
  });

  test("disables fallback action when viewer role is unknown", () => {
    render(
      <SettingsDangerZoneSection
        company={null}
        viewerRole={null}
        layout="button"
        onSoftDeleteWorkspace={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Delete Workspace" }),
    ).toBeDisabled();
  });
});
