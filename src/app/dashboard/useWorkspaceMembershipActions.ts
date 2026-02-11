import { useCallback } from "react";
import type { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";
import type { DashboardActionHandler } from "./types";
type UseWorkspaceMembershipActionsArgs = {
  resolvedWorkspaceSlug: string | null;
  asUserId: (value: string) => Id<"users">;
  runWorkspaceSettingsReconciliation: (workspaceSlug: string) => Promise<void>;
  inviteWorkspaceMemberAction: DashboardActionHandler<
    typeof api.settings.inviteWorkspaceMember
  >;
  resendWorkspaceInvitationAction: DashboardActionHandler<
    typeof api.settings.resendWorkspaceInvitation
  >;
  revokeWorkspaceInvitationAction: DashboardActionHandler<
    typeof api.settings.revokeWorkspaceInvitation
  >;
  changeWorkspaceMemberRoleAction: DashboardActionHandler<
    typeof api.settings.changeWorkspaceMemberRole
  >;
  removeWorkspaceMemberAction: DashboardActionHandler<
    typeof api.settings.removeWorkspaceMember
  >;
};
export function useWorkspaceMembershipActions({
  resolvedWorkspaceSlug,
  asUserId,
  runWorkspaceSettingsReconciliation,
  inviteWorkspaceMemberAction,
  resendWorkspaceInvitationAction,
  revokeWorkspaceInvitationAction,
  changeWorkspaceMemberRoleAction,
  removeWorkspaceMemberAction,
}: UseWorkspaceMembershipActionsArgs) {
  const handleInviteWorkspaceMember = useCallback(
    async (payload: { email: string; role: "admin" | "member" }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await inviteWorkspaceMemberAction({
        workspaceSlug: resolvedWorkspaceSlug,
        email: payload.email,
        role: payload.role,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [
      inviteWorkspaceMemberAction,
      resolvedWorkspaceSlug,
      runWorkspaceSettingsReconciliation,
    ],
  );
  const handleChangeWorkspaceMemberRole = useCallback(
    async (payload: { userId: string; role: "admin" | "member" }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await changeWorkspaceMemberRoleAction({
        workspaceSlug: resolvedWorkspaceSlug,
        targetUserId: asUserId(payload.userId),
        role: payload.role,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [
      asUserId,
      changeWorkspaceMemberRoleAction,
      resolvedWorkspaceSlug,
      runWorkspaceSettingsReconciliation,
    ],
  );
  const handleRemoveWorkspaceMember = useCallback(
    async (payload: { userId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await removeWorkspaceMemberAction({
        workspaceSlug: resolvedWorkspaceSlug,
        targetUserId: asUserId(payload.userId),
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [
      asUserId,
      removeWorkspaceMemberAction,
      resolvedWorkspaceSlug,
      runWorkspaceSettingsReconciliation,
    ],
  );
  const handleResendWorkspaceInvitation = useCallback(
    async (payload: { invitationId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await resendWorkspaceInvitationAction({
        workspaceSlug: resolvedWorkspaceSlug,
        invitationId: payload.invitationId,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [
      resolvedWorkspaceSlug,
      resendWorkspaceInvitationAction,
      runWorkspaceSettingsReconciliation,
    ],
  );
  const handleRevokeWorkspaceInvitation = useCallback(
    async (payload: { invitationId: string }) => {
      if (!resolvedWorkspaceSlug) {
        throw new Error("No active workspace");
      }
      await revokeWorkspaceInvitationAction({
        workspaceSlug: resolvedWorkspaceSlug,
        invitationId: payload.invitationId,
      });
      await runWorkspaceSettingsReconciliation(resolvedWorkspaceSlug);
    },
    [
      resolvedWorkspaceSlug,
      revokeWorkspaceInvitationAction,
      runWorkspaceSettingsReconciliation,
    ],
  );
  return {
    handleInviteWorkspaceMember,
    handleChangeWorkspaceMemberRole,
    handleRemoveWorkspaceMember,
    handleResendWorkspaceInvitation,
    handleRevokeWorkspaceInvitation,
  };
}
