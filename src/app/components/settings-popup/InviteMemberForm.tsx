import { useEffect, useId, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import { DeniedAction } from "../permissions/DeniedAction";
import {
  MENU_CHECK_ICON_CLASS,
  MENU_ITEM_ACTIVE_CLASS,
  MENU_ITEM_CLASS,
  MENU_SURFACE_CLASS,
} from "../ui/menuChrome";
import {
  PRIMARY_ACTION_BUTTON_CLASS,
  UNDERLINE_INPUT_CLASS,
} from "../ui/controlChrome";
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
              className={`${UNDERLINE_INPUT_CLASS} py-2.5 txt-role-body-lg`}
              disabled={isMemberManagementDenied || inviting}
            />
          </DeniedAction>
        </div>
        <div className="relative w-full sm:w-auto">
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
                "h-[42px] px-3 bg-transparent txt-role-body-md font-medium flex items-center gap-2 min-w-[100px] justify-between rounded-lg transition-colors relative z-20 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto",
                isMemberManagementDenied
                  ? "opacity-50 cursor-not-allowed txt-tone-faint"
                  : "cursor-pointer txt-tone-primary hover:bg-surface-hover-soft",
              )}
            >
              {inviteRole}
              <ChevronDown
                size={14}
                className={cn(
                  "text-text-muted-medium transition-transform duration-200",
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
              className={cn(
                "absolute right-0 top-full mt-1 w-full sm:w-[140px] z-20 animate-in fade-in zoom-in-95 duration-100",
                MENU_SURFACE_CLASS,
              )}
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
                      MENU_ITEM_CLASS,
                      inviteRole === role
                        ? MENU_ITEM_ACTIVE_CLASS
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
                      <Check className={cn(MENU_CHECK_ICON_CLASS, "ml-auto")} />
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
            className={`h-[42px] px-5 rounded-lg txt-role-body-md font-medium cursor-pointer w-full sm:w-auto ${PRIMARY_ACTION_BUTTON_CLASS}`}
          >
            {inviting ? "Inviting..." : "Invite"}
          </button>
        </DeniedAction>
      </div>
    </div>
  );
}
