import { SECONDARY_ACTION_BUTTON_CLASS } from "../../ui/controlChrome";

type DiscardCredentialsChangesDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onKeepEditing: () => void;
  onDiscardChanges: () => void;
};

export function DiscardCredentialsChangesDialog({
  isOpen,
  onClose,
  onKeepEditing,
  onDiscardChanges,
}: DiscardCredentialsChangesDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/55 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="discard-credentials-title"
        className="w-full max-w-[420px] rounded-[24px] border border-popup-border-subtle bg-bg-popup p-6 shadow-popup-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <h4
          id="discard-credentials-title"
          className="txt-role-body-lg font-medium txt-tone-primary"
        >
          Discard email changes?
        </h4>
        <p className="mt-2 txt-role-body-sm txt-tone-subtle txt-leading-body">
          You have unsaved email edits. Discard them and close this dialog?
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onKeepEditing}
            className={`h-[38px] rounded-full px-4 txt-role-body-sm font-medium cursor-pointer ${SECONDARY_ACTION_BUTTON_CLASS}`}
          >
            Keep editing
          </button>
          <button
            type="button"
            onClick={onDiscardChanges}
            className="h-[38px] rounded-full border border-red-600 bg-red-600 px-4 txt-role-body-sm font-medium text-white transition-colors cursor-pointer hover:bg-red-500 hover:border-red-500"
          >
            Discard changes
          </button>
        </div>
      </div>
    </div>
  );
}
