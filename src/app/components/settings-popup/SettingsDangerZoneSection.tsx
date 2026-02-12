import { useState } from "react";
import { toast } from "sonner";
import { reportUiError } from "../../lib/errors";
import { getWorkspaceDeleteDeniedReason } from "../../lib/permissionRules";
import { DeniedAction } from "../permissions/DeniedAction";
import {
  SECONDARY_ACTION_BUTTON_CLASS,
  SOFT_INPUT_CLASS,
} from "../ui/controlChrome";
import type { CompanySettingsData } from "./types";

const WORKSPACE_DELETE_CONFIRMATION_TEXT = "DELETE";

type SettingsDangerZoneSectionProps = {
  company: CompanySettingsData | null;
  onSoftDeleteWorkspace: () => Promise<void>;
  showTitle?: boolean;
};

export function SettingsDangerZoneSection({
  company,
  onSoftDeleteWorkspace,
  showTitle = true,
}: SettingsDangerZoneSectionProps) {
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [showDeleteWorkspaceDialog, setShowDeleteWorkspaceDialog] =
    useState(false);
  const [deleteWorkspaceConfirmation, setDeleteWorkspaceConfirmation] =
    useState("");
  const canDeleteWorkspace = company?.capability.canDeleteWorkspace ?? false;
  const workspaceDeleteDeniedReason = getWorkspaceDeleteDeniedReason(
    company?.viewerRole,
  );
  const isDeleteConfirmationMatched =
    deleteWorkspaceConfirmation.trim() === WORKSPACE_DELETE_CONFIRMATION_TEXT;

  if (!company) {
    return null;
  }

  const closeDeleteWorkspaceDialog = () => {
    if (deletingWorkspace) {
      return;
    }
    setShowDeleteWorkspaceDialog(false);
    setDeleteWorkspaceConfirmation("");
  };

  const openDeleteWorkspaceDialog = () => {
    if (!canDeleteWorkspace || deletingWorkspace) {
      return;
    }
    setDeleteWorkspaceConfirmation("");
    setShowDeleteWorkspaceDialog(true);
  };

  const handleSoftDeleteWorkspace = async () => {
    if (!isDeleteConfirmationMatched || deletingWorkspace) {
      return;
    }
    setDeletingWorkspace(true);
    try {
      await onSoftDeleteWorkspace();
      toast.success("Workspace deleted");
      setShowDeleteWorkspaceDialog(false);
      setDeleteWorkspaceConfirmation("");
    } catch (error) {
      reportUiError("settings.company.deleteWorkspace", error, {
        showToast: false,
      });
      toast.error("Failed to delete workspace");
    } finally {
      setDeletingWorkspace(false);
    }
  };

  return (
    <div className={`flex flex-col ${showTitle ? "gap-4" : "gap-0"}`}>
      {showTitle && (
        <h3 className="txt-role-body-md font-medium text-red-300 uppercase tracking-wider">
          Danger Zone
        </h3>
      )}
      <div className="flex items-center justify-between p-4 border border-red-500/10 rounded-xl bg-red-500/[0.02]">
        <div className="flex flex-col gap-1">
          <span className="txt-role-body-lg font-medium txt-tone-primary">
            Delete Workspace
          </span>
          <span className="txt-role-body-sm txt-tone-subtle">
            Permanently disables this workspace in the app and removes member
            access.
          </span>
        </div>
        <DeniedAction
          denied={!canDeleteWorkspace}
          reason={workspaceDeleteDeniedReason}
          tooltipAlign="right"
        >
          <button
            type="button"
            onClick={() => {
              if (!canDeleteWorkspace) {
                return;
              }
              openDeleteWorkspaceDialog();
            }}
            disabled={!canDeleteWorkspace || deletingWorkspace}
            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg txt-role-body-md font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            {deletingWorkspace ? "Deleting..." : "Delete Workspace"}
          </button>
        </DeniedAction>
      </div>
      {showDeleteWorkspaceDialog && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 px-4"
          onClick={closeDeleteWorkspaceDialog}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-workspace-title"
            className="w-full max-w-[460px] rounded-[24px] border border-popup-border-subtle bg-bg-popup p-6 shadow-popup-dialog"
            onClick={(event) => event.stopPropagation()}
          >
            <h4
              id="delete-workspace-title"
              className="txt-role-body-lg font-medium txt-tone-primary"
            >
              Delete workspace permanently?
            </h4>
            <p className="mt-2 txt-role-body-sm txt-tone-subtle txt-leading-body">
              This action is irreversible and will permanently remove:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 txt-role-body-sm txt-tone-subtle">
              <li>Workspace settings and branding</li>
              <li>Projects, tasks, files, and comments</li>
              <li>Workspace members and invitations</li>
            </ul>
            <p className="mt-4 txt-role-body-sm txt-tone-subtle">
              Type <span className="font-semibold txt-tone-primary">DELETE</span>{" "}
              to confirm workspace deletion.
            </p>
            <input
              type="text"
              value={deleteWorkspaceConfirmation}
              autoFocus
              disabled={deletingWorkspace}
              onChange={(event) =>
                setDeleteWorkspaceConfirmation(event.target.value)
              }
              placeholder="DELETE"
              aria-label="Delete workspace confirmation"
              className={`${SOFT_INPUT_CLASS} mt-2 h-[42px] w-full rounded-lg px-3 txt-role-body-md`}
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteWorkspaceDialog}
                disabled={deletingWorkspace}
                className={`h-[38px] rounded-full px-4 txt-role-body-sm font-medium cursor-pointer ${SECONDARY_ACTION_BUTTON_CLASS}`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSoftDeleteWorkspace();
                }}
                disabled={!isDeleteConfirmationMatched || deletingWorkspace}
                className="h-[38px] rounded-full border border-red-500/30 bg-red-500/10 px-4 txt-role-body-sm font-medium text-red-300 transition-colors cursor-pointer hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-45"
              >
                {deletingWorkspace ? "Deleting..." : "Delete Workspace"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
