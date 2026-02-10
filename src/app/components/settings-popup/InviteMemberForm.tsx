import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { DeniedAction } from "../permissions/DeniedAction";

type InviteMemberFormProps = {
  inviteEmail: string;
  onInviteEmailChange: (value: string) => void;
  onInviteRoleChange: (role: "admin" | "member") => void;
  inviteRole: "admin" | "member";
  inviting: boolean;
  isMemberManagementDenied: boolean;
  memberManagementDeniedReason: string;
  onInvite: () => void;
};

export function InviteMemberForm({
  inviteEmail,
  onInviteEmailChange,
  onInviteRoleChange,
  inviteRole,
  inviting,
  isMemberManagementDenied,
  memberManagementDeniedReason,
  onInvite,
}: InviteMemberFormProps) {
  const [isInviteRoleOpen, setIsInviteRoleOpen] = useState(false);
  const inviteRoleListboxId = useId();

  useEffect(() => {
    if (!isInviteRoleOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsInviteRoleOpen(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isInviteRoleOpen]);

  return (
    <div className="flex flex-col gap-3 pb-2">
      <h4 className="text-[13px] font-medium text-[#E8E8E8]/60 uppercase tracking-wider">Invite Team Members</h4>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="left">
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(event) => onInviteEmailChange(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2.5 text-[14px] text-[#E8E8E8] focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
              disabled={isMemberManagementDenied || inviting}
            />
          </DeniedAction>
        </div>

        <div className="relative">
          {isInviteRoleOpen && <div className="fixed inset-0 z-10" onClick={() => setIsInviteRoleOpen(false)} />}
          <DeniedAction denied={isMemberManagementDenied} reason={memberManagementDeniedReason} tooltipAlign="left">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={isInviteRoleOpen}
              aria-controls={isInviteRoleOpen ? inviteRoleListboxId : undefined}
              aria-disabled={isMemberManagementDenied || inviting}
              onClick={() => {
                if (isMemberManagementDenied || inviting) {
                  return;
                }
                setIsInviteRoleOpen((current) => !current);
              }}
              disabled={inviting}
              className={`h-[42px] px-3 bg-transparent border-b border-white/10 rounded-none text-[13px] font-medium text-[#E8E8E8] flex items-center gap-2 hover:border-white/40 transition-colors min-w-[100px] justify-between relative z-20 disabled:opacity-50 disabled:cursor-not-allowed ${
                isMemberManagementDenied ? "opacity-50 cursor-not-allowed hover:border-white/10" : "cursor-pointer"
              }`}
            >
              {inviteRole}
              <ChevronDown size={14} className="text-white/40" />
            </button>
          </DeniedAction>

          {isInviteRoleOpen && (
            <div
              id={inviteRoleListboxId}
              role="listbox"
              aria-label="Invite role"
              className="absolute right-0 top-full mt-1 w-[120px] bg-[#1A1A1C] border border-[#262626] rounded-lg shadow-xl overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100"
            >
              {(["member", "admin"] as const).map((role) => (
                <button
                  key={role}
                  type="button"
                  role="option"
                  aria-selected={inviteRole === role}
                  onClick={() => {
                    onInviteRoleChange(role);
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
            onClick={onInvite}
            disabled={!inviteEmail || isMemberManagementDenied || inviting}
            className="h-[42px] px-5 bg-[#E8E8E8] text-bg-base hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-[13px] font-medium transition-colors cursor-pointer"
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </DeniedAction>
      </div>
    </div>
  );
}
