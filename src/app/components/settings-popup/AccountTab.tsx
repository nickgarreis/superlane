import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { reportUiError } from "../../lib/errors";
import type { AccountSettingsData } from "./types";
import { AccountCredentialsModal } from "./account-tab/AccountCredentialsModal";
import { AccountProfileEditor } from "./account-tab/AccountProfileEditor";
import { AuthMethodRows } from "./account-tab/AuthMethodRows";
import { DiscardCredentialsChangesDialog } from "./account-tab/DiscardCredentialsChangesDialog";

const normalizeEmail = (value: string) => value.trim();

type AccountTabProps = {
  data: AccountSettingsData;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<void>;
  onRequestPasswordReset: () => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
};

export function AccountTab({
  data,
  onSave,
  onRequestPasswordReset,
  onUploadAvatar,
}: AccountTabProps) {
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [accountEmail, setAccountEmail] = useState(data.email);
  const [credentialsEmailDraft, setCredentialsEmailDraft] = useState(data.email);
  const [isCredentialsModalOpen, setIsCredentialsModalOpen] = useState(false);
  const [isCredentialsSaving, setIsCredentialsSaving] = useState(false);
  const [isDiscardCredentialsChangesOpen, setIsDiscardCredentialsChangesOpen] =
    useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "pending" | "saving" | "saved"
  >("idle");
  const [passwordResetStatus, setPasswordResetStatus] = useState<
    "idle" | "sending" | "sent" | "error"
  >("idle");
  const [avatarBusy, setAvatarBusy] = useState(false);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const hasEditedRef = React.useRef(false);
  const saveDebounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const statusResetRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const saveRunIdRef = React.useRef(0);
  const accountEmailRef = React.useRef(accountEmail);
  const credentialsEmailDraftRef = React.useRef(credentialsEmailDraft);
  const isCredentialsModalOpenRef = React.useRef(isCredentialsModalOpen);
  const credentialsEmailInputRef = React.useRef<HTMLInputElement>(null);

  const normalizedAccountEmail = normalizeEmail(accountEmail);
  const normalizedCredentialsEmailDraft = normalizeEmail(credentialsEmailDraft);
  const isCredentialsEmailDirty =
    normalizedCredentialsEmailDraft !== normalizedAccountEmail;
  const canSaveCredentials =
    isCredentialsEmailDirty &&
    normalizedCredentialsEmailDraft.length > 0 &&
    !isCredentialsSaving;

  const profileHasUnsavedChanges =
    firstName !== data.firstName || lastName !== data.lastName;

  useEffect(() => {
    accountEmailRef.current = accountEmail;
    credentialsEmailDraftRef.current = credentialsEmailDraft;
    isCredentialsModalOpenRef.current = isCredentialsModalOpen;
  }, [accountEmail, credentialsEmailDraft, isCredentialsModalOpen]);

  useEffect(
    () => () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
      if (statusResetRef.current) {
        clearTimeout(statusResetRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    saveRunIdRef.current += 1;
    hasEditedRef.current = false;
    setAutoSaveStatus("idle");
    setFirstName(data.firstName);
    setLastName(data.lastName);
    setPasswordResetStatus("idle");
  }, [data.firstName, data.lastName, data.authenticationMethod]);

  useEffect(() => {
    const popupHasDirtyDraft =
      isCredentialsModalOpenRef.current &&
      normalizeEmail(credentialsEmailDraftRef.current) !==
        normalizeEmail(accountEmailRef.current);

    setAccountEmail(data.email);
    if (!popupHasDirtyDraft) {
      setCredentialsEmailDraft(data.email);
    }
  }, [data.email]);

  useEffect(() => {
    if (!hasEditedRef.current) {
      return;
    }
    if (!profileHasUnsavedChanges) {
      setAutoSaveStatus("idle");
      return;
    }

    setAutoSaveStatus("pending");
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
    }

    const runId = saveRunIdRef.current + 1;
    saveRunIdRef.current = runId;

    saveDebounceRef.current = setTimeout(() => {
      setAutoSaveStatus("saving");
      void (async () => {
        try {
          await onSave({ firstName, lastName, email: accountEmail });
          if (runId !== saveRunIdRef.current) {
            return;
          }
          setAutoSaveStatus("saved");
          if (statusResetRef.current) {
            clearTimeout(statusResetRef.current);
          }
          statusResetRef.current = setTimeout(() => {
            if (runId === saveRunIdRef.current) {
              setAutoSaveStatus("idle");
            }
          }, 1500);
        } catch (error) {
          if (runId !== saveRunIdRef.current) {
            return;
          }
          reportUiError("settings.account.save", error, { showToast: false });
          toast.error("Failed to update account");
          setAutoSaveStatus("idle");
        }
      })();
    }, 700);

    return () => {
      if (saveDebounceRef.current) {
        clearTimeout(saveDebounceRef.current);
      }
    };
  }, [accountEmail, firstName, lastName, onSave, profileHasUnsavedChanges]);

  useEffect(() => {
    if (!isCredentialsModalOpen || isDiscardCredentialsChangesOpen) {
      return;
    }
    const focusFrame = window.requestAnimationFrame(() => {
      credentialsEmailInputRef.current?.focus();
    });
    return () => {
      window.cancelAnimationFrame(focusFrame);
    };
  }, [isCredentialsModalOpen, isDiscardCredentialsChangesOpen]);

  useEffect(() => {
    if (!isCredentialsModalOpen && !isDiscardCredentialsChangesOpen) {
      return;
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return;
      }
      event.preventDefault();
      if (isDiscardCredentialsChangesOpen) {
        setIsDiscardCredentialsChangesOpen(false);
        return;
      }
      if (isCredentialsSaving) {
        return;
      }
      if (isCredentialsEmailDirty) {
        setIsDiscardCredentialsChangesOpen(true);
        return;
      }
      setIsCredentialsModalOpen(false);
      setCredentialsEmailDraft(accountEmail);
      setPasswordResetStatus("idle");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    accountEmail,
    isCredentialsEmailDirty,
    isCredentialsModalOpen,
    isCredentialsSaving,
    isDiscardCredentialsChangesOpen,
  ]);

  const cancelPendingAutoSave = () => {
    if (saveDebounceRef.current) {
      clearTimeout(saveDebounceRef.current);
      saveDebounceRef.current = null;
    }
    if (statusResetRef.current) {
      clearTimeout(statusResetRef.current);
      statusResetRef.current = null;
    }
    saveRunIdRef.current += 1;
    setAutoSaveStatus("idle");
  };

  const handleAvatarFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    setAvatarBusy(true);
    try {
      await onUploadAvatar(file);
      toast.success("Profile picture updated");
    } catch (error) {
      reportUiError("settings.account.uploadAvatar", error, {
        showToast: false,
      });
      toast.error("Failed to update profile picture");
    } finally {
      setAvatarBusy(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (!avatarBusy) {
        fileInputRef.current?.click();
      }
    }
  };

  const handleSendPasswordReset = async () => {
    if (passwordResetStatus === "sending") {
      return;
    }
    setPasswordResetStatus("sending");
    try {
      await onRequestPasswordReset();
      setPasswordResetStatus("sent");
    } catch (error) {
      reportUiError("settings.account.passwordReset", error, {
        showToast: false,
      });
      setPasswordResetStatus("error");
    }
  };

  const handleOpenCredentialsModal = () => {
    setCredentialsEmailDraft(accountEmail);
    setPasswordResetStatus("idle");
    setIsDiscardCredentialsChangesOpen(false);
    setIsCredentialsModalOpen(true);
  };

  const handleRequestCloseCredentialsModal = () => {
    if (isCredentialsSaving) {
      return;
    }
    if (isCredentialsEmailDirty) {
      setIsDiscardCredentialsChangesOpen(true);
      return;
    }
    setIsCredentialsModalOpen(false);
    setCredentialsEmailDraft(accountEmail);
    setPasswordResetStatus("idle");
  };

  const handleDiscardCredentialsChanges = () => {
    setCredentialsEmailDraft(accountEmail);
    setIsDiscardCredentialsChangesOpen(false);
    setIsCredentialsModalOpen(false);
    setPasswordResetStatus("idle");
  };

  const handleSaveCredentials = async () => {
    if (!canSaveCredentials) {
      return;
    }

    cancelPendingAutoSave();
    setIsCredentialsSaving(true);

    try {
      await onSave({
        firstName,
        lastName,
        email: normalizedCredentialsEmailDraft,
      });
      setAccountEmail(normalizedCredentialsEmailDraft);
      setCredentialsEmailDraft(normalizedCredentialsEmailDraft);
      hasEditedRef.current = false;
      setAutoSaveStatus("idle");
      setIsCredentialsModalOpen(false);
      setIsDiscardCredentialsChangesOpen(false);
      setPasswordResetStatus("idle");
    } catch (error) {
      reportUiError("settings.account.save", error, { showToast: false });
      toast.error("Failed to update account");
    } finally {
      setIsCredentialsSaving(false);
    }
  };

  const authProviderEmail = normalizeEmail(accountEmail);

  return (
    <>
      <div className="flex flex-col gap-5">
        <AccountProfileEditor
          firstName={firstName}
          lastName={lastName}
          avatarUrl={data.avatarUrl}
          avatarBusy={avatarBusy}
          fileInputRef={fileInputRef}
          onAvatarFile={handleAvatarFile}
          onAvatarKeyDown={handleAvatarKeyDown}
          onFirstNameChange={(nextValue) => {
            hasEditedRef.current = true;
            setFirstName(nextValue);
          }}
          onLastNameChange={(nextValue) => {
            hasEditedRef.current = true;
            setLastName(nextValue);
          }}
        />
        <AuthMethodRows
          data={data}
          authProviderEmail={authProviderEmail}
          onOpenCredentialsModal={handleOpenCredentialsModal}
        />
        <div className="pt-2 flex justify-end min-h-6">
          {autoSaveStatus !== "idle" && (
            <span className="txt-role-body-sm txt-tone-faint">
              {autoSaveStatus === "pending" && "Changes pending..."}
              {autoSaveStatus === "saving" && "Auto-saving..."}
              {autoSaveStatus === "saved" && "Saved"}
            </span>
          )}
        </div>
      </div>

      <AccountCredentialsModal
        isOpen={isCredentialsModalOpen}
        credentialsEmailDraft={credentialsEmailDraft}
        onChangeCredentialsEmailDraft={setCredentialsEmailDraft}
        credentialsEmailInputRef={credentialsEmailInputRef}
        onClose={handleRequestCloseCredentialsModal}
        onSendPasswordReset={() => {
          void handleSendPasswordReset();
        }}
        passwordResetStatus={passwordResetStatus}
        isCredentialsSaving={isCredentialsSaving}
        canSaveCredentials={canSaveCredentials}
        onSaveCredentials={() => {
          void handleSaveCredentials();
        }}
      />

      <DiscardCredentialsChangesDialog
        isOpen={isDiscardCredentialsChangesOpen}
        onClose={() => {
          setIsDiscardCredentialsChangesOpen(false);
        }}
        onKeepEditing={() => {
          setIsDiscardCredentialsChangesOpen(false);
        }}
        onDiscardChanges={handleDiscardCredentialsChanges}
      />
    </>
  );
}
