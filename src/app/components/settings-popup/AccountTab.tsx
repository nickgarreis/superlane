import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { toast } from "sonner";
import { reportUiError } from "../../lib/errors";
import { UNDERLINE_INPUT_CLASS } from "../ui/controlChrome";
import type { AccountSettingsData } from "./types";
type AccountTabProps = {
  data: AccountSettingsData;
  onSave: (payload: {
    firstName: string;
    lastName: string;
    email: string;
  }) => Promise<void>;
  onUploadAvatar: (file: File) => Promise<void>;
  onRemoveAvatar: () => Promise<void>;
};
export function AccountTab({
  data,
  onSave,
  onUploadAvatar,
}: AccountTabProps) {
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [email, setEmail] = useState(data.email);
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "pending" | "saving" | "saved"
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
    setEmail(data.email);
  }, [data.firstName, data.lastName, data.email]);
  useEffect(() => {
    if (!hasEditedRef.current) {
      return;
    }
    const isSyncedWithSource =
      firstName === data.firstName &&
      lastName === data.lastName &&
      email === data.email;
    if (isSyncedWithSource) {
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
          await onSave({ firstName, lastName, email });
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
  }, [
    data.email,
    data.firstName,
    data.lastName,
    email,
    firstName,
    lastName,
    onSave,
  ]);
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
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-5 pb-6">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/gif"
          onChange={handleAvatarFile}
        />
        <div
          className="size-[88px] rounded-full overflow-hidden border border-border-soft shrink-0 group relative bg-bg-muted-surface"
          onClick={() => {
            if (!avatarBusy) {
              fileInputRef.current?.click();
            }
          }}
          onKeyDown={handleAvatarKeyDown}
          tabIndex={0}
          role="button"
          aria-label="Change avatar"
        >
          {data.avatarUrl ? (
            <img
              src={data.avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center txt-tone-faint">
              <User size={48} />
            </div>
          )}
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="txt-role-body-sm font-medium text-white">
              Change
            </span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="firstName-input"
                className="txt-role-body-md font-medium txt-tone-secondary"
              >
                First Name
              </label>
              <input
                id="firstName-input"
                type="text"
                value={firstName}
                onChange={(event) => {
                  hasEditedRef.current = true;
                  setFirstName(event.target.value);
                }}
                className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label
                htmlFor="lastName-input"
                className="txt-role-body-md font-medium txt-tone-secondary"
              >
                Last Name
              </label>
              <input
                id="lastName-input"
                type="text"
                value={lastName}
                onChange={(event) => {
                  hasEditedRef.current = true;
                  setLastName(event.target.value);
                }}
                className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
              />
            </div>
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label
                htmlFor="email-input"
                className="txt-role-body-md font-medium txt-tone-secondary"
              >
                Email Address
              </label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(event) => {
                  hasEditedRef.current = true;
                  setEmail(event.target.value);
                }}
                className={`${UNDERLINE_INPUT_CLASS} py-2 txt-role-body-lg`}
              />
            </div>
          </div>
        </div>
      </div>
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
  );
}
