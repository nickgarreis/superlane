import { useEffect, useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";
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
      <h4 className="txt-role-body-md font-medium txt-tone-subtle uppercase tracking-wider">
        Invite Team Members
      </h4>
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <DeniedAction
            denied={isMemberManagementDenied}
            reason={memberManagementDeniedReason}
            tooltipAlign="left"
          >
            <input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(event) => onInviteEmailChange(event.target.value)}
              className="w-full bg-transparent border-b border-white/10 rounded-none px-0 py-2.5 txt-role-body-lg txt-tone-primary focus:outline-none focus:border-white/40 transition-colors placeholder:text-white/20"
              disabled={isMemberManagementDenied || inviting}
            />
          </DeniedAction>
        </div>
        <div className="relative">
          {isInviteRoleOpen && (
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsInviteRoleOpen(false)}
            />
          )}
          <DeniedAction
            denied={isMemberManagementDenied}
            reason={memberManagementDeniedReason}
            tooltipAlign="left"
          >
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
              className={cn(
                "h-[42px] px-3 bg-transparent txt-role-body-md font-medium flex items-center gap-2 min-w-[100px] justify-between rounded-lg transition-colors relative z-20 disabled:opacity-50 disabled:cursor-not-allowed",
                isMemberManagementDenied
                  ? "opacity-50 cursor-not-allowed txt-tone-faint"
                  : "cursor-pointer txt-tone-primary hover:bg-white/[0.04]",
              )}
            >
              {inviteRole}
              <ChevronDown
                size={14}
                className={cn(
                  "text-white/40 transition-transform duration-200",
                  isInviteRoleOpen && "rotate-180",
                )}
              />
            </button>
          </DeniedAction>
          {isInviteRoleOpen && (
            <div
              id={inviteRoleListboxId}
              role="listbox"
              aria-label="Invite role"
              className="absolute right-0 top-full mt-1 w-[140px] bg-[#1E1F20] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="py-1">
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
                    className={cn(
                      "w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 hover:bg-white/5 transition-colors group relative cursor-pointer",
                      inviteRole === role
                        ? "text-white bg-white/[0.04]"
                        : "txt-tone-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "truncate",
                        inviteRole !== role &&
                          "group-hover:text-white transition-colors",
                      )}
                    >
                      {role}
                    </span>
                    {inviteRole === role && (
                      <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <DeniedAction
          denied={isMemberManagementDenied}
          reason={memberManagementDeniedReason}
          tooltipAlign="right"
        >
          <button
            onClick={onInvite}
            disabled={!inviteEmail || isMemberManagementDenied || inviting}
            className="h-[42px] px-5 bg-text-tone-primary text-bg-base hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg txt-role-body-md font-medium transition-colors cursor-pointer"
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </DeniedAction>
      </div>
    </div>
  );
}
