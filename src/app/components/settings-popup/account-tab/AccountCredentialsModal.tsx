import React from "react";
import {
  PRIMARY_ACTION_BUTTON_CLASS,
  SECONDARY_ACTION_BUTTON_CLASS,
  UNDERLINE_INPUT_CLASS,
} from "../../ui/controlChrome";

const PASSWORD_PLACEHOLDER = "••••••••••";

type AccountCredentialsModalProps = {
  isOpen: boolean;
  credentialsEmailDraft: string;
  onChangeCredentialsEmailDraft: (value: string) => void;
  credentialsEmailInputRef: React.RefObject<HTMLInputElement>;
  onClose: () => void;
  onSendPasswordReset: () => void;
  passwordResetStatus: "idle" | "sending" | "sent" | "error";
  isCredentialsSaving: boolean;
  canSaveCredentials: boolean;
  onSaveCredentials: () => void;
};

export function AccountCredentialsModal({
  isOpen,
  credentialsEmailDraft,
  onChangeCredentialsEmailDraft,
  credentialsEmailInputRef,
  onClose,
  onSendPasswordReset,
  passwordResetStatus,
  isCredentialsSaving,
  canSaveCredentials,
  onSaveCredentials,
}: AccountCredentialsModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/55 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-credentials-modal-title"
        className="w-full max-w-[520px] rounded-[24px] border border-popup-border-subtle bg-bg-popup p-6 shadow-popup-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <h4
          id="account-credentials-modal-title"
          className="txt-role-body-lg font-medium txt-tone-primary"
        >
          Edit email & password
        </h4>
        <div className="mt-5 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="credentials-email-input"
              className="txt-role-body-md font-medium txt-tone-secondary"
            >
              Email Address
            </label>
            <input
              id="credentials-email-input"
              ref={credentialsEmailInputRef}
              type="email"
              value={credentialsEmailDraft}
              onChange={(event) => {
                onChangeCredentialsEmailDraft(event.target.value);
              }}
              className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label
              htmlFor="credentials-password-input"
              className="txt-role-body-md font-medium txt-tone-secondary"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="credentials-password-input"
                type="text"
                value={PASSWORD_PLACEHOLDER}
                readOnly
                aria-readonly="true"
                className={`${UNDERLINE_INPUT_CLASS} w-full py-2 pr-28 txt-role-body-lg cursor-default`}
              />
              <button
                type="button"
                onClick={onSendPasswordReset}
                disabled={passwordResetStatus === "sending"}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-7 rounded-md border border-border-soft bg-surface-hover-soft px-2 txt-role-body-xs txt-tone-primary hover:bg-surface-active-soft transition-colors disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {passwordResetStatus === "sending"
                  ? "Sending..."
                  : "Reset password"}
              </button>
            </div>
            {passwordResetStatus === "sent" && (
              <span className="txt-role-body-sm txt-tone-faint">
                Reset link sent to your account email.
              </span>
            )}
            {passwordResetStatus === "error" && (
              <span className="txt-role-body-sm txt-tone-danger">
                Could not send reset link. Please try again.
              </span>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isCredentialsSaving}
            className={`h-[38px] rounded-full px-4 txt-role-body-sm font-medium cursor-pointer ${SECONDARY_ACTION_BUTTON_CLASS}`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSaveCredentials}
            disabled={!canSaveCredentials}
            className={`h-[38px] rounded-full px-4 txt-role-body-sm font-medium cursor-pointer ${PRIMARY_ACTION_BUTTON_CLASS}`}
          >
            {isCredentialsSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
