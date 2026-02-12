import { useCallback, useEffect, useRef, useState } from "react";
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
  layout?: "panel" | "button";
};

export function SettingsDangerZoneSection({
  company,
  onSoftDeleteWorkspace,
  showTitle = true,
  layout = "panel",
}: SettingsDangerZoneSectionProps) {
  const [deletingWorkspace, setDeletingWorkspace] = useState(false);
  const [showDeleteWorkspaceDialog, setShowDeleteWorkspaceDialog] =
    useState(false);
  const [deleteWorkspaceConfirmation, setDeleteWorkspaceConfirmation] =
    useState("");
  const deleteWorkspaceInputRef = useRef<HTMLInputElement | null>(null);
  const cancelDeleteWorkspaceButtonRef = useRef<HTMLButtonElement | null>(null);
  const confirmDeleteWorkspaceButtonRef = useRef<HTMLButtonElement | null>(null);
  const canDeleteWorkspace = company?.capability.canDeleteWorkspace ?? false;
  const workspaceDeleteDeniedReason = getWorkspaceDeleteDeniedReason(
    company?.viewerRole,
  );
  const isDeleteConfirmationMatched =
    deleteWorkspaceConfirmation.trim() === WORKSPACE_DELETE_CONFIRMATION_TEXT;

  const closeDeleteWorkspaceDialog = useCallback(() => {
    if (deletingWorkspace) {
      return;
    }
    setShowDeleteWorkspaceDialog(false);
    setDeleteWorkspaceConfirmation("");
  }, [deletingWorkspace]);

  const openDeleteWorkspaceDialog = () => {
    if (!canDeleteWorkspace || deletingWorkspace) {
      return;
    }
    setDeleteWorkspaceConfirmation("");
    setShowDeleteWorkspaceDialog(true);
  };

  useEffect(() => {
    if (!showDeleteWorkspaceDialog) {
      return;
    }

    const focusFrame = window.requestAnimationFrame(() => {
      deleteWorkspaceInputRef.current?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDeleteWorkspaceDialog();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = [
        deleteWorkspaceInputRef.current,
        cancelDeleteWorkspaceButtonRef.current,
        confirmDeleteWorkspaceButtonRef.current,
      ].filter(
        (
          element,
        ): element is HTMLInputElement | HTMLButtonElement =>
          element !== null && !element.disabled,
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement | null;

      if (
        !activeElement
        || !focusableElements.includes(
          activeElement as HTMLInputElement | HTMLButtonElement,
        )
      ) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
        return;
      }

      if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeDeleteWorkspaceDialog, showDeleteWorkspaceDialog]);

  if (!company) {
    return null;
  }

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

  const deleteWorkspaceAction = (
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
        className={
          layout === "button"
            ? "h-[36px] shrink-0 rounded-full border border-red-500/25 bg-red-500/10 px-4 txt-role-body-sm font-medium text-red-300 transition-colors cursor-pointer hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap"
            : "px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg txt-role-body-md font-medium transition-colors cursor-pointer disabled:opacity-50"
        }
      >
        {deletingWorkspace ? "Deleting..." : "Delete Workspace"}
      </button>
    </DeniedAction>
  );

  const deleteWorkspaceDialog = showDeleteWorkspaceDialog ? (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 px-4"
      onClick={closeDeleteWorkspaceDialog}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          closeDeleteWorkspaceDialog();
        }
      }}
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
          ref={deleteWorkspaceInputRef}
          type="text"
          value={deleteWorkspaceConfirmation}
          autoFocus
          disabled={deletingWorkspace}
          onChange={(event) => setDeleteWorkspaceConfirmation(event.target.value)}
          placeholder="DELETE"
          aria-label="Delete workspace confirmation"
          className={`${SOFT_INPUT_CLASS} mt-2 h-[42px] w-full rounded-lg px-3 txt-role-body-md`}
        />
        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={cancelDeleteWorkspaceButtonRef}
            type="button"
            onClick={closeDeleteWorkspaceDialog}
            disabled={deletingWorkspace}
            className={`h-[38px] rounded-full px-4 txt-role-body-sm font-medium cursor-pointer ${SECONDARY_ACTION_BUTTON_CLASS}`}
          >
            Cancel
          </button>
          <button
            ref={confirmDeleteWorkspaceButtonRef}
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
  ) : null;

  if (layout === "button") {
    return (
      <>
        {deleteWorkspaceAction}
        {deleteWorkspaceDialog}
      </>
    );
  }

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
        {deleteWorkspaceAction}
      </div>
      {deleteWorkspaceDialog}
    </div>
  );
}
