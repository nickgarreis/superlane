import type { WorkspaceRole } from "../types";
type Role = WorkspaceRole | null | undefined;
type MemberManagementRuleArgs = { role: Role; hasOrganizationLink: boolean };
export const isOwner = (role: Role): boolean => role === "owner";
export const isAdminOrOwner = (role: Role): boolean =>
  role === "admin" || role === "owner";
export const getCreateWorkspaceDeniedReason = (role: Role): string | null =>
  isOwner(role) ? null : "Only owners can create workspaces";
export const getProjectLifecycleDeniedReason = (role: Role): string | null =>
  isAdminOrOwner(role) ? null : "Only admins and owners can manage projects";
export const getWorkspaceGeneralDeniedReason = (role: Role): string | null =>
  isAdminOrOwner(role)
    ? null
    : "Only admins and owners can manage workspace settings";
export const getWorkspaceDeleteDeniedReason = (role: Role): string | null =>
  isOwner(role) ? null : "Only owners can delete workspaces";
export const getReviewApprovalDeniedReason = (role: Role): string | null =>
  isOwner(role) ? null : "Only owners can approve projects in review";
export const getMemberManagementDeniedReason = ({
  role,
  hasOrganizationLink,
}: MemberManagementRuleArgs): string | null => {
  if (!hasOrganizationLink) {
    return "Member management requires a linked WorkOS organization";
  }
  if (!isAdminOrOwner(role)) {
    return "Only admins and owners can manage members";
  }
  return null;
};
export const getOwnerAccountDeniedReason = (role: Role): string | null =>
  isOwner(role) ? null : "Only owners can manage owner accounts";
export const getBrandAssetDeniedReason = (role: Role): string | null =>
  isAdminOrOwner(role)
    ? null
    : "Only admins and owners can manage brand assets";
export const getCommentAuthorDeniedReason = (
  isAuthor: boolean,
): string | null =>
  isAuthor ? null : "You can only edit, delete, or resolve your own comments";
export const getReviewCommentAuthorDeniedReason = (
  isAuthor: boolean,
): string | null =>
  isAuthor ? null : "You can only delete your own review comments";
