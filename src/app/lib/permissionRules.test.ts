import { describe, expect, test } from "vitest";
import {
  getBrandAssetDeniedReason,
  getCommentAuthorDeniedReason,
  getCreateWorkspaceDeniedReason,
  getMemberManagementDeniedReason,
  getOwnerAccountDeniedReason,
  getProjectLifecycleDeniedReason,
  getReviewApprovalDeniedReason,
  getReviewCommentAuthorDeniedReason,
  getWorkspaceDeleteDeniedReason,
  getWorkspaceGeneralDeniedReason,
  isAdminOrOwner,
  isOwner,
} from "./permissionRules";

describe("permissionRules", () => {
  test("role helpers resolve owner/admin/member access correctly", () => {
    expect(isOwner("owner")).toBe(true);
    expect(isOwner("admin")).toBe(false);

    expect(isAdminOrOwner("owner")).toBe(true);
    expect(isAdminOrOwner("admin")).toBe(true);
    expect(isAdminOrOwner("member")).toBe(false);
    expect(isAdminOrOwner(null)).toBe(false);
  });

  test("workspace and lifecycle deny messages", () => {
    expect(getCreateWorkspaceDeniedReason("owner")).toBeNull();
    expect(getCreateWorkspaceDeniedReason("admin")).toBe("Only owners can create workspaces");

    expect(getProjectLifecycleDeniedReason("admin")).toBeNull();
    expect(getProjectLifecycleDeniedReason("member")).toBe(
      "Only admins and owners can manage projects",
    );

    expect(getWorkspaceGeneralDeniedReason("owner")).toBeNull();
    expect(getWorkspaceGeneralDeniedReason("member")).toBe(
      "Only admins and owners can manage workspace settings",
    );

    expect(getWorkspaceDeleteDeniedReason("owner")).toBeNull();
    expect(getWorkspaceDeleteDeniedReason("admin")).toBe("Only owners can delete workspaces");

    expect(getReviewApprovalDeniedReason("owner")).toBeNull();
    expect(getReviewApprovalDeniedReason("admin")).toBe(
      "Only owners can approve projects in review",
    );
  });

  test("member-management precedence prioritizes organization-link requirements", () => {
    expect(
      getMemberManagementDeniedReason({
        role: "owner",
        hasOrganizationLink: false,
      }),
    ).toBe("Member management requires a linked WorkOS organization");

    expect(
      getMemberManagementDeniedReason({
        role: "member",
        hasOrganizationLink: true,
      }),
    ).toBe("Only admins and owners can manage members");

    expect(
      getMemberManagementDeniedReason({
        role: "admin",
        hasOrganizationLink: true,
      }),
    ).toBeNull();
  });

  test("owner/member edge-case deny messages", () => {
    expect(getOwnerAccountDeniedReason("owner")).toBeNull();
    expect(getOwnerAccountDeniedReason("admin")).toBe("Only owners can manage owner accounts");

    expect(getBrandAssetDeniedReason("owner")).toBeNull();
    expect(getBrandAssetDeniedReason("member")).toBe(
      "Only admins and owners can manage brand assets",
    );

    expect(getCommentAuthorDeniedReason(true)).toBeNull();
    expect(getCommentAuthorDeniedReason(false)).toBe(
      "You can only edit, delete, or resolve your own comments",
    );

    expect(getReviewCommentAuthorDeniedReason(true)).toBeNull();
    expect(getReviewCommentAuthorDeniedReason(false)).toBe(
      "You can only delete your own review comments",
    );
  });
});
