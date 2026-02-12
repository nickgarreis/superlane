/** @vitest-environment jsdom */

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import { SettingsDangerZoneSection } from "./SettingsDangerZoneSection";

describe("SettingsDangerZoneSection", () => {
  test("deletes workspace only after typed confirmation", async () => {
    const onSoftDeleteWorkspace = vi.fn().mockResolvedValue(undefined);

    render(
      <SettingsDangerZoneSection
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
});
