import { useState } from "react";
import { ChevronDown, RotateCcw, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import type { WorkspaceRole } from "../../types";
import { cn } from "../../../lib/utils";
import type { CompanyMember, CompanyPendingInvitation } from "./types";
import { DeniedAction } from "../permissions/DeniedAction";
import {
  getMemberManagementDeniedReason,
  getOwnerAccountDeniedReason,
} from "../../lib/permissionRules";

type CompanyMembersSectionProps = {
  members: CompanyMember[];
  pendingInvitations: CompanyPendingInvitation[];
  viewerRole?: WorkspaceRole;
  hasOrganizationLink: boolean;
  canManageMembers: boolean;
  onInviteMember: (payload: { email: string; role: "admin" | "member" }) => Promise<void>;
  onChangeMemberRole: (payload: { userId: string; role: "admin" | "member" }) => Promise<void>;
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
  const [isInviteRoleOpen, setIsInviteRoleOpen] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [openRoleDropdown, setOpenRoleDropdown] = useState<string | null>(null);
  const memberManagementDeniedReason =
    getMemberManagementDeniedReason({
      role: viewerRole,
      hasOrganizationLink,
    }) ?? "Only admins and owners can manage members";
  const ownerAccountDeniedReason =
    getOwnerAccountDeniedReason(viewerRole) ?? "Only owners can manage owner accounts";
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
      console.error(error);
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 className="text-[16px] font-medium text-[#E8E8E8]">Members</h3>
        <p className="text-[13px] text-[#E8E8E8]/40">Manage workspace access and invitations.</p>
      </div>

      {!hasOrganizationLink && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-[13px] text-amber-100">
          This workspace is not linked to a WorkOS organization. Member management is disabled until it is linked.
        </div>
      )}

      <div className="flex flex-col gap-3 pb-2">
        <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider">Invite Team Members</h4>
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="left">
              <input
                type="email"
                placeholder="Email address"
                value={inviteEmail}
                onChange={(event) => setInviteEmail(event.target.value)}
                className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2.5 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
                disabled={isMemberManagementDenied || inviting}
              />
            </DeniedAction>
          </div>

          <div className="relative">
            {isInviteRoleOpen && <div className="fixed inset-0 z-10" onClick={() => setIsInviteRoleOpen(false)} />}
            <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="left">
              <button
                onClick={() => {
                  if (isMemberManagementDenied) {
                    return;
                  }
                  setIsInviteRoleOpen((current) => !current);
                }}
                disabled={isMemberManagementDenied || inviting}
                className="h-[42px] px-3 bg-transparent border-b border-white/10 rounded-none text-[13px] font-medium text-[#E8E8E8] flex items-center gap-2 hover:border-white/40 transition-colors min-w-[100px] justify-between relative z-20 cursor-pointer disabled:opacity-50"
              >
                {inviteRole}
                <ChevronDown size={14} className="text-white/40" />
              </button>
            </DeniedAction>

            {isInviteRoleOpen && (
              <div className="absolute right-0 top-full mt-1 w-[120px] bg-[#1A1A1C] border border-[#262626] rounded-lg shadow-xl overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                {["member", "admin"].map((role) => (
                  <button
                    key={role}
                    onClick={() => {
                      setInviteRole(role as "admin" | "member");
                      setIsInviteRoleOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-[13px] hover:bg-white/5 cursor-pointer text-[#E8E8E8]"
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>

          <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="right">
            <button
              onClick={handleInvite}
              disabled={!inviteEmail || isMemberManagementDenied || inviting}
              className="h-[42px] px-5 bg-[#E8E8E8] text-bg-base hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
            >
              {inviting ? "Inviting..." : "Invite"}
            </button>
          </DeniedAction>
        </div>
      </div>

      <div className="flex flex-col">
        <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider mb-4">Members ({members.length + pendingInvitations.length})</h4>
        <div className="flex flex-col">
          {members.map((member) => {
            const fallbackInitial = member.name?.trim()?.[0] ?? member.email?.trim()?.[0] ?? "?";

            return (
              <div
                key={member.userId}
                className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[12px] font-medium text-white overflow-hidden shadow-inner">
                    {member.avatarUrl ? (
                      <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />
                    ) : (
                      fallbackInitial.toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[14px] font-medium text-[#E8E8E8]">{member.name}</span>
                    <span className="text-[12px] text-[#E8E8E8]/40">{member.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {member.role === "owner" ? (
                    <DeniedAction
                      denied={viewerRole !== "owner"}
                      reason={viewerRole === "owner" ? null : ownerAccountDeniedReason}
                      tooltipAlign="right"
                    >
                      <span
                        className={cn(
                          "px-3 py-1 text-[12px]",
                          viewerRole === "owner" ? "text-[#E8E8E8]/70" : "text-[#E8E8E8]/40 cursor-not-allowed",
                        )}
                      >
                        owner
                      </span>
                    </DeniedAction>
                  ) : (
                    <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="right">
                      <div className="relative">
                        {openRoleDropdown === member.userId && (
                          <div className="fixed inset-0 z-10" onClick={() => setOpenRoleDropdown(null)} />
                        )}
                        <button
                          onClick={() => {
                            if (isMemberManagementDenied) return;
                            setOpenRoleDropdown(openRoleDropdown === member.userId ? null : member.userId);
                          }}
                          disabled={isMemberManagementDenied}
                          className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#E8E8E8]/70 hover:text-[#E8E8E8] rounded-md hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent"
                        >
                          {member.role}
                          <ChevronDown size={12} className="text-white/30" />
                        </button>
                        {openRoleDropdown === member.userId && (
                          <div className="absolute right-0 top-full mt-1 w-[100px] bg-[#1A1A1C] border border-[#262626] rounded-lg shadow-xl overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
                            {(["member", "admin"] as const).map((role) => (
                              <button
                                key={role}
                                onClick={() => {
                                  setOpenRoleDropdown(null);
                                  if (role === member.role) return;
                                  void onChangeMemberRole({ userId: member.userId, role })
                                    .then(() => toast.success("Member role updated"))
                                    .catch((error) => {
                                      console.error(error);
                                      toast.error("Failed to update member role");
                                    });
                                }}
                                className={cn(
                                  "w-full px-3 py-1.5 text-left text-[12px] cursor-pointer transition-colors",
                                  role === member.role
                                    ? "text-[#E8E8E8] bg-white/5"
                                    : "text-[#E8E8E8]/60 hover:bg-white/5 hover:text-[#E8E8E8]",
                                )}
                              >
                                {role}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </DeniedAction>
                  )}

                  {member.role !== "owner" && (
                    <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="right">
                      <button
                        title="Remove member"
                        className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-white/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        disabled={isMemberManagementDenied}
                        onClick={() => {
                          if (isMemberManagementDenied) {
                            return;
                          }
                          void onRemoveMember({ userId: member.userId })
                            .then(() => toast.success("Member removed"))
                            .catch((error) => {
                              console.error(error);
                              toast.error("Failed to remove member");
                            });
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </DeniedAction>
                  )}
                </div>
              </div>
            );
          })}

          {pendingInvitations.map((invitation) => (
            <div
              key={invitation.invitationId}
              className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[12px] font-medium text-white/60 overflow-hidden shadow-inner border border-dashed border-white/20">
                  {invitation.email.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-medium text-[#E8E8E8]/70">{invitation.email}</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-300/80 rounded">Pending</span>
                  </div>
                  <span className="text-[12px] text-[#E8E8E8]/40">
                    {invitation.requestedRole} · expires {new Date(invitation.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="right">
                  <button
                    title="Resend invitation"
                    className="p-1.5 hover:bg-white/10 text-[#E8E8E8]/30 hover:text-[#58AFFF] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    disabled={isMemberManagementDenied}
                    onClick={() => {
                      if (isMemberManagementDenied) {
                        return;
                      }
                      void onResendInvitation({ invitationId: invitation.invitationId })
                        .then(() => toast.success("Invitation resent"))
                        .catch((error) => {
                          console.error(error);
                          toast.error("Failed to resend invitation");
                        });
                    }}
                  >
                    <RotateCcw size={14} />
                  </button>
                </DeniedAction>
                <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="right">
                  <button
                    title="Revoke invitation"
                    className="p-1.5 hover:bg-red-500/10 text-[#E8E8E8]/30 hover:text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                    disabled={isMemberManagementDenied}
                    onClick={() => {
                      if (isMemberManagementDenied) {
                        return;
                      }
                      void onRevokeInvitation({ invitationId: invitation.invitationId })
                        .then(() => toast.success("Invitation revoked"))
                        .catch((error) => {
                          console.error(error);
                          toast.error("Failed to revoke invitation");
                        });
                    }}
                  >
                    <X size={14} />
                  </button>
                </DeniedAction>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
