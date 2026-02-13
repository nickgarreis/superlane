import { RotateCcw, X } from "lucide-react";
import { DeniedAction } from "../permissions/DeniedAction";
import { SidebarTag } from "../sidebar/SidebarTag";
import { GHOST_ICON_BUTTON_CLASS, ROW_HOVER_CLASS } from "../ui/controlChrome";
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
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 ${ROW_HOVER_CLASS}`}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-bg-avatar-fallback flex items-center justify-center txt-role-body-sm font-medium text-white overflow-hidden border border-border-soft">
          {invitation.email.charAt(0).toUpperCase()}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="txt-role-body-lg font-medium txt-tone-muted">
              {invitation.email}
            </span>
            <SidebarTag tone="pending">Pending</SidebarTag>
          </div>
          <span className="txt-role-body-sm txt-tone-faint">
            {invitation.requestedRole} · expires
            {new Date(invitation.expiresAt).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 self-end sm:self-auto">
        <DeniedAction
          denied={isMemberManagementDenied}
          reason={memberManagementDeniedReason}
          tooltipAlign="right"
        >
          <button
            title="Resend invitation"
            className={`${GHOST_ICON_BUTTON_CLASS} p-1.5 txt-tone-faint hover:txt-tone-accent cursor-pointer disabled:opacity-50`}
            disabled={isMemberManagementDenied}
            onClick={() => {
              if (isMemberManagementDenied) {
                return;
              }
              void onResendInvitation({
                invitationId: invitation.invitationId,
              });
            }}
          >
            <RotateCcw size={14} />
          </button>
        </DeniedAction>
        <DeniedAction
          denied={isMemberManagementDenied}
          reason={memberManagementDeniedReason}
          tooltipAlign="right"
        >
          <button
            title="Revoke invitation"
            className={`${GHOST_ICON_BUTTON_CLASS} p-1.5 txt-tone-faint hover:bg-red-500/10 hover:text-red-400 cursor-pointer disabled:opacity-50`}
            disabled={isMemberManagementDenied}
            onClick={() => {
              if (isMemberManagementDenied) {
                return;
              }
              void onRevokeInvitation({
                invitationId: invitation.invitationId,
              });
            }}
          >
            <X size={14} />
          </button>
        </DeniedAction>
      </div>
    </div>
  );
}
