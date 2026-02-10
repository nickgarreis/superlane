import { ChevronDown, Trash2 } from "lucide-react";
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
  onChangeMemberRole: (payload: { userId: string; role: "admin" | "member" }) => Promise<void>;
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
  const fallbackInitial = member.name?.trim()?.[0] ?? member.email?.trim()?.[0] ?? "?";
  const avatarAlt = member.name?.trim() || member.email?.trim() || "User avatar";

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-[12px] font-medium text-white overflow-hidden shadow-inner">
          {member.avatarUrl ? (
            <img src={member.avatarUrl} alt={avatarAlt} className="w-full h-full object-cover" />
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
              {isRoleDropdownOpen && <div className="fixed inset-0 z-10" onClick={() => setIsRoleDropdownOpen(false)} />}
              <button
                type="button"
                onClick={() => {
                  if (isMemberManagementDenied) {
                    return;
                  }
                  setIsRoleDropdownOpen((current) => !current);
                }}
                disabled={isMemberManagementDenied}
                className="flex items-center gap-1.5 px-2 py-1 text-[12px] text-[#E8E8E8]/70 hover:text-[#E8E8E8] rounded-md hover:bg-white/5 transition-colors cursor-pointer disabled:opacity-50 disabled:hover:bg-transparent"
              >
                {member.role}
                <ChevronDown size={12} className="text-white/30" />
              </button>
              {isRoleDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-[100px] bg-[#1A1A1C] border border-[#262626] rounded-lg shadow-xl overflow-hidden py-1 z-20 animate-in fade-in zoom-in-95 duration-100">
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
                          await onChangeMemberRole({ userId: member.userId, role });
                        } catch (error) {
                          reportUiError("settings.members.changeRole.memberRow", error, { showToast: false });
                          toast.error("Failed to update member role");
                        }
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
                  reportUiError("settings.members.remove.memberRow", error, { showToast: false });
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
