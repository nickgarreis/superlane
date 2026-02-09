import { useState } from "react";
import { ChevronDown, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import type { CompanyMember, CompanyPendingInvitation } from "./types";

type CompanyMembersSectionProps = {
  members: CompanyMember[];
  pendingInvitations: CompanyPendingInvitation[];
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
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(event) => setInviteEmail(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2.5 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
              disabled={!canManageMembers || !hasOrganizationLink || inviting}
            />
          </div>

          <div className="relative">
            {isInviteRoleOpen && <div className="fixed inset-0 z-10" onClick={() => setIsInviteRoleOpen(false)} />}
            <button
              onClick={() => setIsInviteRoleOpen((current) => !current)}
              disabled={!canManageMembers || !hasOrganizationLink || inviting}
              className="h-[42px] px-3 bg-transparent border-b border-white/10 rounded-none text-[13px] font-medium text-[#E8E8E8] flex items-center gap-2 hover:border-white/40 transition-colors min-w-[100px] justify-between relative z-20 cursor-pointer disabled:opacity-50"
            >
              {inviteRole}
              <ChevronDown size={14} className="text-white/40" />
            </button>

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

          <button
            onClick={handleInvite}
            disabled={!inviteEmail || !canManageMembers || !hasOrganizationLink || inviting}
            className="h-[42px] px-5 bg-[#E8E8E8] text-bg-base hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
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
                    <span className="px-3 py-1 text-[12px] text-[#E8E8E8]/70">owner</span>
                  ) : (
                    <select
                      value={member.role}
                      onChange={(event) => {
                        const role = event.target.value as "admin" | "member";
                        void onChangeMemberRole({ userId: member.userId, role })
                          .then(() => toast.success("Member role updated"))
                          .catch((error) => {
                            console.error(error);
                            toast.error("Failed to update member role");
                          });
                      }}
                      disabled={!canManageMembers || !hasOrganizationLink}
                      className="bg-white/5 border border-white/10 rounded-full px-3 py-1 text-[12px] text-[#E8E8E8] outline-none disabled:opacity-50"
                    >
                      <option value="member">member</option>
                      <option value="admin">admin</option>
                    </select>
                  )}

                  {member.role !== "owner" && (
                    <button
                      className="text-[12px] text-red-400/80 hover:text-red-400 transition-colors font-medium cursor-pointer disabled:opacity-50"
                      disabled={!canManageMembers || !hasOrganizationLink}
                      onClick={() => {
                        void onRemoveMember({ userId: member.userId })
                          .then(() => toast.success("Member removed"))
                          .catch((error) => {
                            console.error(error);
                            toast.error("Failed to remove member");
                          });
                      }}
                    >
                      Remove
                    </button>
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
                <button
                  title="Resend invitation"
                  className="p-1.5 hover:bg-white/10 text-[#E8E8E8]/30 hover:text-[#58AFFF] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  disabled={!canManageMembers || !hasOrganizationLink}
                  onClick={() => {
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
                <button
                  title="Revoke invitation"
                  className="p-1.5 hover:bg-red-500/10 text-[#E8E8E8]/30 hover:text-red-400 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                  disabled={!canManageMembers || !hasOrganizationLink}
                  onClick={() => {
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
