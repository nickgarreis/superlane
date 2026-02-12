import { useState } from "react";
import { toast } from "sonner";
import type { WorkspaceRole } from "../../types";
import { reportUiError } from "../../lib/errors";
import type { CompanyMember, CompanyPendingInvitation } from "./types";
import {
  getMemberManagementDeniedReason,
  getOwnerAccountDeniedReason,
} from "../../lib/permissionRules";
import { InviteMemberForm } from "./InviteMemberForm";
import { MemberRow } from "./MemberRow";
import { PendingInvitationRow } from "./PendingInvitationRow";
type CompanyMembersSectionProps = {
  members: CompanyMember[];
  pendingInvitations: CompanyPendingInvitation[];
  viewerRole?: WorkspaceRole;
  hasOrganizationLink: boolean;
  canManageMembers: boolean;
  onInviteMember: (payload: {
    email: string;
    role: "admin" | "member";
  }) => Promise<void>;
  onChangeMemberRole: (payload: {
    userId: string;
    role: "admin" | "member";
  }) => Promise<void>;
  onRemoveMember: (payload: { userId: string }) => Promise<void>;
  onResendInvitation: (payload: { invitationId: string }) => Promise<void>;
  onRevokeInvitation: (payload: { invitationId: string }) => Promise<void>;
};
export function CompanyMembersSection({
  members,
  pendingInvitations,
  viewerRole,
  hasOrganizationLink,
  canManageMembers,
  onInviteMember,
  onChangeMemberRole,
  onRemoveMember,
  onResendInvitation,
  onRevokeInvitation,
}: CompanyMembersSectionProps) {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [inviting, setInviting] = useState(false);
  const memberManagementDeniedReason =
    getMemberManagementDeniedReason({
      role: viewerRole,
      hasOrganizationLink,
    }) ?? "Only admins and owners can manage members";
  const ownerAccountDeniedReason =
    getOwnerAccountDeniedReason(viewerRole) ??
    "Only owners can manage owner accounts";
  const isMemberManagementDenied = !canManageMembers || !hasOrganizationLink;
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      return;
    }
    setInviting(true);
    try {
      await onInviteMember({ email: inviteEmail.trim(), role: inviteRole });
      setInviteEmail("");
      setInviteRole("member");
      toast.success("Invitation sent");
    } catch (error) {
      reportUiError("settings.members.invite", error, { showToast: false });
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };
  const handleChangeMemberRole = async (payload: {
    userId: string;
    role: "admin" | "member";
  }) => {
    try {
      await onChangeMemberRole(payload);
      toast.success("Member role updated");
    } catch (error) {
      reportUiError("settings.members.changeRole", error, { showToast: false });
      toast.error("Failed to update member role");
    }
  };
  const handleRemoveMember = async (payload: { userId: string }) => {
    try {
      await onRemoveMember(payload);
      toast.success("Member removed");
    } catch (error) {
      reportUiError("settings.members.remove", error, { showToast: false });
      toast.error("Failed to remove member");
    }
  };
  const handleResendInvitation = async (payload: { invitationId: string }) => {
    try {
      await onResendInvitation(payload);
      toast.success("Invitation resent");
    } catch (error) {
      reportUiError("settings.members.resendInvitation", error, {
        showToast: false,
      });
      toast.error("Failed to resend invitation");
    }
  };
  const handleRevokeInvitation = async (payload: { invitationId: string }) => {
    try {
      await onRevokeInvitation(payload);
      toast.success("Invitation revoked");
    } catch (error) {
      reportUiError("settings.members.revokeInvitation", error, {
        showToast: false,
      });
      toast.error("Failed to revoke invitation");
    }
  };
  return (
    <div className="flex flex-col gap-5">
      {!hasOrganizationLink && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 txt-role-body-md text-amber-100">
          This workspace is not linked to a WorkOS organization. Member
          management is disabled until it is linked.
        </div>
      )}
      <InviteMemberForm
        inviteEmail={inviteEmail}
        onInviteEmailChange={setInviteEmail}
        inviteRole={inviteRole}
        onInviteRoleChange={setInviteRole}
        inviting={inviting}
        isMemberManagementDenied={isMemberManagementDenied}
        memberManagementDeniedReason={memberManagementDeniedReason}
        onInvite={handleInvite}
      />
      <div className="flex flex-col">
        <h4 className="txt-role-body-md font-medium txt-tone-subtle uppercase tracking-wider mb-4">
          Members ({members.length + pendingInvitations.length})
        </h4>
        <div className="flex flex-col">
          {members.map((member) => (
            <MemberRow
              key={member.userId}
              member={member}
              viewerRole={viewerRole}
              ownerAccountDeniedReason={ownerAccountDeniedReason}
              isMemberManagementDenied={isMemberManagementDenied}
              memberManagementDeniedReason={memberManagementDeniedReason}
              onChangeMemberRole={handleChangeMemberRole}
              onRemoveMember={handleRemoveMember}
            />
          ))}
          {pendingInvitations.map((invitation) => (
            <PendingInvitationRow
              key={invitation.invitationId}
              invitation={invitation}
              isMemberManagementDenied={isMemberManagementDenied}
              memberManagementDeniedReason={memberManagementDeniedReason}
              onResendInvitation={handleResendInvitation}
              onRevokeInvitation={handleRevokeInvitation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
