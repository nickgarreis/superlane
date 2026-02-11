import { Check, ChevronDown, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { WorkspaceRole } from "../../types";
import { cn } from "../../../lib/utils";
import { reportUiError } from "../../lib/errors";
import type { CompanyMember } from "./types";
import { DeniedAction } from "../permissions/DeniedAction";
type MemberRowProps = {
  member: CompanyMember;
  viewerRole?: WorkspaceRole;
  ownerAccountDeniedReason: string;
  isMemberManagementDenied: boolean;
  memberManagementDeniedReason: string;
  onChangeMemberRole: (payload: {
    userId: string;
    role: "admin" | "member";
  }) => Promise<void>;
  onRemoveMember: (payload: { userId: string }) => Promise<void>;
};
export function MemberRow({
  member,
  viewerRole,
  ownerAccountDeniedReason,
  isMemberManagementDenied,
  memberManagementDeniedReason,
  onChangeMemberRole,
  onRemoveMember,
}: MemberRowProps) {
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const fallbackInitial =
    member.name?.trim()?.[0] ?? member.email?.trim()?.[0] ?? "?";
  const avatarAlt =
    member.name?.trim() || member.email?.trim() || "User avatar";
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center txt-role-body-sm font-medium text-white overflow-hidden shadow-inner">
          {member.avatarUrl ? (
            <img
              src={member.avatarUrl}
              alt={avatarAlt}
              className="w-full h-full object-cover"
            />
          ) : (
            fallbackInitial.toUpperCase()
          )}
        </div>
        <div className="flex flex-col">
          <span className="txt-role-body-lg font-medium txt-tone-primary">
            {member.name}
          </span>
          <span className="txt-role-body-sm txt-tone-faint">
            {member.email}
          </span>
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
                "px-3 py-1 txt-role-body-sm",
                viewerRole === "owner"
                  ? "txt-tone-muted"
                  : "txt-tone-faint cursor-not-allowed",
              )}
            >
              owner
            </span>
          </DeniedAction>
        ) : (
          <DeniedAction
            denied={isMemberManagementDenied}
            reason={memberManagementDeniedReason}
            tooltipAlign="right"
          >
            <div className="relative">
              {isRoleDropdownOpen && (
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
              )}
              <button
                type="button"
                onClick={() => {
                  if (isMemberManagementDenied) {
                    return;
                  }
                  setIsRoleDropdownOpen((current) => !current);
                }}
                disabled={isMemberManagementDenied}
                className="flex items-center gap-1.5 px-2 py-1 txt-role-body-sm txt-tone-muted rounded-md transition-colors cursor-pointer hover:bg-white/[0.04] disabled:opacity-50 disabled:hover:bg-transparent"
              >
                {member.role}
                <ChevronDown
                  size={12}
                  className={cn(
                    "text-white/30 transition-transform duration-200",
                    isRoleDropdownOpen && "rotate-180",
                  )}
                />
              </button>
              {isRoleDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-[140px] bg-[#1E1F20] border border-white/10 rounded-xl shadow-xl shadow-black/50 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
                  <div className="py-1">
                    {(["member", "admin"] as const).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={async () => {
                          setIsRoleDropdownOpen(false);
                          if (role === member.role) {
                            return;
                          }
                          try {
                            await onChangeMemberRole({
                              userId: member.userId,
                              role,
                            });
                          } catch (error) {
                            reportUiError(
                              "settings.members.changeRole.memberRow",
                              error,
                              { showToast: false },
                            );
                            toast.error("Failed to update member role");
                          }
                        }}
                        className={cn(
                          "w-full text-left px-3 py-2 txt-role-body-md flex items-center gap-2.5 hover:bg-white/5 transition-colors group relative cursor-pointer",
                          role === member.role
                            ? "text-white bg-white/[0.04]"
                            : "txt-tone-muted",
                        )}
                      >
                        <span
                          className={cn(
                            "truncate",
                            role !== member.role &&
                              "group-hover:text-white transition-colors",
                          )}
                        >
                          {role}
                        </span>
                        {role === member.role && (
                          <Check className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DeniedAction>
        )}
        {member.role !== "owner" && (
          <DeniedAction
            denied={isMemberManagementDenied}
            reason={memberManagementDeniedReason}
            tooltipAlign="right"
          >
            <button
              type="button"
              title="Remove member"
              className="p-1.5 hover:bg-red-500/10 hover:text-red-500 text-white/20 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              disabled={isMemberManagementDenied}
              onClick={async () => {
                if (isMemberManagementDenied) {
                  return;
                }
                try {
                  await onRemoveMember({ userId: member.userId });
                } catch (error) {
                  reportUiError("settings.members.remove.memberRow", error, {
                    showToast: false,
                  });
                  toast.error("Failed to remove member");
                }
              }}
            >
              <Trash2 size={14} />
            </button>
          </DeniedAction>
        )}
      </div>
    </div>
  );
}
