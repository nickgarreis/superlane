import { RotateCcw, X } from "lucide-react";
import { DeniedAction } from "../permissions/DeniedAction";
import type { CompanyPendingInvitation } from "./types";

type PendingInvitationRowProps = {
  invitation: CompanyPendingInvitation;
  isMemberManagementDenied: boolean;
  memberManagementDeniedReason: string;
  onResendInvitation: (payload: { invitationId: string }) => Promise<void>;
  onRevokeInvitation: (payload: { invitationId: string }) => Promise<void>;
};

export function PendingInvitationRow({
  invitation,
  isMemberManagementDenied,
  memberManagementDeniedReason,
  onResendInvitation,
  onRevokeInvitation,
}: PendingInvitationRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
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
              void onResendInvitation({ invitationId: invitation.invitationId });
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
              void onRevokeInvitation({ invitationId: invitation.invitationId });
            }}
          >
            <X size={14} />
          </button>
        </DeniedAction>
      </div>
    </div>
  );
}
