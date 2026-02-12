import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import type { WorkspaceRole } from "../../types";
import type { SettingsFocusTarget } from "../../dashboard/types";
import { reportUiError } from "../../lib/errors";
import { safeScrollIntoView } from "../../lib/dom";
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
  focusTarget?: SettingsFocusTarget | null;
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
  focusTarget = null,
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
  const memberRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const memberEmailRowRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const invitationEmailRowRefs = useRef<Record<string, HTMLDivElement | null>>(
    {},
  );
  const lastAppliedFocusKeyRef = useRef<string | null>(null);
  const normalizedFocusEmail = useMemo(() => {
    if (!focusTarget) {
      return null;
    }
    if (focusTarget.kind === "brandAsset") {
      return null;
    }
    const value = focusTarget.email?.trim().toLowerCase();
    return value && value.length > 0 ? value : null;
  }, [focusTarget]);
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
  useEffect(() => {
    if (!focusTarget) {
      return;
    }

    const focusKey =
      focusTarget.kind === "member"
        ? `member:${focusTarget.userId ?? ""}:${normalizedFocusEmail ?? ""}`
        : focusTarget.kind === "invitation"
          ? `invitation:${normalizedFocusEmail ?? ""}`
          : null;

    if (!focusKey || focusKey === lastAppliedFocusKeyRef.current) {
      return;
    }

    const focusElement =
      focusTarget.kind === "member"
        ? (focusTarget.userId
            ? memberRowRefs.current[focusTarget.userId]
            : null) ??
          (normalizedFocusEmail
            ? memberEmailRowRefs.current[normalizedFocusEmail]
            : null)
        : normalizedFocusEmail
          ? invitationEmailRowRefs.current[normalizedFocusEmail]
          : null;

    if (!focusElement) {
      return;
    }

    lastAppliedFocusKeyRef.current = focusKey;
    safeScrollIntoView(focusElement, { block: "center", behavior: "smooth" });
    focusElement.classList.remove("settings-row-flash");
    void focusElement.offsetWidth;
    focusElement.classList.add("settings-row-flash");
    const timeout = window.setTimeout(() => {
      focusElement.classList.remove("settings-row-flash");
    }, 1700);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [focusTarget, normalizedFocusEmail, pendingInvitations, members]);

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
          {members.map((member) => {
            const emailKey = member.email.trim().toLowerCase();
            return (
              <div
                key={member.userId}
                ref={(node) => {
                  memberRowRefs.current[member.userId] = node;
                  memberEmailRowRefs.current[emailKey] = node;
                }}
              >
                <MemberRow
                  member={member}
                  viewerRole={viewerRole}
                  ownerAccountDeniedReason={ownerAccountDeniedReason}
                  isMemberManagementDenied={isMemberManagementDenied}
                  memberManagementDeniedReason={memberManagementDeniedReason}
                  onChangeMemberRole={handleChangeMemberRole}
                  onRemoveMember={handleRemoveMember}
                />
              </div>
            );
          })}
          {pendingInvitations.map((invitation) => {
            const emailKey = invitation.email.trim().toLowerCase();
            return (
              <div
                key={invitation.invitationId}
                ref={(node) => {
                  invitationEmailRowRefs.current[emailKey] = node;
                }}
              >
                <PendingInvitationRow
                  invitation={invitation}
                  isMemberManagementDenied={isMemberManagementDenied}
                  memberManagementDeniedReason={memberManagementDeniedReason}
                  onResendInvitation={handleResendInvitation}
                  onRevokeInvitation={handleRevokeInvitation}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
